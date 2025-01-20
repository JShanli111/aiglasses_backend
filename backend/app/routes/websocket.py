from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from typing import Dict, Optional
import logging
import json
from app.core.ai_service import AIService
from app.routes.image_processing import translate, calorie, navigate
from urllib.parse import urlparse
import asyncio

# 设置日志级别为 INFO
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建路由器，不设置前缀
router = APIRouter()
ai_service = AIService()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.ai_service = AIService()
        self.processing: Dict[str, bool] = {}
        self.connection_locks: Dict[str, asyncio.Lock] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        try:
            # 创建连接锁
            if session_id not in self.connection_locks:
                self.connection_locks[session_id] = asyncio.Lock()

            async with self.connection_locks[session_id]:
                # 检查是否已经存在连接
                if session_id in self.active_connections:
                    try:
                        await self.active_connections[session_id].close()
                    except Exception:
                        pass
                    del self.active_connections[session_id]

                # 接受新连接
                await websocket.accept()
                self.active_connections[session_id] = websocket
                self.processing[session_id] = False
                logger.info(f"WebSocket连接成功: {session_id}")

        except Exception as e:
            logger.error(f"WebSocket连接错误: {str(e)}")
            try:
                await websocket.close()
            except Exception:
                pass
            raise HTTPException(status_code=400, detail="连接失败")

    async def disconnect(self, session_id: str):
        try:
            if session_id in self.connection_locks:
                async with self.connection_locks[session_id]:
                    if session_id in self.active_connections:
                        await self.active_connections[session_id].close()
                        del self.active_connections[session_id]
                    if session_id in self.processing:
                        del self.processing[session_id]
                    logger.info(f"WebSocket断开连接: {session_id}")
        except Exception as e:
            logger.error(f"断开连接时出错: {str(e)}")
        finally:
            if session_id in self.connection_locks:
                del self.connection_locks[session_id]

    async def process_message(self, message: str, session_id: str, analysis_type: str):
        try:
            if self.processing.get(session_id):
                await self.send_message({"status": "error", "message": "正在处理中，请稍后再试"}, session_id)
                return

            self.processing[session_id] = True
            await self.send_message({"status": "processing", "message": "开始处理..."}, session_id)

            # 解析消息
            try:
                data = json.loads(message)
                logger.info(f"收到消息数据: {data}")  # 添加日志
                
                # 检查消息格式
                if not isinstance(data, dict):
                    await self.send_message({"status": "error", "message": "消息格式错误"}, session_id)
                    return
                    
                # 获取图片URL，支持多种可能的键名
                image_url = data.get("image_url") or data.get("imageUrl") or data.get("url") or data.get("image")
                
                if not image_url:
                    logger.error(f"消息中未找到图片URL: {data}")  # 添加错误日志
                    await self.send_message({"status": "error", "message": "消息中未找到图片URL"}, session_id)
                    return

                if not isinstance(image_url, str):
                    await self.send_message({"status": "error", "message": "图片URL格式错误"}, session_id)
                    return

                # 验证URL格式
                try:
                    parsed_url = urlparse(image_url)
                    if not all([parsed_url.scheme, parsed_url.netloc]):
                        await self.send_message({"status": "error", "message": "无效的图片URL"}, session_id)
                        return
                except Exception as e:
                    logger.error(f"URL解析错误: {str(e)}")
                    await self.send_message({"status": "error", "message": "URL格式错误"}, session_id)
                    return

                logger.info(f"开始处理图片: {image_url}")  # 添加日志

                # 调用AI服务
                result = await self.ai_service.analyze_image(
                    image_source=image_url,
                    analysis_type=analysis_type,
                    input_type='url'
                )

                if result:
                    await self.send_message({
                        "status": "success",
                        "result": result.get("result", "分析失败"),
                        "confidence": result.get("confidence", 0)
                    }, session_id)
                else:
                    await self.send_message({"status": "error", "message": "分析失败"}, session_id)

            except json.JSONDecodeError:
                logger.error(f"JSON解析错误: {message}")  # 添加错误日志
                await self.send_message({"status": "error", "message": "消息格式错误，请发送正确的JSON格式"}, session_id)
                return

        except Exception as e:
            logger.error(f"处理消息错误: {str(e)}")
            await self.send_message({"status": "error", "message": f"处理错误: {str(e)}"}, session_id)
        finally:
            self.processing[session_id] = False

    async def send_message(self, message: dict, session_id: str):
        try:
            if session_id in self.active_connections:
                await self.active_connections[session_id].send_json(message)
                logger.debug(f"发送消息成功: {message}")
        except Exception as e:
            logger.error(f"发送消息失败: {str(e)}")
            await self.disconnect(session_id)

manager = ConnectionManager()

@router.websocket("/ws/{process_type}")
async def websocket_endpoint(websocket: WebSocket, process_type: str):
    if process_type not in ["translate", "calorie", "navigate"]:
        await websocket.close(code=4000, reason="无效的处理类型")
        return
        
    session_id = str(hash(websocket))
    logger.info(f"新的WebSocket连接请求 - 类型: {process_type}, 会话ID: {session_id}")
    
    try:
        await manager.connect(websocket, session_id)
        
        # 检查功能状态
        is_active = {
            'translate': translate.messenger_processing_active,
            'calorie': calorie.messenger_processing_active,
            'navigate': navigate.messenger_processing_active
        }.get(process_type, False)
        
        logger.info(f"功能状态 - {process_type}: {is_active}")
        
        # 发送状态消息
        await websocket.send_json({
            "type": "status",
            "active": is_active,
            "message": f"{process_type} 功能{'已激活' if is_active else '未激活'}"
        })
        
        try:
            while True:
                try:
                    message = await websocket.receive_text()
                    await manager.process_message(message, session_id, process_type)
                except WebSocketDisconnect:
                    logger.info(f"WebSocket连接断开: {session_id}")
                    await manager.disconnect(session_id)
                    break
                except Exception as e:
                    logger.error(f"WebSocket错误: {str(e)}")
                    await manager.disconnect(session_id)
                    break
        except Exception as e:
            logger.error(f"WebSocket错误: {str(e)}")
        finally:
            manager.disconnect(session_id)
            
    except Exception as e:
        logger.error(f"WebSocket连接错误: {str(e)}")
        try:
            await websocket.close(code=4002, reason=str(e))
        except:
            pass 