import "./NotesContainer.css";

import { useContext } from "react";
import { MainContext } from "../pages/MainPage";
import { INDICATOR_ICON_PATH_BY_STATUS } from "../data";

export default function NotesContainer({ notes, selectedTag }) {
    const { setNoteOpened, openedNoteData } = useContext(MainContext);

    const ShowNotes = () => {
        return notes.map((value, index) => (
            <NoteElement
                key={`keyNote${selectedTag}${index}`}
                setNoteOpened={setNoteOpened}
                openedNoteData={openedNoteData}
                note={value}
            />
        ));
    };

    return <div className="notesContainer">{notes && ShowNotes()}</div>;
}

function NoteElement({ setNoteOpened, openedNoteData, note }) {
    const handleClickNote = () => {
        openedNoteData.current = note;
        document.body.style.overflow = "hidden";
        setNoteOpened(true);
    };

    return (
        <div className="noteElement" onClick={handleClickNote}>
            <div className={`noteElementIndicator ${note.status}`}>
                <img
                    src={INDICATOR_ICON_PATH_BY_STATUS[note.status]}
                    style={{ width: "1.5rem", height: '1.5rem' }}
                />
            </div>
            <h1 className="themedText bold">{note.title}</h1>
            <p className="themedText">{note.text}</p>
        </div>
    );
}
