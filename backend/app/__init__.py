from fastapi import FastAPI
from .routes.image_processing import router as image_router
from .routes import websocket, auth
import pymysql


app = FastAPI()

# 注册路由
app.include_router(auth.router, prefix="/api/v1")
app.include_router(image_router, prefix="/api/v1")
app.include_router(websocket.router) 

pymysql.install_as_MySQLdb()

