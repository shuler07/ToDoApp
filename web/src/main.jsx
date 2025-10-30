import "./index.css";

import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import { applyTheme } from './data.js';

applyTheme();

const root = createRoot(document.getElementById("root"));
root.render(<App />);