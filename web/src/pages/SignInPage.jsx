import "./SignInPage.css";

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import InputLabel from "../components/InputLabel";
import { API_ROUTES, DEBUG } from "../data";

export default function SignInPage({ setIsLoggedIn, appAlertCall }) {
    const [isRegister, setIsRegister] = useState(true);

    const emailRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const usernameRef = useRef();

    const navigate = useNavigate();

    const handleClickRegister = async () => {
        const _email = emailRef.current.value;
        const _password = passwordRef.current.value;
        const _confirmPassword = confirmPasswordRef.current.value;
        const _username = usernameRef.current.value;

        if (
            _email == "" ||
            _password.length < 8 ||
            _password != _confirmPassword ||
            _username.length < 4
        ) {
            if (_email == "")
                appAlertCall.current("Email field is empty", "red");
            else if (_password.length < 8)
                appAlertCall.current(
                    "Password must be 8 characters at least",
                    "red"
                );
            else if (_password != _confirmPassword)
                appAlertCall.current("Passwords doesn't match", "red");
            else if (_username.length < 4)
                appAlertCall.current(
                    "Username must be 4 characters at least",
                    "red"
                );
            return;
        }

        try {
            const response = await fetch(API_ROUTES.register, {
                method: "POST",
                body: JSON.stringify({
                    email: _email,
                    password: _password,
                    username: _username,
                }),
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (DEBUG) console.log("Registering user:", data);

            if (data.isRegistered) {
                if (data.verificationSent) {
                    appAlertCall.current(
                        "Verification was sent to your email",
                        "green"
                    );
                } else {
                    appAlertCall.current(
                        "Successfully registered",
                        "green"
                    );
                };
            }
            else if (data.error == "exists")
                appAlertCall.current(
                    "User with such email already exists",
                    "red"
                );
            else if (data.error == "unknown")
                appAlertCall.current(
                    "Something went wrong. Try again later",
                    "red"
                );
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleClickLogin = async () => {
        const _email = emailRef.current.value;
        const _password = passwordRef.current.value;

        if (_email == "" || _password == "") {
            if (_email == "")
                appAlertCall.current("Email field is empty", "red");
            else if (_password == "")
                appAlertCall.current("Password field is empty", "red");
            return;
        }

        try {
            const response = await fetch(API_ROUTES.login, {
                method: "POST",
                body: JSON.stringify({ email: _email, password: _password }),
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (DEBUG) console.log("Logining user:", data);

            if (data.isLoggedIn) {
                window.localStorage.setItem("username", data.username);
                setIsLoggedIn(true);
                navigate("/");
            } else appAlertCall.current("Invalid email or password", "red");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const switchButtonTexts = [
        "Don't have an account? Register",
        "Already have an account? Login",
    ];

    return (
        <div id="signinPageBg" className="fixedElementFullScreen">
            <div
                id="signinContainer"
                style={{ height: isRegister ? "34rem" : "24rem" }}
            >
                <div id="buttonBackToMain" onClick={() => navigate("/")}>
                    <img
                        className="themedImg"
                        src="./icons/backArrowLeft.svg"
                    />
                    <h5 className="themedText bold">Back</h5>
                </div>
                <img
                    className="themedImg"
                    src="./images/logo-700w.png"
                    style={{
                        width: "50%",
                        height: "auto",
                    }}
                />
                <InputLabel
                    label="Email"
                    inputId="emailInput"
                    autoComplete="email"
                    placeholder="mail@example.com"
                    type="email"
                    ref={emailRef}
                />
                <InputLabel
                    label="Password"
                    inputId="passwordInput"
                    autoComplete={
                        isRegister ? "new-password" : "current-password"
                    }
                    placeholder="strongpassword123"
                    type="password"
                    ref={passwordRef}
                />
                {isRegister && (
                    <InputLabel
                        label="Confirm password"
                        inputId="confirmPasswordInput"
                        autoComplete="new-password"
                        placeholder="strongpassword123"
                        type="password"
                        ref={confirmPasswordRef}
                    />
                )}
                {isRegister && (
                    <InputLabel
                        label="Username"
                        inputId="usernameInput"
                        autoComplete="username"
                        placeholder="User0123ddjw8"
                        type="text"
                        ref={usernameRef}
                    />
                )}
                <div
                    id="authButton"
                    className="themedButton base primary clickable"
                    onClick={
                        isRegister ? handleClickRegister : handleClickLogin
                    }
                >
                    <p className="themedText">
                        {isRegister ? "Register" : "Login"}
                    </p>
                </div>
                <div
                    id="switchAuthButton"
                    onClick={() => {
                        setIsRegister((prev) => !prev);
                    }}
                >
                    <h6 className="themedText bold">
                        {switchButtonTexts[Number(isRegister)]}
                    </h6>
                </div>
            </div>
        </div>
    );
}
