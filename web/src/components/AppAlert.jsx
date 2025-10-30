import "./AppAlert.css";

import { useRef, useState } from "react";

import { APP_ALERT_COLORS } from "../data";

export default function AppAlert({ appAlertCallRef }) {
    const alertRef = useRef();
    const [alertText, setAlertText] = useState("");
    const [alertColor, setAlertColor] = useState("");

    appAlertCallRef.current = (_text, _color) => {
        setAlertText(_text);
        setAlertColor(APP_ALERT_COLORS[_color]);

        const elem = alertRef.current;
        elem.style.display = "block";
        elem.style.animation = 'none';
        void elem.offsetWidth;
        elem.style.animation = '';
        elem.style.animation = "appAlertAppear 3s forwards";

        const elemAnimEnd = () => {
            elem.style.display = 'none';
            elem.removeEventListener('animationend', elemAnimEnd);
        };

        elem.addEventListener('animationend', elemAnimEnd);
    };

    return (
        <div id="appAlertContainer">
            <div
                id="appAlert"
                style={{ background: alertColor }}
                ref={alertRef}
            >
                <h6 className="themedText bold">{alertText}</h6>
            </div>
        </div>
    );
}
