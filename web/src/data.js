export const DEBUG = false;

export const WIDTH_WHEN_SIDEBAR_HIDES = 600;
export const MAX_TAG_LENGTH = 12;

export const API_ROUTES = {
    authenticate: "/api/auth/validation/access_token",
    refresh: "/api/auth/validation/refresh_token",
    register: "/api/auth/register",
    login: "/api/auth/login",
    update_username: "/api/auth/user/username",
    update_email: "/api/auth/user/email",
    update_password: '/api/auth/user/password',
    signout: "/api/auth/signout",
    create_note: "/api/notes",
    get_notes: "/api/notes",
    update_note: "/api/notes",
    delete_note: "/api/notes",
};

export const SECTION_NAME_BY_KEY = {
    not_completed: "Not completed",
    completed: "Completed",
    trash: "Trash",
};

export const INDICATOR_ICON_PATH_BY_STATUS = {
    not_completed: "./icons/timer.svg",
    completed: "./icons/check.svg",
    trash: "./icons/trashEmpty.svg",
};

export const APP_ALERT_COLORS = {
    red: "#cc3333",
    green: '#02a83b'
}

const _colors_by_tags = window.localStorage.getItem("colors_by_tags");
export const colors_by_tags = _colors_by_tags
    ? JSON.parse(_colors_by_tags)
    : {
          All: "#5b5b5b",
          colornotfound: "#505050",
      };
if (!_colors_by_tags)
    window.localStorage.setItem(
        "colors_by_tags",
        JSON.stringify(colors_by_tags)
    );

export function UpdateColorsByTags(_colors_by_tags) {
    Object.assign(colors_by_tags, _colors_by_tags);
    window.localStorage.setItem(
        "colors_by_tags",
        JSON.stringify(colors_by_tags)
    );
}

const _theme = window.localStorage.getItem("theme");
export let theme = _theme
    ? _theme
    : 'light'
if (!_theme) window.localStorage.setItem("theme", 'light');

export const updateTheme = (newTheme) => {
    theme = newTheme;
    window.localStorage.setItem('theme', newTheme);
};

export function applyTheme() {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove("lightTheme", "darkTheme");

    switch (theme) {
        case "light":
            htmlElement.classList.add("lightTheme");
            break;
        case "dark":
            htmlElement.classList.add("darkTheme");
            break;
    }
}



const _username = window.localStorage.getItem("username");
export let username = _username ? _username : 'notfound';
if (!_username) window.localStorage.setItem('username', 'notfound');

export const updateUsername = (newUsername) => {
    username = newUsername;
    window.localStorage.setItem('username', newUsername);
};



const _email = window.localStorage.getItem('email');
export let email = _email ? _email : 'notfound';
if (!_email) window.localStorage.setItem('email', 'notfound');

export const updateEmail = (newEmail) => {
    email = newEmail;
    window.localStorage.setItem('email', newEmail);
};