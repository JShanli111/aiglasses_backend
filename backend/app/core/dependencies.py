from fastapi import Depends, HTTPException, status, WebSocket
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_token
from app.models import User
from app.core.auth import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    email = verify_token(token)
    if email is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user 

async def get_current_user_ws(
    websocket: WebSocket,
    db = Depends(get_db)
) -> User:
    try:
        # 从 cookie 或 query 参数获取 token
        token = websocket.cookies.get("access_token") or websocket.query_params.get("token")
        
        if not token:
            return None
            
        payload = decode_access_token(token)
        user = db.query(User).filter(User.id == payload.get("sub")).first()
        return user
        
    except Exception as e:
        print(f"WebSocket auth error: {str(e)}")
        return None 