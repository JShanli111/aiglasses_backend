from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import schemas, services
from ..database import get_db
from ..auth.routes import get_current_user
from ..auth.models import User
from ..image_collector.models import ImageRecord

router = APIRouter()
analysis_service = services.CalorieAnalysisService()

@router.post("/analyze/{image_id}", response_model=schemas.CalorieAnalysis)
async def analyze_image(
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
        
    # 处理分析
    analysis = await analysis_service.process_image(image)
    if not analysis:
        raise HTTPException(status_code=500, detail="分析失败")
        
    return analysis

@router.get("/analyses", response_model=List[schemas.CalorieAnalysis])
async def get_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 获取用户的所有分析记录
    analyses = db.query(CalorieAnalysis).join(ImageRecord).filter(
        ImageRecord.user_id == current_user.id
    ).all()
    return analyses 