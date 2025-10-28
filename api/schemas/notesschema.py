from pydantic import BaseModel, Field


class NoteIdSchema(BaseModel):
    id: int


class CreateNoteSchema(BaseModel):
    title: str = Field(min_length=1)
    text: str = Field(min_length=1)
    tags: list[str]


class NoteSchema(NoteIdSchema, CreateNoteSchema):
    uid: int = Field(ge=1)
    status: str = Field(min_length=1, examples=["not_completed", "completed", "trash"])
