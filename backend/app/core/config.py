from pydantic import BaseSettings
from typing import List
import os
from dotenv import load_dotenv
from pathlib import Path

# 加载.env文件
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Glasses API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS配置
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    
    # JWT配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"  # JWT 算法设置
    
    # 文件上传配置
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # 外部AI服务配置
    EXTERNAL_AI_URL: str = os.getenv("EXTERNAL_AI_URL", "https://open.bigmodel.cn/api/paas/v4/images")
    AI_API_KEY: str = os.getenv("ZHIPU_AI_KEY", "your-zhipu-api-key-here")
    
    class Config:
        env_file = ".env"

settings = Settings() 

# 确保上传目录存在
os.makedirs(settings.UPLOAD_DIR, exist_ok=True) 