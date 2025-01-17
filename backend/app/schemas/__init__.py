from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ImageResponse(BaseModel):
    original_text: Optional[str] = None
    translated_text: Optional[str] = None
    result: Optional[Dict[str, Any]] = None 

class ImageRecordBase(BaseModel):
    url: str
    source: str
    status: str
    process_type: str
    result: Optional[str] = None
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

class ImageRecordResponse(ImageRecordBase):
    id: int 