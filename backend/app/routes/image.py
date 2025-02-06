from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
import os
from app.database import get_db
from app.models import ImageRecord
from app.core.ai_service import AIService
from app.core.dependencies import get_current_user
from app.core.config import settings
from datetime import datetime
import aiohttp
import uuid

router = APIRouter()
ai_service = AIService()

# 确保上传目录存在
UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def download_image(url: str) -> bytes:
    """从URL下载图片"""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                raise HTTPException(status_code=400, detail="Could not download image")
            return await response.read()

# 翻译功能
@router.post("/translate/url/{record_id}")
async def translate_messenger_image(
    record_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """处理来自messenger的图片URL - 翻译"""
    record = db.query(ImageRecord).filter(
        ImageRecord.id == record_id,
        ImageRecord.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Image record not found")
    
    try:
        # 下载图片
        image_data = await download_image(record.url)
        file_name = f"{uuid.uuid4()}.jpg"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        # 保存图片
        with open(file_path, "wb") as f:
            f.write(image_data)
        
        # 翻译处理
        result = await ai_service.process_image_translation(file_path)
        
        # 更新记录
        record.status = "processed"
        db.commit()
        
        return result
    except Exception as e:
        record.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translate/file")
async def translate_uploaded_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """处理本地上传的图片 - 翻译"""
    try:
        file_name = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 创建记录
        record = ImageRecord(
            url=file_path,
            source="upload",
            status="processing",
            process_type="translate",
            user_id=current_user.id,
            created_at=datetime.utcnow()
        )
        db.add(record)
        db.commit()
        
        # 翻译处理
        result = await ai_service.process_image_translation(file_path)
        
        record.status = "processed"
        db.commit()
        
        return result
    except Exception as e:
        if 'record' in locals():
            record.status = "failed"
            db.commit()
        raise HTTPException(status_code=500, detail=str(e))

# 卡路里识别功能
@router.post("/calorie/url/{record_id}")
async def analyze_calorie_messenger_image(
    record_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """处理来自messenger的图片URL - 卡路里识别"""
    record = db.query(ImageRecord).filter(
        ImageRecord.id == record_id,
        ImageRecord.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Image record not found")
    
    try:
        image_data = await download_image(record.url)
        file_name = f"{uuid.uuid4()}.jpg"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as f:
            f.write(image_data)
        
        result = await ai_service.process_image_calorie(file_path)
        
        record.status = "processed"
        db.commit()
        
        return result
    except Exception as e:
        record.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calorie/file")
async def analyze_calorie_uploaded_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """处理本地上传的图片 - 卡路里识别"""
    try:
        file_name = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        record = ImageRecord(
            url=file_path,
            source="upload",
            status="processing",
            process_type="calorie",
            user_id=current_user.id,
            created_at=datetime.utcnow()
        )
        db.add(record)
        db.commit()
        
        result = await ai_service.process_image_calorie(file_path)
        
        record.status = "processed"
        db.commit()
        
        return result
    except Exception as e:
        if 'record' in locals():
            record.status = "failed"
            db.commit()
        raise HTTPException(status_code=500, detail=str(e))

# 导航避障功能
@router.post("/navigate/url/{record_id}")
async def navigate_messenger_image(
    record_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """处理来自messenger的图片URL - 导航避障"""
    record = db.query(ImageRecord).filter(
        ImageRecord.id == record_id,
        ImageRecord.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Image record not found")
    
    try:
        image_data = await download_image(record.url)
        file_name = f"{uuid.uuid4()}.jpg"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as f:
            f.write(image_data)
        
        result = await ai_service.process_image_navigation(file_path)
        
        record.status = "processed"
        db.commit()
        
        return result
    except Exception as e:
        record.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/navigate/file")
async def navigate_uploaded_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """处理本地上传的图片 - 导航避障"""
    try:
        file_name = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        record = ImageRecord(
            url=file_path,
            source="upload",
            status="processing",
            process_type="navigate",
            user_id=current_user.id,
            created_at=datetime.utcnow()
        )
        db.add(record)
        db.commit()
        
        result = await ai_service.process_image_navigation(file_path)
        
        record.status = "processed"
        db.commit()
        
        return result
    except Exception as e:
        if 'record' in locals():
            record.status = "failed"
            db.commit()
        raise HTTPException(status_code=500, detail=str(e)) 