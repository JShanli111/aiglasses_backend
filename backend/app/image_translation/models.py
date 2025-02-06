from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Translation(Base):
    __tablename__ = "translations"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("image_records.id"))
    original_text = Column(Text)
    translated_text = Column(Text)
    source_language = Column(String)
    target_language = Column(String, default="zh")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联
    image = relationship("ImageRecord", back_populates="translations") 