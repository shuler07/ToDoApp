import "./NoteAddTagWindow.css";

import { useRef, useState } from "react";

import { MAX_TAG_LENGTH } from "../data";

export default function NoteAddTagWindow({
    tags,
    tagsColors,
    setTags,
    setTagsColors,
    setAddTagOpened,
}) {
    const [tagText, setTagText] = useState("");
    const tagInput = useRef();

    const [tagColor, setTagColor] = useState("#505050");

    const handleChangeTag = (e) => {
        setTagText(e.target.value);
        if (Object.keys(tagsColors).includes(e.target.value)) {
            setTagColor(tagsColors[e.target.value]);
        } else {
            setTagColor(tagsColors["colornotfound"]);
        }
    };

    const handleClickAdd = () => {
        setTags((prev) => {
            const _prev = structuredClone(prev);
            _prev.push(tagText);
            return _prev;
        });
        setTagsColors((prev) => ({
            ...prev,
            [tagText]: tagColor,
        }));
        setAddTagOpened(false);
    };

    const handleClickChangeColor = (color) => {
        setTagColor(color);
        if (tags.includes(tagText) && tagsColors[tagText] != color) {
            setTagsColors((prev) => ({
                ...prev,
                [tagText]: color,
            }));
        }
    };

    const addButtonDisabled =
        tags.includes(tagText) || tagText == "All" || tagText == "";

    const GetTagColors = () => {
        const tagColors = [
            "black",
            "#505050",
            "dimgray",
            "gray",
            "red",
            "orangered",
            "brown",
            "darkred",
            "blue",
            "cornflowerblue",
            "darkslateblue",
            "darkblue",
            "limegreen",
            "seagreen",
            "green",
            "darkgreen",
            "darkorange",
            "goldenrod",
            "coral",
            "chocolate",
            "magenta",
            "blueviolet",
            "darkviolet",
            "purple",
        ];

        return tagColors.map((value, index) => (
            <TagColorElement
                key={`keyTagColor${index}`}
                color={value}
                active={value == tagColor ? "active" : ""}
                event={handleClickChangeColor}
            />
        ));
    };

    return (
        <div id="noteWindowTagsAdd">
            <div
                style={{
                    height: "2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h4 className="themedText bold">Name</h4>
                <div className="clickableWithBg">
                    <img
                        className="themedImg clickable"
                        onClick={() => setAddTagOpened(false)}
                        src="./icons/close.svg"
                    />
                </div>
            </div>
            <div id="addTagContainer">
                <input
                    id="addTagInput"
                    className="themedText bold"
                    style={{ background: tagColor }}
                    placeholder="Enter tag"
                    value={tagText}
                    maxLength={MAX_TAG_LENGTH}
                    onChange={handleChangeTag}
                    ref={tagInput}
                />
                <button
                    className="addTagButton clickable"
                    onClick={handleClickAdd}
                    disabled={addButtonDisabled}
                >
                    <img
                        className="themedImg"
                        src={
                            addButtonDisabled
                                ? "./icons/close.svg"
                                : "./icons/addPlus.svg"
                        }
                        style={{
                            width: "1rem",
                            height: "1rem",
                        }}
                    />
                </button>
            </div>
            <h4
                className="themedText bold"
                style={{ color: "var(--inverseColor)" }}
            >
                Color
            </h4>
            <div id="addTagColorContainer">{GetTagColors()}</div>
        </div>
    );
}

function TagColorElement({ color, active, event }) {
    return (
        <div
            className={`tagColorElement clickable ${active}`}
            style={{ background: color }}
            onClick={() => event(color)}
        ></div>
    );
}
