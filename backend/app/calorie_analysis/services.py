import requests
from PIL import Image
import io
from .models import CalorieAnalysis
from ..database import SessionLocal
from ..image_collector.models import ImageRecord
from ..core.config import settings
from ..core.ai_client import AIClient

class CalorieAnalysisService:
    def __init__(self):
        self.ai_client = AIClient()
        
    async def download_image(self, url: str) -> bytes:
        response = requests.get(url)
        response.raise_for_status()
        return response.content
        
    async def process_image(self, image_record: ImageRecord) -> CalorieAnalysis:
        try:
            # 下载图片
            image_data = await self.download_image(image_record.url)
            
            # 调用AI服务
            result = self.ai_client.analyze_image(image_data, 'calories')
            
            # 保存分析结果
            db = SessionLocal()
            analysis = CalorieAnalysis(
                image_id=image_record.id,
                total_calories=result.get('total_calories', 0),
                food_items=result.get('food_items', []),
                confidence_score=result.get('confidence_score', 0)
            )
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
            db.close()
            
            return analysis
            
        except Exception as e:
            print(f"卡路里分析失败: {str(e)}")
            return None 