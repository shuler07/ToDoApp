from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, ARRAY, ForeignKey
from database import Base


class NotesModel(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uid: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("user.uid", name="fk_notes_user_uid", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    text: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=True, default=[])
