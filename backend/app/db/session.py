from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 使用 SQLite 数据库
SQLALCHEMY_DATABASE_URL = "sqlite:///./ai_glasses.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 