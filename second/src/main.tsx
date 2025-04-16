import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

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
        createRoot(document.getElementById("root")!).render(
          <StrictMode>
            <App />
          </StrictMode>
        );
      });
    });
  });
};

initApp();
