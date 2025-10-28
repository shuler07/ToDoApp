from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String
from database import Base


class UserModel(Base):
    __tablename__ = "user"

    uid: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String, nullable=False, default="User")
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
