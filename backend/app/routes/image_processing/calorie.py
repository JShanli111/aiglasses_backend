from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import ImageRecord
from app.core.ai_service import AIService
import os
from datetime import datetime
import logging

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/calorie",
    tags=["calorie"]
)
ai_service = AIService()

# 确保在路由外部定义全局变量
messenger_processing_active = False

@router.post("/messenger", response_model=dict)
async def toggle_messenger_processing(
    db: Session = Depends(get_db)
):
    """切换 Messenger 图片卡路里分析状态"""
    global messenger_processing_active
    
    try:
        # 切换状态
        messenger_processing_active = not messenger_processing_active
        logger.info(f"Calorie analysis active status changed to: {messenger_processing_active}")
        
        if messenger_processing_active:
            logger.info("Started messenger calorie analysis")
            return {
                "status": "success",
                "message": "Messenger calorie analysis started",
                "is_active": True,
                "process_type": "calorie",
                "result": "✅ 已开启卡路里分析功能\n- 请在 Messenger 页面运行书签脚本\n- 新图片将自动进行卡路里分析\n- 再次点击此按钮可停止处理"
            }
        else:
            logger.info("Stopped messenger calorie analysis")
            return {
                "status": "success",
                "message": "Messenger calorie analysis stopped",
                "is_active": False,
                "process_type": None,
                "result": "⏹️ 已停止卡路里分析功能\n- 书签脚本将停止处理新图片\n- 再次点击此按钮可重新开启"
            }
            
    except Exception as e:
        logger.error(f"Error toggling messenger calorie analysis: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"卡路里分析功能切换失败: {str(e)}"
        )

@router.post("/upload", response_model=dict)
async def process_uploaded_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """处理上传的图片进行卡路里分析"""
    logger.info("Processing uploaded image")
    
    try:
        # 确保 uploads 目录存在
        os.makedirs("uploads", exist_ok=True)
        
        # 生成文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join("uploads", filename)
        
        # 保存文件
        try:
            contents = await file.read()
            with open(file_path, 'wb') as f:
                f.write(contents)
            logger.info(f"File saved: {file_path}")
        except Exception as e:
            logger.error(f"File save error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

        # 保存记录到数据库
        try:
            record = ImageRecord(
                url=file_path,
                source="upload",
                status="processing",
                process_type="calorie"
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            logger.info(f"Database record created: {record.id}")
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            os.remove(file_path)  # 删除已保存的文件
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        # 调用 AI 服务进行分析
        try:
            result = await ai_service.analyze_image(file_path, "calorie")
            if not result:
                raise HTTPException(status_code=500, detail="AI analysis failed")

            # 更新记录状态
            record.status = "processed"
            record.result = str(result)
            db.commit()
            logger.info(f"Analysis completed for record: {record.id}")

            return {
                "status": "success",
                "file_path": file_path,
                "result": result
            }
        except Exception as e:
            logger.error(f"AI analysis error: {str(e)}")
            record.status = "failed"
            db.commit()
            raise HTTPException(status_code=500, detail=f"AI analysis error: {str(e)}")

    except Exception as e:
        logger.error(f"General error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))