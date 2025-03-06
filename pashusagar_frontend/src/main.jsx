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
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
    <Provider store={store}>
      <MyRoute />
    </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);
