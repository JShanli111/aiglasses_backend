from app.db.session import engine
from app.models import Base, ImageRecord  # 只导入我们需要的模型

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("Database initialized!") 