from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 明确使用 pymysql
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/ai_glasses"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 