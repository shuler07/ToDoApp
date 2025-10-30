import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PageBackground from "./components/PageBackground";
import AppAlert from "./components/AppAlert";
import MainPage from "./pages/MainPage";
import SignInPage from "./pages/SignInPage";
import SettingsPage from "./pages/SettingsPage";

import { API_ROUTES, updateUsername, updateEmail, DEBUG } from "./data";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        authenticateUser();
    }, []);

    const appAlertCallRef = useRef();

    async function authenticateUser() {
        try {
            const response = await fetch(API_ROUTES.authenticate, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (DEBUG) console.log("Checking access token:", data);

            if (data.isLoggedIn) {
                updateUsername(data.username);
                updateEmail(data.email);
                setIsLoggedIn(data.isLoggedIn);
            } else if (!Object.hasOwn(data, "error")) refreshUser();
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function refreshUser() {
        try {
            const response = await fetch(API_ROUTES.refresh, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (DEBUG) console.log("Checking refresh token:", data);

            if (data.isLoggedIn) {
                updateUsername(data.username);
                updateEmail(data.email);
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <BrowserRouter>
            <PageBackground />
            <AppAlert appAlertCallRef={appAlertCallRef} />
            <Routes>
                <Route index element={<MainPage isLoggedIn={isLoggedIn} />} />
                <Route
                    path="/sign_in"
                    element={
                        <SignInPage
                            setIsLoggedIn={setIsLoggedIn}
                            appAlertCall={appAlertCallRef}
                        />
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <SettingsPage
                            isLoggedIn={isLoggedIn}
                            setIsLoggedIn={setIsLoggedIn}
                            appAlertCall={appAlertCallRef}
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
