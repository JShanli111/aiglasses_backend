from fastapi import WebSocket
import json
from ..database import SessionLocal
from .models import ImageRecord
from ..auth.models import User

class MessengerWebSocket:
    def __init__(self):
        self.active_connections = {}  # 使用字典存储连接和用户的关系

    async def connect(self, websocket: WebSocket, user: User):
        await websocket.accept()
        self.active_connections[websocket] = user
        print(f"WebSocket 客户端已连接 - 用户: {user.email}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            user = self.active_connections[websocket]
            del self.active_connections[websocket]
            print(f"WebSocket 客户端已断开 - 用户: {user.email}")

    async def handle_message(self, websocket: WebSocket, data: str):
        try:
            message = json.loads(data)
            if message["type"] == "image_url":
                image_url = message["url"]
                user = self.active_connections[websocket]
                
                # 保存图片URL到数据库
                db = SessionLocal()
                image_record = ImageRecord(
                    url=image_url,
                    source="messenger",
                    status="pending",
                    user_id=user.id  # 添加用户ID
                )
                db.add(image_record)
                db.commit()
                db.close()

                # 返回确认消息
                await websocket.send_json({
                    "status": "success",
                    "message": "图片URL已接收"
                })

        except Exception as e:
            await websocket.send_json({
                "status": "error",
                "message": str(e)
            }) 