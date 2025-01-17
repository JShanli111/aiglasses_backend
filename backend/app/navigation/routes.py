from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import schemas, services
from ..database import get_db
from ..auth.routes import get_current_user
from ..auth.models import User
from ..image_collector.models import ImageRecord

router = APIRouter()
navigation_service = services.NavigationService()

@router.post("/analyze/{image_id}", response_model=schemas.Navigation)
async def analyze_navigation(
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
        
    # 处理导航分析
    navigation = await navigation_service.process_image(image)
    if not navigation:
        raise HTTPException(status_code=500, detail="导航分析失败")
        
    return navigation

@router.get("/history", response_model=List[schemas.Navigation])
async def get_navigation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 获取用户的导航历史记录
    records = db.query(NavigationRecord).filter(
        NavigationRecord.user_id == current_user.id
    ).all()
    return records 