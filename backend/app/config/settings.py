from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os
from typing import List

load_dotenv()

class Settings(BaseSettings):
    # 基础配置
    PROJECT_NAME: str = "AI Glasses API"
    VERSION: str = "1.0.0"
    
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    
    # JWT配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-123")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI配置
    ZHIPU_AI_KEY: str = os.getenv("ZHIPU_AI_KEY", "")
    CUSTOM_AI_BASE_URL: str = os.getenv("CUSTOM_AI_BASE_URL", "https://open.bigmodel.cn/api/paas/v3")
    
    # CORS配置
    BACKEND_CORS_ORIGINS: List[str] = ["*"]  # 允许所有来源，或者指定具体的域名

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings() 