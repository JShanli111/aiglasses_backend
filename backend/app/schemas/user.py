from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

# 用于创建用户的基础模型
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    device_id: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False

# 用于创建用户时的请求模型
class UserCreate(UserBase):
    password: str

# 用于响应的用户模型
class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Token 模型
class Token(BaseModel):
    access_token: str
    token_type: str

# Token 数据模型
class TokenData(BaseModel):
    email: Optional[str] = None 