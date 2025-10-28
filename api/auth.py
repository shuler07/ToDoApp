from authx import AuthX, AuthXConfig
from jwt.exceptions import ExpiredSignatureError
from jwt import decode


class Authentication:

    def __init__(self):
        config = AuthXConfig()
        config.JWT_SECRET_KEY = "verysecretkatthatnobodyknows"
        config.JWT_TOKEN_LOCATION = ["cookies"]
        config.JWT_ALGORITHM = "HS256"
        config.JWT_COOKIE_CSRF_PROTECT = False

        self.config = config
        self.auth = AuthX(config)

    def decode_token(self, token: str) -> dict:
        config = self.config

        try:
            payload: dict = decode(
                token, key=config.JWT_SECRET_KEY, algorithms=config.JWT_ALGORITHM
            )
            return {"success": True, "data": payload.get("sub")}
        except ExpiredSignatureError:
            return {
                "success": False,
                "message": "Link is expired, please register again",
            }
        except Exception as e:
            print("Something went wrong [Decode token]", e)
            return {
                "success": False,
                "message": "Something went wrong, try again later",
            }


authentication = Authentication()
