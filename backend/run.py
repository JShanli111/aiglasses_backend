import sys
import os
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.image_processing.translate import router as translate_router
from app.routes.image_processing.navigate import router as navigate_router
from app.routes.image_processing.calorie import router as calorie_router
from app.routes.websocket import router as websocket_router
from typing import Dict
import logging
import json
from app.routes import websocket, image_processing

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 获取项目根目录
BACKEND_DIR = Path(__file__).parent.absolute()

app = FastAPI(title="AI Glasses API")

# 存储活跃的 WebSocket 连接
active_connections: Dict[int, WebSocket] = {}

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 确保所有功能初始状态为关闭
image_processing.translate.messenger_processing_active = False
image_processing.calorie.messenger_processing_active = False
image_processing.navigate.messenger_processing_active = False

# WebSocket 路由
@app.websocket("/api/v1/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # 等待消息
            data = await websocket.receive_text()
            logger.info(f"Received message: {data}")
            
            # 发送响应
            await websocket.send_text(f"Message received: {data}")
            
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        if websocket in active_connections.values():
            user_id = [k for k, v in active_connections.items() if v == websocket][0]
            del active_connections[user_id]

# 注册路由
app.include_router(auth_router, prefix="/api/v1")
app.include_router(translate_router, prefix="/api/v1")
app.include_router(navigate_router, prefix="/api/v1")
app.include_router(calorie_router, prefix="/api/v1")
app.include_router(websocket_router)

@app.get("/")
async def root():
    return {"message": "Welcome to AI Glasses API"}

if __name__ == "__main__":
    print(f"后端目录: {BACKEND_DIR}")
    
    import uvicorn
    uvicorn.run(
        "run:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(BACKEND_DIR)]
    )