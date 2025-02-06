from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import schemas, services
from ..database import get_db
from ..auth.routes import get_current_user
from ..auth.models import User
from ..image_collector.models import ImageRecord

router = APIRouter()
translation_service = services.TranslationService()

@router.post("/translate/{image_id}", response_model=schemas.Translation)
async def translate_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 检查图片是否存在且属于当前用户
    image = db.query(ImageRecord).filter(
        ImageRecord.id == image_id,
        ImageRecord.user_id == current_user.id
    ).first()
    
    if not image:
        raise HTTPException(status_code=404, detail="图片不存在")
        
    # 处理翻译
    translation = await translation_service.process_image(image)
    if not translation:
        raise HTTPException(status_code=500, detail="翻译失败")
        
    return translation

@router.get("/translations", response_model=List[schemas.Translation])
async def get_translations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 获取用户的所有翻译记录
    translations = db.query(Translation).join(ImageRecord).filter(
        ImageRecord.user_id == current_user.id
    ).all()
    return translations 