from fastapi import APIRouter, UploadFile, File, WebSocket, Depends
from .manual_upload import handle_manual_upload
from .messenger_ws import MessengerWebSocket
from ..auth.routes import get_current_user
from ..auth.models import User

router = APIRouter()
ws_manager = MessengerWebSocket()

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    return await handle_manual_upload(file, current_user)

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str
):
    # 验证WebSocket连接的token
    try:
        user = await get_current_user(token=token)
        await ws_manager.connect(websocket, user)
        try:
            while True:
                data = await websocket.receive_text()
                await ws_manager.handle_message(websocket, data)
        except Exception as e:
            print(f"WebSocket错误: {str(e)}")
        finally:
            ws_manager.disconnect(websocket)
    except Exception as e:
        await websocket.close(code=4000, reason="认证失败") 