from fastapi import UploadFile, HTTPException
import aiofiles
import os
from datetime import datetime
from ..database import SessionLocal
from .models import ImageRecord
from ..auth.models import User

async def handle_manual_upload(file: UploadFile, current_user: User):
    try:
        # 生成唯一文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        upload_dir = "uploads"
        
        # 确保上传目录存在
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)

        # 保存文件
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)

        # 保存记录到数据库
        db = SessionLocal()
        image_record = ImageRecord(
            url=file_path,
            source="manual_upload",
            status="pending",
            user_id=current_user.id  # 添加用户ID
        )
        db.add(image_record)
        db.commit()
        db.refresh(image_record)
        db.close()

        return {
            "status": "success",
            "filename": filename,
            "message": "文件上传成功"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 