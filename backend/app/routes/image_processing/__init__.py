from fastapi import APIRouter

# 导入路由模块
from .translate import router as translate_router
from .calorie import router as calorie_router
from .navigate import router as navigate_router

# 创建主路由
router = APIRouter(prefix="/image_processing")  # 添加 prefix

# 注册子路由
router.include_router(
    translate_router,
    prefix="/translate",
    tags=["translate"]
)

router.include_router(
    calorie_router,
    prefix="/calorie",
    tags=["calorie"]
)

router.include_router(
    navigate_router,
    prefix="/navigate",
    tags=["navigate"]
)

print("\n=== 路由注册完成 ===") 