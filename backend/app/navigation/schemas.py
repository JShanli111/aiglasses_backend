from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Optional

class Obstacle(BaseModel):
    type: str
    confidence: float
    distance: float
    position: Dict[str, float]

class SafePath(BaseModel):
    direction: str
    angle: float
    confidence: float

class NavigationBase(BaseModel):
    obstacles: List[Obstacle]
    safe_path: SafePath
    distance: float
    warning_level: str
    is_safe: bool

class NavigationCreate(NavigationBase):
    user_id: int
    image_id: int

class Navigation(NavigationBase):
    id: int
    user_id: int
    image_id: int
    created_at: datetime

    class Config:
        from_attributes = True 