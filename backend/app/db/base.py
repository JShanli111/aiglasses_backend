from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import registry

mapper_registry = registry()
Base = mapper_registry.generate_base()

# 导入现有的 models.py
from app.models import *  # 使用现有的 models.py 