from fastapi import APIRouter
from .image_processing import router as image_router
from .websocket import router as websocket_router

# 创建主路由，不添加前缀
router = APIRouter()

# 注册子路由
router.include_router(image_router)
router.include_router(websocket_router)
 