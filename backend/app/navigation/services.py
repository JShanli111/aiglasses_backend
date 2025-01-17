import requests
from PIL import Image
import io
from .models import NavigationRecord
from ..database import SessionLocal
from ..image_collector.models import ImageRecord
from ..core.config import settings
from ..core.ai_client import AIClient

class NavigationService:
    def __init__(self):
        self.ai_client = AIClient()
        
    async def download_image(self, url: str) -> bytes:
        response = requests.get(url)
        response.raise_for_status()
        return response.content
        
    async def process_image(self, image_record: ImageRecord) -> NavigationRecord:
        try:
            # 下载图片
            image_data = await self.download_image(image_record.url)
            
            # 调用AI服务
            result = self.ai_client.analyze_image(image_data, 'navigation')
            
            # 保存分析结果
            db = SessionLocal()
            navigation_record = NavigationRecord(
                user_id=image_record.user_id,
                image_id=image_record.id,
                obstacles=result.get('obstacles', []),
                safe_path=result.get('safe_path', {}),
                distance=result.get('distance', 0),
                warning_level=result.get('warning_level', 'safe'),
                is_safe=result.get('warning_level', 'safe') == 'safe'
            )
            db.add(navigation_record)
            db.commit()
            db.refresh(navigation_record)
            db.close()
            
            return navigation_record
            
        except Exception as e:
            print(f"导航分析失败: {str(e)}")
            return None 