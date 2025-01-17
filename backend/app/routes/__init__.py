from fastapi import APIRouter
from .image_processing import translate, calorie, navigate
from .auth import router as auth_router  # 导入认证路由
from .image_processing.translate import router as translate_router

router = APIRouter()

# 注册所有路由
router.include_router(auth_router, prefix="/api/v1")  # 添加 /api/v1 前缀
router.include_router(translate_router) # 翻译路由
router.include_router(calorie.router)   # 卡路里识别路由
router.include_router(navigate.router)  # 导航避障路由 
 