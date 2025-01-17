from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class NavigationRecord(Base):
    __tablename__ = "navigation_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_id = Column(Integer, ForeignKey("image_records.id"))
    
    # 障碍物信息
    obstacles = Column(JSON)  # 存储检测到的障碍物信息
    safe_path = Column(JSON)  # 存储建议的安全路径
    distance = Column(Float)  # 与最近障碍物的距离
    warning_level = Column(String)  # 'safe', 'caution', 'danger'
    is_safe = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联
    user = relationship("User", back_populates="navigation_records")
    image = relationship("ImageRecord", back_populates="navigation_records") 