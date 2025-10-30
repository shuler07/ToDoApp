import "./NotesSidebar.css";

import { useContext } from "react";
import { MainContext } from "../pages/MainPage";

import {
    SECTION_NAME_BY_KEY,
    WIDTH_WHEN_SIDEBAR_HIDES,
} from "../data";

export default function NotesSidebar() {
    const {
        selectedSection,
        setSelectedSection,
        sidebarOpened,
        setSidebarOpened,
    } = useContext(MainContext);
    const sections = ["not_completed", "completed", "trash"];

    const GetSections = () => {
        return sections.map((value, index) => (
            <NotesSection
                key={`keySection${index}`}
                section={value}
                active={value == selectedSection}
                setSelectedSection={setSelectedSection}
                setSidebarOpened={setSidebarOpened}
            />
        ));
    };

    return (
        <div
            id="notesSidebar"
            className={`${sidebarOpened ? "opened" : "closed"}`}
        >
            <img
                className="themedImg"
                src="./images/logo-700w.png"
                style={{
                    width: "60%",
                    height: "auto",
                    marginBottom: "1rem",
                }}
            />
            {GetSections()}
        </div>
    );
}

function NotesSection({
    section,
    active,
    setSelectedSection,
    setSidebarOpened,
}) {
    const handleClickSection = () => {
        if (window.innerWidth <= WIDTH_WHEN_SIDEBAR_HIDES)
            setSidebarOpened(false);
        setSelectedSection(section);
    };

    return (
        <div
            className={`notesSection ${active ? "active" : ""}`}
            onClick={handleClickSection}
        >
            <h5
                className="themedText bold"
                style={active ? { color: "var(--primaryColor)" } : {}}
            >
                {SECTION_NAME_BY_KEY[section]}
            </h5>
        </div>
    );
}
