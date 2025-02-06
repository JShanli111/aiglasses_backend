from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ImageBase(BaseModel):
    process_type: str  # 'translation', 'calorie', 'navigation'

class ImageCreate(ImageBase):
    file_path: str
    
class ImageResponse(ImageBase):
    id: int
    user_id: int
    file_path: str
    original_text: Optional[str] = None
    translated_text: Optional[str] = None
    calorie_info: Optional[Dict[str, Any]] = None
    navigation_info: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True 