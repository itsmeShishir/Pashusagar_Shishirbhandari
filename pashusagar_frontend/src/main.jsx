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
    <GoogleOAuthProvider clientId="387800676261-j4sj0haaig4sfdqtab8e59cg4m515g8g.apps.googleusercontent.com">
    <Provider store={store}>
      <MyRoute />
    </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);
