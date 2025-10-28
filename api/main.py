from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from authx.exceptions import MissingTokenError, JWTDecodeError
from contextlib import asynccontextmanager

from limiter import limiter
from endpoints.endpoints_auth import router_auth
from endpoints.endpoints_notes import router_notes
from database import pg


# lifespan (before yield - on start, after yield - on exit)
@asynccontextmanager
async def lifespan(
    app: FastAPI,
):
    await pg.create_all_tables()
    yield


app = FastAPI(
    title="ToDoApp",
    description="Create and store your notes with comfort",
    summary="Notes manager",
    lifespan=lifespan,
    version="1.0",
)

app.state.limiter = limiter

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(MissingTokenError)
def missing_token_error_handler(request: Request, exc: MissingTokenError):
    if "access" in str(exc):
        return JSONResponse("Access token not found", 401)
    else:
        return JSONResponse("Refresh token not found", 401)


@app.exception_handler(JWTDecodeError)
def jwt_decode_token_error_handler(request: Request, exc: JWTDecodeError):
    if "expired" in str(exc):
        return JSONResponse("Token is expired", 401)
    else:
        return JSONResponse("Token decode error", 401)


app.include_router(router_auth)
app.include_router(router_notes)
