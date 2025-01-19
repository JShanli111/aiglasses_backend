from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine
from app.models.user import User
from app.core.security import get_password_hash
from app.core.config import settings

def init_db(db: Session) -> None:
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    
    # 检查是否已存在超级用户
    user = db.query(User).filter(User.email == settings.FIRST_SUPERUSER).first()
    if not user:
        # 创建超级管理员
        user = User(
            email=settings.FIRST_SUPERUSER,
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            full_name="Initial Super User",
            is_superuser=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        print("Created first superuser") 