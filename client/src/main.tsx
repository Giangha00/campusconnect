import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Load XSS test modules for console access
import "./lib/xss-test";
import "./lib/xss-attack-simulation";

createRoot(document.getElementById("root")!).render(<App />);
