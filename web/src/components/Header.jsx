import "./Header.css";

import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MainContext } from "../pages/MainPage";

export default function Header({ searchNotes, searchText, setSearchText }) {
    const { isLoggedIn, setSidebarOpened } = useContext(MainContext);

    return (
        <div id="headerContainer">
            <div id="headerBar">
                <HeaderSidebarButton setSidebarOpened={setSidebarOpened} />
                <HeaderSearch
                    searchNotes={searchNotes}
                    searchText={searchText}
                    setSearchText={setSearchText}
                />
                <HeaderSettings isLoggedIn={isLoggedIn} />
            </div>
        </div>
    );
}

function HeaderSidebarButton({ setSidebarOpened }) {
    return (
        <div
            id="notesSidebarButton"
            className="clickable"
            onClick={() => setSidebarOpened((prev) => !prev)}
        ></div>
    );
}

function HeaderSearch({ searchNotes, searchText, setSearchText }) {
    const handleChangeSearch = (e) => {
        const value = e.target.value;
        setSearchText(value);
        searchNotes(value);
    };

    return (
        <input
            id="headerSearch"
            placeholder="Search notes..."
            value={searchText}
            onChange={handleChangeSearch}
        ></input>
    );
}

function HeaderSettings() {
    const navigate = useNavigate();

    return (
        <div id="headerSettings" className='clickableWithBg' onClick={() => navigate("/settings")}>
            <img
                className="themedImg"
                src="./icons/settings.svg"
            />
        </div>
    );
}
