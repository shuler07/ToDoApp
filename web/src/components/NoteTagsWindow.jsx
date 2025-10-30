import "./NoteTagsWindow.css";

export default function NoteTagsWindow({
    tags,
    tagsColors,
    setTags,
    setTagsOpened,
    setAddTagOpened,
}) {
    const GetTags = () => {
        return tags.map((value, index) => {
            const color = tagsColors[value]
                ? tagsColors[value]
                : tagsColors["colornotfound"];
            if (value != "All")
                return (
                    <TagEditElement
                        key={`keyEditTag${index}`}
                        name={value}
                        color={color}
                        setTags={setTags}
                    />
                );
        });
    };

    const handleClickClose = () => {
        setTagsOpened(false);
        setAddTagOpened(false);
    };

    return (
        <div id="noteTagsWindow">
            <div
                style={{
                    height: "2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h4 className="themedText bold">Tags</h4>
                <div className="clickableWithBg">
                    <img
                        className="themedImg clickable"
                        onClick={handleClickClose}
                        src="./icons/close.svg"
                    />
                </div>
            </div>
            <div id="noteTagsContainer">
                {GetTags()}
                <TagEditAddNewButton setAddTagOpened={setAddTagOpened} />
            </div>
        </div>
    );
}

function TagEditElement({ name, color, setTags }) {
    const handleClickRemoveTag = () => {
        setTags((prev) => prev.filter((value) => value != name));
    };

    return (
        <div style={{ display: "flex", gap: ".5rem" }}>
            <div className="tagEditElement" style={{ background: color }}>
                <h6 className="themedText bold white">{name}</h6>
            </div>
            <div
                className="tagEditElementRemoveButton clickable"
                onClick={handleClickRemoveTag}
            >
                <img
                    className="themedImg"
                    src="./icons/removeMinus.svg"
                    style={{
                        width: "1rem",
                        height: "1rem",
                    }}
                />
            </div>
        </div>
    );
}

function TagEditAddNewButton({ setAddTagOpened }) {
    return (
        <div>
            <div
                id="tagEditAddNew"
                className="tagEditElement clickable"
                onClick={() => setAddTagOpened(true)}
            >
                <h6 className="themedText">Add new tag</h6>
                <img
                    className="themedImg"
                    src="./icons/addPlus.svg"
                    style={{
                        width: "1rem",
                        height: "1rem",
                    }}
                />
            </div>
        </div>
    );
}
