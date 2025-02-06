from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TranslationBase(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str = "zh"

class TranslationCreate(TranslationBase):
    image_id: int

class Translation(TranslationBase):
    id: int
    image_id: int
    created_at: datetime

    class Config:
        from_attributes = True 