from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class CalorieAnalysis(Base):
    __tablename__ = "calorie_analyses"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("image_records.id"))
    total_calories = Column(Float)
    food_items = Column(JSON)  # 存储识别出的食物项及其卡路里
    confidence_score = Column(Float)  # 识别置信度
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联
    image = relationship("ImageRecord", back_populates="calorie_analyses") 