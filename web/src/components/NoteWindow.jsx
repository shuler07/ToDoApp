import "./NoteWindow.css";

import { useState, useContext, useRef } from "react";
import { MainContext } from "../pages/MainPage";

import { API_ROUTES, colors_by_tags, DEBUG, UpdateColorsByTags } from "../data";
import NoteTagsWindow from "./NoteTagsWindow";
import NoteAddTagWindow from "./NoteAddTagWindow";

export default function NoteWindow({ setNotes, selectedTag, setSelectedTag }) {
    const { setNoteOpened, openedNoteData } = useContext(MainContext);
    let note = openedNoteData.current;

    const [title, setTitle] = useState(note.title);
    const [text, setText] = useState(note.text);
    const [tags, setTags] = useState(note.tags);
    const [tagsColors, setTagsColors] = useState(colors_by_tags);

    const closeNoteWindow = () => {
        document.body.style.overflowY = "auto";
        if (note.id) {
            if (
                note.title !== title ||
                note.text !== text ||
                note.tags !== tags
            )
                UpdateNote({ title, text, tags });
        }
        UpdateColorsByTags(tagsColors);
        setNoteOpened(false);
    };

    const DeleteNote = async () => {
        try {
            const response = await fetch(API_ROUTES.delete_note, {
                method: "DELETE",
                body: JSON.stringify({ id: note.id }),
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (DEBUG) console.log("Deleting note:", data);

            if (data.success) {
                setNotes((prev) => {
                    const _notes = JSON.parse(JSON.stringify(prev));
                    const _note = _notes.trash.All.filter(
                        (value) => value.id == note.id
                    )[0];

                    let dir = _notes.trash.All;
                    dir = dir.filter((value) => value.id != note.id);
                    if (dir.length == 0) delete _notes.trash.All;
                    else _notes.trash.All = dir;

                    _note.tags.forEach((tag) => {
                        dir = _notes.trash[tag];
                        dir = dir.filter((value) => value.id != note.id);
                        if (dir.length == 0) delete _notes.trash[tag];
                        else _notes.trash[tag] = dir;
                    });

                    return _notes;
                });
                closeNoteWindow();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const CreateNote = async () => {
        try {
            const response = await fetch(API_ROUTES.create_note, {
                method: "POST",
                body: JSON.stringify({ title, text, tags }),
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (DEBUG) console.log("Creating note:", data);

            if (data.success) {
                setNotes((prev) => {
                    const _notes = JSON.parse(JSON.stringify(prev));

                    if (!Object.hasOwn(_notes.not_completed, "All"))
                        _notes.not_completed.All = [];
                    _notes.not_completed.All.push(data.note);

                    tags.forEach((tag) => {
                        if (!Object.hasOwn(_notes.not_completed, tag))
                            _notes.not_completed[tag] = [];
                        _notes.not_completed[tag].push(data.note);
                    });

                    return _notes;
                });
                closeNoteWindow();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const UpdateNote = async (updates) => {
        try {
            const response = await fetch(API_ROUTES.update_note, {
                method: "PUT",
                body: JSON.stringify({
                    ...note,
                    ...updates,
                }),
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (DEBUG) console.log("Updating note:", data);

            if (data.success) {
                setNotes((prev) => {
                    const _notes = JSON.parse(JSON.stringify(prev));
                    const _note = _notes[note.status].All.filter(
                        (value) => value.id == note.id
                    )[0];

                    // Updating its values
                    _note.title = updates.title;
                    _note.text = updates.text;
                    _note.tags = updates.tags;

                    // Delete note from old dirs
                    let dir = _notes[note.status].All;
                    dir = dir.filter((value) => value.id != note.id);
                    if (dir.length == 0) delete _notes[note.status].All;
                    else _notes[note.status].All = dir;

                    note.tags.forEach((tag) => {
                        dir = _notes[note.status][tag];
                        dir = dir.filter((value) => value.id != note.id);
                        if (dir.length == 0) delete _notes[note.status][tag];
                        else _notes[note.status][tag] = dir;
                    });

                    // Update status if its changed
                    if (Object.hasOwn(updates, "status"))
                        _note.status = updates.status;

                    // Add note to new dirs
                    if (!Object.hasOwn(_notes[_note.status], "All"))
                        _notes[_note.status].All = [];
                    _notes[_note.status].All.push(_note);

                    tags.forEach((tag) => {
                        if (!Object.hasOwn(_notes[_note.status], tag))
                            _notes[_note.status][tag] = [];
                        _notes[_note.status][tag].push(_note);
                    });

                    // Update note in memory
                    note = _note;

                    // Check is current dir exists
                    if (!Object.hasOwn(_notes[note.status], selectedTag))
                        setSelectedTag("All");

                    return _notes;
                });
                closeNoteWindow();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const button_secondary = {
        not_completed: (
            <div
                className="themedButton delete accent clickable"
                onClick={() =>
                    UpdateNote({ title, text, tags, status: "trash" })
                }
            >
                <p>Delete</p>
            </div>
        ),
        completed: (
            <div
                className="themedButton delete accent clickable"
                onClick={() =>
                    UpdateNote({ title, text, tags, status: "trash" })
                }
            >
                <p>Delete</p>
            </div>
        ),
        trash: (
            <div
                className="themedButton base accent clickable"
                onClick={() =>
                    UpdateNote({ title, text, tags, status: "not_completed" })
                }
            >
                <p>Restore</p>
            </div>
        ),
        creating: null,
    };

    const button_primary = {
        not_completed: (
            <div
                className="themedButton base primary clickable"
                onClick={() =>
                    UpdateNote({ title, text, tags, status: "completed" })
                }
            >
                <p>Complete</p>
            </div>
        ),
        completed: (
            <div
                className="themedButton base primary clickable"
                onClick={() =>
                    UpdateNote({ title, text, tags, status: "not_completed" })
                }
            >
                <p>Uncomplete</p>
            </div>
        ),
        trash: (
            <div
                className="themedButton delete primary clickable"
                onClick={() => DeleteNote()}
            >
                <p>Delete forever</p>
            </div>
        ),
        creating: (
            <div
                className="themedButton base primary clickable"
                onClick={() => CreateNote()}
            >
                <p>Create</p>
            </div>
        ),
    };

    // Dragging tags container

    const noteWindowTags = useRef();

    let offsetX = 0;
    let isDragging = false;

    const handleTagsMouseDown = (e) => {
        isDragging = true;
        offsetX = e.screenX;
    };

    const handleTagsMouseMove = (e) => {
        if (!isDragging) return;
        const _offsetX = e.screenX;
        const delta = offsetX - _offsetX;
        noteWindowTags.current.scrollLeft += delta;
        offsetX = _offsetX;
    };

    const handleTagsMouseUp = () => {
        isDragging = false;
    };

    // Tags

    const [tagsOpened, setTagsOpened] = useState(false);
    const [addTagOpened, setAddTagOpened] = useState(false);

    const GetTags = () => {
        return tags.map((value, index) => {
            const color = tagsColors[value]
                ? tagsColors[value]
                : tagsColors["colornotfound"];
            if (value != "All")
                return (
                    <TagElement
                        key={`keyTag${index}`}
                        name={value}
                        color={color}
                    />
                );
        });
    };

    return (
        <div id="noteWindowBg" className="fixedElementFullScreen">
            <div id="noteWindowTagsContainer">
                {tagsOpened && (
                    <div
                        id="noteWindowTagsEditBg"
                        className="fixedElementFullScreen"
                    ></div>
                )}
                {tagsOpened && (
                    <NoteTagsWindow
                        tags={tags}
                        tagsColors={tagsColors}
                        setTags={setTags}
                        setTagsOpened={setTagsOpened}
                        setAddTagOpened={setAddTagOpened}
                    />
                )}
                {addTagOpened && (
                    <NoteAddTagWindow
                        tags={tags}
                        tagsColors={tagsColors}
                        setTags={setTags}
                        setTagsColors={setTagsColors}
                        setAddTagOpened={setAddTagOpened}
                    />
                )}
            </div>
            <div id="noteWindow">
                <div id="noteWindowHeader">
                    <input
                        name="Note title"
                        className="transparentInput themedText bold"
                        value={title}
                        placeholder="Enter title"
                        onChange={(e) => setTitle(e.target.value)}
                    ></input>
                    <div className="clickableWithBg">
                        <img
                            className="themedImg clickable"
                            onClick={closeNoteWindow}
                            src="./icons/close.svg"
                        />
                    </div>
                </div>
                <div
                    id="noteWindowTags"
                    autoFocus="true"
                    ref={noteWindowTags}
                    onDragStart={(e) => e.preventDefault()}
                    onMouseDown={handleTagsMouseDown}
                    onMouseMove={handleTagsMouseMove}
                    onMouseUp={handleTagsMouseUp}
                    onMouseLeave={handleTagsMouseUp}
                >
                    {tags.length > 0 && GetTags()}
                    <NoteWindowOpenTagsButton
                        withText={tags.length === 0}
                        setTagsOpened={setTagsOpened}
                    />
                </div>
                <div id="noteWindowMain">
                    <textarea
                        name="Note text"
                        className="themedTextArea"
                        style={{
                            color: "var(--inverseColor)",
                            background: "var(--secondaryColor)",
                            borderRadius: "1rem",
                        }}
                        value={text}
                        placeholder="Enter text"
                        onChange={(e) => setText(e.target.value)}
                        ref={(el) => {
                            if (el) {
                                el.style.height = "auto";
                                el.style.height =
                                    "calc(" + el.scrollHeight + "px - 1rem)";
                            }
                        }}
                    ></textarea>
                </div>
                <div id="noteWindowFooter">
                    {button_secondary[note.status]}
                    {button_primary[note.status]}
                </div>
            </div>
        </div>
    );
}

function NoteWindowOpenTagsButton({ withText, setTagsOpened }) {
    return (
        <div
            id="noteWindowTagsEdit"
            className="clickable"
            onClick={() => setTagsOpened(true)}
        >
            {withText && <h6 className="themedText">Edit tags</h6>}
            <img
                className="themedImg"
                src="./icons/editPencil.svg"
                style={{ width: "1rem", height: "1rem" }}
            />
        </div>
    );
}

function TagElement({ name, color }) {
    return (
        <div className="tagElement" style={{ background: color }}>
            <h6
                className="themedText bold white"
                style={{ userSelect: "none" }}
            >
                {name}
            </h6>
        </div>
    );
}
