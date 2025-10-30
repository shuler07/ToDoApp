import "./SettingsPage.css";

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import InputLabel from "../components/InputLabel";
import {
    DEBUG,
    API_ROUTES,
    applyTheme,
    theme,
    updateTheme,
    username,
    updateUsername,
    email,
} from "../data";

export default function SettingsPage({
    isLoggedIn,
    setIsLoggedIn,
    appAlertCall,
}) {
    const [actionData, setActionData] = useState(null);

    return (
        <div id="settingsPageBg" className="fixedElementFullScreen">
            <div id="settingsHeader">
                <SettingsBackButton />
            </div>
            <div id="settingsMain">
                {isLoggedIn && (
                    <SettingsAccountSection
                        setActionData={setActionData}
                        setIsLoggedIn={setIsLoggedIn}
                        appAlertCall={appAlertCall}
                    />
                )}
                <SettingsAppearanceSection />
            </div>
            {actionData && (
                <SettingsWindow {...actionData} setActionData={setActionData} />
            )}
        </div>
    );
}

function SettingsBackButton() {
    const navigate = useNavigate();

    return (
        <div id="backButtonContainer" onClick={() => navigate("/")}>
            <img className="themedImg" src="./icons/backArrowLeft.svg" />
            <h3
                className="themedText bold"
                style={{ color: "var(--inverseColor)" }}
            >
                Settings
            </h3>
        </div>
    );
}

function SettingsWindow({
    title,
    description,
    input1,
    input2,
    buttonConfirm,
    setActionData,
}) {
    return (
        <div id="settingsWindowBg" className="fixedElementFullScreen">
            <div id="settingsWindow">
                <div className="clickableWithBg" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <img
                        className="themedImg clickable"
                        src="./icons/close.svg"
                        onClick={() => setActionData(null)}
                    />
                </div>
                <h3
                    className="themedText bold"
                    style={{ color: "var(--inverseColor)" }}
                >
                    {title}
                </h3>
                {description && (
                    <h5
                        className="themedText"
                        style={{
                            color: "var(--inverseColor)",
                            textAlign: "center",
                        }}
                    >
                        {description}
                    </h5>
                )}
                {input1 && (
                    <InputLabel
                        label={input1.label}
                        inputId="settingsWindowInput1"
                        autoComplete="none"
                        placeholder={input1.placeholder}
                        type={input1.type}
                        ref={input1.ref}
                    />
                )}
                {input2 && (
                    <InputLabel
                        label={input2.label}
                        inputId="settingsWindowInput2"
                        autoComplete="none"
                        placeholder={input2.placeholder}
                        type={input2.type}
                        ref={input2.ref}
                    />
                )}
                {buttonConfirm && (
                    <button
                        className={`themedButton clickable ${buttonConfirm.classes}`}
                        onClick={buttonConfirm.action}
                    >
                        <p className="themedText bold">{buttonConfirm.text}</p>
                    </button>
                )}
            </div>
        </div>
    );
}

function SettingsAccountSection({
    setActionData,
    setIsLoggedIn,
    appAlertCall,
}) {
    const inputField1Ref = useRef();
    const inputField2Ref = useRef();

    const navigate = useNavigate();

    const handleClickChangeUsername = () => {
        setActionData({
            title: "Change username",
            input1: {
                label: "New username",
                placeholder: username,
                ref: inputField1Ref,
                type: "text",
            },
            buttonConfirm: {
                text: "Update",
                classes: "base primary",
                action: async () => {
                    const _username = inputField1Ref.current.value;
                    if (_username == username || _username.length < 4) {
                        if (_username == username)
                            appAlertCall.current(
                                "New username equals to current one",
                                "red"
                            );
                        else if (_username.length < 4)
                            appAlertCall.current(
                                "Username must be 4 characters at least",
                                "red"
                            );
                        return;
                    }

                    const response = await fetch(API_ROUTES.update_username, {
                        method: "PUT",
                        credentials: "include",
                        body: JSON.stringify({ username: _username }),
                        headers: { "Content-Type": "application/json" },
                    });

                    const data = await response.json();
                    if (DEBUG) console.log("Updating username:", data);

                    if (data.success) {
                        appAlertCall.current("Username updated", "green");
                        updateUsername(_username);
                        setActionData(null);
                    } else {
                        appAlertCall.current(
                            "Something went wrong. Try again later",
                            "red"
                        );
                    }
                },
            },
        });
    };

    const handleClickChangeEmail = () => {
        setActionData({
            title: "Change email",
            description:
                "You will have to verify new email. Your current session will end up",
            input1: {
                label: "New email",
                placeholder: email,
                ref: inputField1Ref,
                type: "email",
            },
            buttonConfirm: {
                text: "Update",
                classes: "base primary",
                action: async () => {
                    const _email = inputField1Ref.current.value;
                    if (_email == email || _email == "") {
                        if (_email == email)
                            appAlertCall.current(
                                "New email equals to current one",
                                "red"
                            );
                        else if (_email == "")
                            appAlertCall.current("Email field is empty");
                        return;
                    }

                    const response = await fetch(API_ROUTES.update_email, {
                        method: "PUT",
                        credentials: "include",
                        body: JSON.stringify({ email: _email }),
                        headers: { "Content-Type": "application/json" },
                    });

                    const data = await response.json();
                    if (DEBUG) console.log("Updating email:", data);

                    if (data.success) {
                        setIsLoggedIn(false);
                        navigate("/");
                    } else {
                        if (data.error == "exists")
                            appAlertCall.current(
                                "User with such email already exists",
                                "red"
                            );
                        else
                            appAlertCall.current(
                                "Something went wrong. Try again later"
                            );
                    }
                },
            },
        });
    };

    const handleClickChangePassword = () => {
        setActionData({
            title: "Update password",
            input1: {
                label: "Current password",
                placeholder: "********",
                ref: inputField1Ref,
                type: "password",
            },
            input2: {
                label: "New password",
                placeholder: "********",
                ref: inputField2Ref,
                type: "password",
            },
            buttonConfirm: {
                text: "Update",
                classes: "base primary",
                action: async () => {
                    const _password = inputField1Ref.current.value;
                    const _newPassword = inputField2Ref.current.value;
                    if (
                        _password.length < 8 ||
                        _newPassword.length < 8 ||
                        _password == _newPassword
                    ) {
                        if (_password.length < 8)
                            appAlertCall.current(
                                "Password must be 8 characters at least",
                                "red"
                            );
                        else if (_newPassword.length < 8)
                            appAlertCall.current(
                                "New password must be 8 characters at least",
                                "red"
                            );
                        else if (_password == _newPassword)
                            appAlertCall.current("Passwords are equal", "red");
                        return;
                    }

                    const response = await fetch(API_ROUTES.update_password, {
                        method: "PUT",
                        credentials: "include",
                        body: JSON.stringify({
                            password: _password,
                            new_password: _newPassword,
                        }),
                        headers: { "Content-Type": "application/json" },
                    });

                    const data = await response.json();
                    if (DEBUG) console.log("Updating password:", data);

                    if (data.success) {
                        appAlertCall.current("Password updated", "green");
                        setActionData(null);
                    } else {
                        if (data.error == "Wrong password")
                            appAlertCall.current(
                                "Wrong current password",
                                "red"
                            );
                        else
                            appAlertCall.current(
                                "Something went wrong. Try again later",
                                "red"
                            );
                    }
                },
            },
        });
    };

    const handleClickSignout = () => {
        setActionData({
            title: "Sign out",
            description:
                "Are you sure you want sign out? You'll have to sign in again",
            buttonConfirm: {
                text: "Sign out",
                classes: "delete primary",
                action: async () => {
                    const response = await fetch(API_ROUTES.signout, {
                        method: "DELETE",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                    });

                    const data = await response.json();
                    if (DEBUG) console.log("Signing out:", data);

                    if (!data.isLoggedIn) {
                        setIsLoggedIn(false);
                        navigate("/");
                    } else {
                        appAlertCall.current(
                            "Something went wrong. Try again later",
                            "red"
                        );
                    }
                },
            },
        });
    };

    const GetBlocks = () => {
        const blocks = [
            {
                title: "Change username",
                iconPath: "./icons/editPencil.svg",
                action: handleClickChangeUsername,
            },
            {
                title: "Change email",
                iconPath: "./icons/editPencil.svg",
                action: handleClickChangeEmail,
            },
            {
                title: "Change password",
                iconPath: "./icons/editPencil.svg",
                action: handleClickChangePassword,
            },
            {
                title: "Sign out",
                iconPath: "./icons/exit.svg",
                action: handleClickSignout,
            },
        ];

        return blocks.map((value, index) => (
            <SettingsSectionBlock
                key={`keySettingsAccount${index}`}
                {...value}
            />
        ));
    };

    return (
        <div className="settingsSection">
            <h5 className="themedText" style={{ color: "var(--inverseColor)" }}>
                Account
            </h5>
            {GetBlocks()}
        </div>
    );
}

function SettingsAppearanceSection() {
    const handleClickChangeTheme = () => {
        if (theme == "light") {
            updateTheme("dark");
            document.querySelector('img[src="./icons/sun.svg"]').src =
                "./icons/moon.svg";
        } else {
            updateTheme("light");
            document.querySelector('img[src="./icons/moon.svg"]').src =
                "./icons/sun.svg";
        }
        applyTheme();
    };

    const blocks = [
        {
            title: "Theme",
            iconPath: theme == "light" ? "./icons/sun.svg" : "./icons/moon.svg",
            action: handleClickChangeTheme,
        },
    ];

    const GetBlocks = () => {
        return blocks.map((value, index) => (
            <SettingsSectionBlock
                key={`keySettingsAppearance${index}`}
                {...value}
            />
        ));
    };

    return (
        <div className="settingsSection">
            <h5 className="themedText" style={{ color: "var(--inverseColor)" }}>
                Appearance
            </h5>
            {GetBlocks()}
        </div>
    );
}

function SettingsSectionBlock({ title, iconPath, action }) {
    return (
        <div className="settingsSectionBlock" onClick={action}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <img className="themedImg" src={iconPath} />
                <h5
                    className="themedText bold"
                    style={{ color: "var(--inverseColor)" }}
                >
                    {title}
                </h5>
            </div>
        </div>
    );
}
