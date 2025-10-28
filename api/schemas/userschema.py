from pydantic import BaseModel, Field, EmailStr


class UserEmailSchema(BaseModel):
    email: EmailStr


class UserPasswordSchema(BaseModel):
    password: str = Field(min_length=8)


class UserNewPasswordSchema(UserPasswordSchema):
    new_password: str = Field(min_length=8)


class UserCredsSchema(UserEmailSchema, UserPasswordSchema):
    pass


class UserUsernameSchema(BaseModel):
    username: str = Field(min_length=4)


class UserSchema(UserCredsSchema, UserUsernameSchema):
    pass
