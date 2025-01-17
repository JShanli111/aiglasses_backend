from fastapi import APIRouter
from app.routes.image_processing import router as image_router
from app.routes.auth import router as auth_router
from app.routes.websocket import router as websocket_router

api_router = APIRouter()

# 注册所有路由
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(image_router, prefix="/images", tags=["image-processing"])
api_router.include_router(websocket_router, tags=["websocket"]) 