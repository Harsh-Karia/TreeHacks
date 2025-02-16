import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Mount React app to DOM
createRoot(document.getElementById("root")!).render(<App />);