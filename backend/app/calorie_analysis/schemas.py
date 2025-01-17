from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict

class FoodItem(BaseModel):
    food_name: str
    calories: float
    confidence: float

class CalorieAnalysisBase(BaseModel):
    total_calories: float
    food_items: List[FoodItem]
    confidence_score: float

class CalorieAnalysisCreate(CalorieAnalysisBase):
    image_id: int

class CalorieAnalysis(CalorieAnalysisBase):
    id: int
    image_id: int
    created_at: datetime

    class Config:
        from_attributes = True 