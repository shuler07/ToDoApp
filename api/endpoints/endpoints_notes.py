from fastapi import Request, Depends, APIRouter
from sqlalchemy import select, update, delete

from limiter import limiter
from auth import authentication
from database import sessionDep
from models.notesmodel import NotesModel
from constants import LIMIT_VALUE_NOTES, SCOPE_NOTES
from schemas.notesschema import NoteSchema, CreateNoteSchema, NoteIdSchema

router_notes = APIRouter(prefix="/notes", tags=["Notes"])


@router_notes.post(
    "",
    description="Accepts note object and access token from cookie. Returns True and note object if access token is fresh and valid and note data valid, False otherwise",
    summary="Create new note",
)
@limiter.shared_limit(LIMIT_VALUE_NOTES, SCOPE_NOTES)
async def create_new_note(
    createNote: CreateNoteSchema,
    request: Request,
    session: sessionDep,
    access_payload=Depends(authentication.auth.access_token_required),
):
    uid = int(access_payload.sub)
    try:
        new_note = NotesModel(
            uid=uid,
            title=createNote.title,
            text=createNote.text,
            status="not_completed",
            tags=createNote.tags,
        )
        session.add(new_note)
        await session.commit()
        await session.refresh(new_note)

        return {"success": True, "note": new_note}
    except Exception as e:
        print("Something went wrong [Create new note]", e)

        return {"success": False}


@router_notes.get(
    "",
    description="Accepts access token from cookie. Returns list of notes if access token is fresh and valid, False otherwise",
    summary="Get notes",
)
@limiter.shared_limit(LIMIT_VALUE_NOTES, SCOPE_NOTES)
async def get_notes(
    request: Request,
    session: sessionDep,
    access_payload=Depends(authentication.auth.access_token_required),
):
    uid = int(access_payload.sub)
    try:
        query = select(NotesModel).where(NotesModel.uid == uid)
        result = await session.execute(query)
        notes = result.scalars().all()

        return notes
    except Exception as e:
        print("Something went wrong [Get notes]", e)

        return {"success": False}


@router_notes.put(
    "",
    description="Accepts note object and access token from cookie. Returns True if access token is fresh and valid and note data valid, False otherwise",
    summary="Update note",
    dependencies=[Depends(authentication.auth.access_token_required)],
)
@limiter.shared_limit(LIMIT_VALUE_NOTES, SCOPE_NOTES)
async def update_note(noteSchema: NoteSchema, request: Request, session: sessionDep):
    try:
        query = (
            update(NotesModel)
            .values(
                title=noteSchema.title,
                text=noteSchema.text,
                tags=noteSchema.tags,
                status=noteSchema.status,
            )
            .where(NotesModel.id == noteSchema.id)
        )
        await session.execute(query)
        await session.commit()

        return {"success": True}
    except Exception as e:
        print("Something went wrong [Update note]", e)

        return {"success": False}


@router_notes.delete(
    "",
    description="Accepts note id and access token from cookie. Returns True if access token is fresh and valid and note id valid, False otherwise",
    summary="Delete note",
    dependencies=[Depends(authentication.auth.access_token_required)],
)
@limiter.shared_limit(LIMIT_VALUE_NOTES, SCOPE_NOTES)
async def delete_note(
    noteIdSchema: NoteIdSchema, session: sessionDep, request: Request
):
    try:
        query = delete(NotesModel).where(NotesModel.id == noteIdSchema.id)
        await session.execute(query)
        await session.commit()

        return {"success": True}
    except Exception as e:
        print("Something went wrong [Delete note]", e)

        return {"success": False}
