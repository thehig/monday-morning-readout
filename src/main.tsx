import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global/index.css";

// Wait for CryptoJS to be available
const initApp = () => {
  if (!(window as any).CryptoJS) {
    setTimeout(initApp, 100);
    return;
  }

  // Now that CryptoJS is available, load encryption utilities and env
  import("./utils/encryption.js").then(() => {
    import("./encrypted-env.js").then(() => {
      import("./App.tsx").then(({ default: App }) => {
        ReactDOM.createRoot(document.getElementById("root")!).render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
      });
    });
  });
};

initApp();
