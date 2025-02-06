import requests
from PIL import Image
import io
from .models import Translation
from ..database import SessionLocal
from ..image_collector.models import ImageRecord
from ..core.config import settings
from ..core.ai_client import AIClient

class TranslationService:
    def __init__(self):
        self.ai_client = AIClient()
        
    async def download_image(self, url: str) -> bytes:
        response = requests.get(url)
        response.raise_for_status()
        return response.content
        
    async def process_image(self, image_record: ImageRecord) -> Translation:
        try:
            # 下载图片
            image_data = await self.download_image(image_record.url)
            
            # 调用AI服务
            result = self.ai_client.analyze_image(image_data, 'translate')
            
            # 保存翻译结果
            db = SessionLocal()
            translation = Translation(
                image_id=image_record.id,
                original_text=result.get('original_text', ''),
                translated_text=result.get('translated_text', ''),
                source_language=result.get('source_language', ''),
                target_language=result.get('target_language', 'zh')
            )
            db.add(translation)
            db.commit()
            db.refresh(translation)
            db.close()
            
            return translation
            
        except Exception as e:
            print(f"翻译失败: {str(e)}")
            return None 