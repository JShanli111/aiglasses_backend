from fastapi import APIRouter
from . import translate, calorie, navigate

router = APIRouter(prefix="/images")

router.include_router(translate.router)
router.include_router(calorie.router)
router.include_router(navigate.router) 