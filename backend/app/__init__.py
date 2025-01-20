from fastapi import FastAPI
from .routes import router
import pymysql

app = FastAPI(title="AI Glasses API")

# 注册主路由
app.include_router(router, prefix="/api/v1")

pymysql.install_as_MySQLdb()

