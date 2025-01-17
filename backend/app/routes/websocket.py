from fastapi import APIRouter, WebSocket
from typing import Dict
import logging
import json
import aiohttp
from app.core.ai_service import AIService
from app.routes.image_processing import translate, calorie, navigate

# 设置日志级别为 INFO
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
ai_service = AIService()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        try:
            self.active_connections[session_id] = websocket
            logger.info(f"New WebSocket connection: {session_id}")
        except Exception as e:
            logger.error(f"连接管理错误: {str(e)}")
            if session_id in self.active_connections:
                del self.active_connections[session_id]

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(f"WebSocket disconnected: {session_id}")

    async def process_message(self, session_id: str, message: str, process_type: str):
        websocket = self.active_connections.get(session_id)
        if not websocket:
            return
        
        # 修改状态检查
        is_active = {
            'translate': translate.messenger_processing_active,
            'calorie': calorie.messenger_processing_active,
            'navigate': navigate.messenger_processing_active
        }.get(process_type, False)
        
        if not is_active:
            await websocket.send_json({
                "type": "error",
                "message": f"{process_type} 功能未激活"
            })
            return
            
        try:
            data = json.loads(message)
            if data.get("type") == "image_url":
                image_url = data.get("url")
                if not image_url:
                    await websocket.send_json({
                        "type": "error",
                        "message": "未提供图片URL"
                    })
                    return
                    
                try:
                    # 调用 AI 服务进行分析
                    result = await ai_service.analyze_image(
                        image_url, 
                        analysis_type=process_type,
                        input_type='url'
                    )
                    
                    if result:
                        await websocket.send_json({
                            "type": "result",
                            "result": result.get('result', '分析失败')
                        })
                    else:
                        await websocket.send_json({
                            "type": "error",
                            "message": "分析失败"
                        })
                except Exception as e:
                    logger.error(f"AI分析错误: {str(e)}")
                    await websocket.send_json({
                        "type": "error",
                        "message": f"分析错误: {str(e)}"
                    })
                    
        except Exception as e:
            logger.error(f"[{process_type}] 处理错误: {str(e)}")
            await websocket.send_json({
                "type": "error",
                "message": f"处理错误: {str(e)}"
            })

manager = ConnectionManager()

@router.websocket("/api/v1/ws/{process_type}")
async def websocket_endpoint(websocket: WebSocket, process_type: str):
    if process_type not in ["translate", "calorie", "navigate"]:
        await websocket.close(code=4000, reason="Invalid process type")
        return
        
    session_id = str(hash(websocket))
    
    try:
        # 先接受连接
        await websocket.accept()
        logger.info(f"WebSocket连接已接受: {session_id}")
        
        # 检查功能状态
        is_active = {
            'translate': translate.messenger_processing_active,
            'calorie': calorie.messenger_processing_active,
            'navigate': navigate.messenger_processing_active
        }.get(process_type, False)
        
        logger.info(f"WebSocket连接: {session_id}, 类型: {process_type}, 状态: {is_active}")
        
        # 发送当前状态
        await websocket.send_json({
            "type": "status",
            "active": is_active,
            "message": f"{process_type} 功能{'已激活' if is_active else '未激活'}"
        })
        
        if not is_active:
            await websocket.close(code=4001, reason=f"{process_type} 功能未激活")
            return
        
        # 建立连接管理
        await manager.connect(websocket, session_id)
        
        try:
            while True:
                data = await websocket.receive_text()
                # 再次检查状态
                current_active = {
                    'translate': translate.messenger_processing_active,
                    'calorie': calorie.messenger_processing_active,
                    'navigate': navigate.messenger_processing_active
                }.get(process_type, False)
                
                if not current_active:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"{process_type} 功能未激活"
                    })
                    break
                    
                await manager.process_message(session_id, data, process_type)
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