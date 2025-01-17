from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class ImageRecord(Base):
    __tablename__ = "image_records"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    source = Column(String)  # 'messenger' 或 'manual_upload'
    status = Column(String)  # 'pending', 'processed', 'failed'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 添加用户关联
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="images")
    
    # 添加翻译关联
    translations = relationship("Translation", back_populates="image")
    
    # 添加卡路里分析关联
    calorie_analyses = relationship("CalorieAnalysis", back_populates="image")
    
    # 添加导航记录关联
    navigation_records = relationship("NavigationRecord", back_populates="image") 