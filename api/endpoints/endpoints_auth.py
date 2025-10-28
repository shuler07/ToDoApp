from fastapi import Request, Response, Depends, APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import select, update
from pwdlib import PasswordHash

from limiter import limiter
from auth import authentication
from smtp import verification_enabled, email_sender
from database import sessionDep
from models.usermodel import UserModel
from schemas.userschema import (
    UserEmailSchema,
    UserNewPasswordSchema,
    UserCredsSchema,
    UserUsernameSchema,
    UserSchema,
)
from constants import LIMIT_VALUE_AUTH, SCOPE_AUTH

router_auth = APIRouter(prefix="/auth", tags=["Authentication"])
hasher = PasswordHash.recommended()


@router_auth.get(
    "/validation/access_token",
    description="Accepts access token from cookie. Returns True if access token is fresh and valid, False otherwise",
    summary="Validate access token",
)
@limiter.shared_limit(LIMIT_VALUE_AUTH, SCOPE_AUTH)
async def authenticate_user(
    request: Request,
    session: sessionDep,
    access_payload=Depends(authentication.auth.access_token_required),
):
    try:
        uid = int(access_payload.sub)
        if uid is None:
            return JSONResponse("Invalid access token", 401)

        query = select(UserModel).where(UserModel.uid == uid)
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if user is None:
            return JSONResponse("User not found", 404)

        return {"isLoggedIn": True, "username": user.username, "email": user.email}
    except Exception as e:
        print("Something went wrong [Authenticate user]", e)

        return {"isLoggedIn": False}


@router_auth.get(
    "/validation/refresh_token",
    description="Accepts refresh token from cookie. Returns True and sends access and refresh tokens into cookie if refresh token is fresh and valid, False otherwise",
    summary="Create new access token from refresh token",
)
@limiter.shared_limit(LIMIT_VALUE_AUTH, SCOPE_AUTH)
async def refresh_user(
    response: Response,
    request: Request,
    session: sessionDep,
    refresh_payload=Depends(authentication.auth.refresh_token_required),
):
    try:
        uid = int(refresh_payload.sub)

        if uid is None:
            return JSONResponse("Invalid refresh token", 401)

        query = select(UserModel).where(UserModel.uid == uid)
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if user is None:
            return JSONResponse("User not found", 404)

        new_access_token = authentication.auth.create_access_token(str(uid))
        new_refresh_token = authentication.auth.create_refresh_token(str(uid))
        response.set_cookie(
            authentication.config.JWT_ACCESS_COOKIE_NAME, new_access_token
        )
        response.set_cookie(
            authentication.config.JWT_REFRESH_COOKIE_NAME, new_refresh_token
        )

        return {"isLoggedIn": True, "username": user.username, "email": user.email}
    except Exception as e:
        print("Something went wrong [Refresh user]", e)

        return {"isLoggedIn": False}


@router_auth.post(
    "/register",
    description="Accepts user object. Returns True and sends verification email if creds are valid and user doesnt exist, False otherwise",
    summary="Register user",
)
@limiter.shared_limit(LIMIT_VALUE_AUTH, SCOPE_AUTH)
async def register(newUser: UserSchema, request: Request, session: sessionDep):
    try:
        query = select(UserModel).where(UserModel.email == newUser.email)
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if user is not None:
            return {"isRegistered": False, "error": "exists"}

        hashed_password = hasher.hash(newUser.password)

        if verification_enabled:
            sub = f"{newUser.email} {hashed_password} {newUser.username} ."
            access_token = authentication.auth.create_access_token(sub)

            email_link = f"http://localhost:8000/auth/verification/{access_token}"
            email_msg = f"Subject: Verify your email for ToDoApp\n\n\
Follow the link to verify your email: {email_link}\n\
(If you didnt registered on this service, just ignore the message)"

            email_sender.send_message(newUser.email, email_msg)

            return {"isRegistered": True}
        else:
            new_user = UserSchema(
                email=newUser.email,
                password=hashed_password,
                username=newUser.username,
            )
            await session.add(new_user)
            await session.commit()

            return {"isRegistered": True}
    except Exception as e:
        print("Something went wrong [Register]", e)

        return {"isRegistered": False, "error": "unknown"}


@router_auth.post(
    "/login",
    description="Accepts creds object. Returns True and sends access and refresh tokens into cookie if creds valid, False otherwise",
    summary="Login user",
)
@limiter.shared_limit(LIMIT_VALUE_AUTH, SCOPE_AUTH)
async def login(
    creds: UserCredsSchema, response: Response, request: Request, session: sessionDep
):
    try:
        query = select(UserModel).where(UserModel.email == creds.email)
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if user is None:
            return {"isLoggedIn": False}

        if not hasher.verify(creds.password, user.password):
            return {"isLoggedIn": False}

        uid = str(user.uid)

        access_token = authentication.auth.create_access_token(uid)
        refresh_token = authentication.auth.create_refresh_token(uid)
        response.set_cookie(authentication.config.JWT_ACCESS_COOKIE_NAME, access_token)
        response.set_cookie(
            authentication.config.JWT_REFRESH_COOKIE_NAME, refresh_token
        )

        return {"isLoggedIn": True, "username": user.username, "email": user.email}
    except Exception as e:
        print("Something went wrong [Login]", e)

        return {"isLoggedIn": False}


@router_auth.get(
    "/verification/{access_token}",
    description="Accepts access token from url. Creates new user with email and password from token",
    summary="Verify email",
)
@limiter.shared_limit(LIMIT_VALUE_AUTH, SCOPE_AUTH)
async def verify(access_token: str, request: Request, session: sessionDep):
    data = authentication.decode_token(access_token)
    if not data["success"]:
        return {data.message}

    email, hashed_password, username, oldEmail = data["data"].split()

    try:
        if oldEmail == ".":
            user = UserModel(email=email, password=hashed_password, username=username)
            session.add(user)
            await session.commit()

            return {
                "Successfully registered! You can back to site and login into your account"
            }
        else:
            query = (
                update(UserModel).values(email=email).where(UserModel.email == oldEmail)
            )
            await session.execute(query)
            await session.commit()

            return {
                "Successfully changed email! You can back to site and login into your account"
            }

    except Exception as e:
        print("Something went wrong [Verify]", e)

        return {"Something went wrong, try again later"}


@router_auth.put(
    "/user/username",
    description="Accepts username and access token from cookie. Returns True if username correct and access token valid, False otherwise",
    summary="Update username",
)
@limiter.shared_limit(LIMIT_VALUE_AUTH, SCOPE_AUTH)
async def update_username(
    userUsernameSchema: UserUsernameSchema,
    request: Request,
    session: sessionDep,
    access_payload=Depends(authentication.auth.access_token_required),
):
    uid = int(access_payload.sub)
    username = userUsernameSchema.username
    try:
        query = update(UserModel).values(username=username).where(UserModel.uid == uid)
        await session.execute(query)
        await session.commit()

        return {"success": True}
    except Exception as e:
        print("Something went wrong [Update username]", e)

        return {"success": False}


@router_auth.put(
    "/user/email",
    description="Accepts email and access token from cookie. Returns True if email correct and access token valid, False otherwise",
    summary="Update email",
    dependencies=[Depends(authentication.auth.refresh_token_required)],
)
@limiter.shared_limit(limit_value=LIMIT_VALUE_AUTH, scope=SCOPE_AUTH)
async def update_email(
    userEmailSchema: UserEmailSchema,
    request: Request,
    response: Response,
    session: sessionDep,
    access_payload=Depends(authentication.auth.access_token_required),
):
    uid = int(access_payload.sub)
    email = userEmailSchema.email
    try:
        query = select(UserModel).where(UserModel.email == email)
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if user is not None:
            return {"success": False, "error": "exists"}

        query = select(UserModel).where(UserModel.uid == uid)
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if user is None:
            return {"success": False, "error": "User not found"}

        sub = f"{email} {user.password} {user.username} {user.email}"
        access_token = authentication.auth.create_access_token(sub)

        email_link = f"http://localhost:8000/auth/verification/{access_token}"
        email_msg = f"Subject: Verify your email for ToDoApp\n\n\
Follow the link to verify your email: {email_link}\n\
(If you didnt registered on this service, just ignore the message)"

        email_sender.send_message(email, email_msg)

        response.delete_cookie(authentication.config.JWT_ACCESS_COOKIE_NAME)
        response.delete_cookie(authentication.config.JWT_REFRESH_COOKIE_NAME)

        return {"success": True}
    except Exception as e:
        print("Something went wrong [Update email]", e)

        return {"success": False}


@router_auth.put(
    "/user/password",
    description="Accepts current and new passwords and access token from cookie. Returns True if passwords correct and access token valid, False otherwise",
    summary="Update password",
)
@limiter.shared_limit(limit_value=LIMIT_VALUE_AUTH, scope=SCOPE_AUTH)
async def update_password(
    userNewPasswordSchema: UserNewPasswordSchema,
    request: Request,
    session: sessionDep,
    access_payload=Depends(authentication.auth.access_token_required),
):
    uid = int(access_payload.sub)
    password = userNewPasswordSchema.password
    new_password = userNewPasswordSchema.new_password
    try:
        query = select(UserModel.password).where(UserModel.uid == uid)
        result = await session.execute(query)
        old_hashed_password = result.scalar_one_or_none()

        if old_hashed_password is None:
            return {"success": False, "error": "User not found"}

        if hasher.verify(password, old_hashed_password):
            new_hashed_password = hasher.hash(new_password)

            query = (
                update(UserModel)
                .values(password=new_hashed_password)
                .where(UserModel.password == old_hashed_password)
            )
            await session.execute(query)
            await session.commit()

            return {"success": True}
        else:
            return {"success": False, "error": "Wrong password"}
    except Exception as e:
        print("Something went wrong [Update password]", e)

        return {"success": False, "error": "unknown"}


@router_auth.delete(
    "/signout",
    description="Accepts access and refresh tokens from cookie. Returns True and removes access and refresh tokens from cookie if access and refresh tokens are fresh and valid, False otherwise",
    summary="Sign out user",
    dependencies=[
        Depends(authentication.auth.access_token_required),
        Depends(authentication.auth.refresh_token_required),
    ],
)
@limiter.shared_limit(LIMIT_VALUE_AUTH, SCOPE_AUTH)
async def sign_out(response: Response, request: Request):
    response.delete_cookie(authentication.config.JWT_ACCESS_COOKIE_NAME)
    response.delete_cookie(authentication.config.JWT_REFRESH_COOKIE_NAME)

    return {"isLoggedIn": False}
