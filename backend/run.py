from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
from app.db.init_db import init_db
import uvicorn

app = FastAPI(
    title="Image Processing API",
    description="Image translation, calorie analysis and navigation services",
    version="1.0.0"
)

# 初始化数据库
init_db()

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由，添加全局前缀
app.include_router(router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Image processing service is running"}

if __name__ == "__main__":
    uvicorn.run(
        "run:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        ws='websockets'  # 添加 WebSocket 支持
    )