from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Union
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
        orm_mode = True

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
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class ImageRecordResponse(ImageRecordBase):
    id: int 

class MessengerResponse(BaseModel):
    status: str
    message: str
    is_active: bool
    process_type: Optional[str]
    result: str

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "status": "success",
                "message": "Processing started",
                "is_active": True,
                "process_type": "translate",
                "result": "Processing result"
            }
        }

class LocalImageRequest(BaseModel):
    file_path: str = Field(..., description="服务器上的图片路径")

class BaseResponse(BaseModel):
    status: str = Field(..., description="处理状态")
    message: Optional[str] = Field(None, description="处理消息")
    error: Optional[str] = Field(None, description="错误信息")

class ImageProcessResponse(BaseResponse):
    file_path: str = Field(..., description="处理的图片路径")
    result: Dict[str, Any] = Field(..., description="处理结果")

    class Config:
        schema_extra = {
            "example": {
                "status": "success",
                "file_path": "/path/to/image.jpg",
                "result": {
                    "text": "处理结果",
                    "confidence": 0.95
                }
            }
        }

class ImageRecord(BaseModel):
    id: int
    url: str
    source: str
    status: str
    process_type: str
    result: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        validate_assignment = True

# 添加请求体模型
class ImageUploadRequest(BaseModel):
    file: bytes

    class Config:
        arbitrary_types_allowed = True

class UploadImageResponse(ImageProcessResponse):
    """上传图片响应模型"""
    pass

class UploadImageRequest(BaseModel):
    """上传图片请求模型"""
    file: Any

    class Config:
        schema_extra = {
            "example": {
                "file": "binary_file_data"
            }
        } 