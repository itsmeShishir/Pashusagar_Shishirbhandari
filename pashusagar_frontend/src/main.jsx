// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import "./App.css";
import "./index.css";
import MyRoute from "./Route/MyRoute.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="454950803546-rg80qss7iid6kml6qlhlnui4anr61i6i.apps.googleusercontent.com">
      <Provider store={store}>
        <MyRoute />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);
