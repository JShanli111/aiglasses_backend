from sqlalchemy.orm import Session
from app.models import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash
from datetime import datetime

class CRUDUser:
    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        """创建新用户"""
        db_obj = User(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),  # 使用 get_password_hash 加密密码
            full_name=obj_in.full_name,
            phone=obj_in.phone,
            device_id=obj_in.device_id,
            is_active=True,
            is_superuser=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        try:
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except Exception as e:
            db.rollback()
            print(f"Error creating user: {str(e)}")  # 添加错误日志
            raise

crud_user = CRUDUser() 