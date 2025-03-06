import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { GoogleLogin } from "@react-oauth/google"; 

const Login = () => {
  const navigate = useNavigate();

  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle standard email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        { email, password }
      );
      console.log("Login response:", response.data);

      const { access, username, email: userEmail, role } = response.data;

      if (role === undefined || role === null) {
        throw new Error("Role not found in the response.");
      }

      // Save user data in localStorage (or your preferred store)
      localStorage.setItem("token", access);
      localStorage.setItem("username", username);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("role", role);

      // Redirect based on role
      if (role === 0) {
        navigate("/admin");
      } else if (role === 2) {
        navigate("/veterinarians");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(err.response.data.detail || "Invalid email or password.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Handle Google Login success
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      // credentialResponse.credential is the Google ID token
      const idToken = credentialResponse.credential;

      // Send ID token to your backend for verification
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/google-login/",
        { id_token: idToken }
      );
      console.log("Google Login response:", response.data);

      // Your backend should return tokens & user info
      const { access, role, user_id, email, first_name, last_name } = response.data;

      // Store tokens/user data as desired. Here, we set "username" for Navbar.
      localStorage.setItem("token", access);
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("first_name", first_name);
      localStorage.setItem("last_name", last_name);

      // Set username (for example, use first_name or a combination)
      const username = first_name || email;
      localStorage.setItem("username", username);

      // Redirect based on role
      if (role === 0) {
        navigate("/admin");
      } else if (role === 2) {
        navigate("/veterinarians");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Google login failed. Please try again.");
    }
  };

  // Handle Google Login failure
  const handleGoogleLoginError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-[#00574B] to-[#009366] h-screen flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm sm:max-w-lg md:max-w-xl">
          <h1 className="text-2xl font-bold text-center text-[#00574B]">
            Sign in to your account
          </h1>

          {error && <p className="text-red-500 text-center mt-2">{error}</p>}

          {/* Email/Password Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-[#00574B]">
                Your email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg block w-full p-3"
                placeholder="mail@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#00574B]">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg block w-full p-3"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-[#00574B]">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#009366] border-gray-300 rounded"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <Link to="/forgetpassword" className="text-sm text-[#009366] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="bg-[#009366] w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 hover:bg-[#00574B] focus:outline-none focus:ring-4 focus:ring-[#ADE1B0]"
            >
              Sign in
            </button>
          </form>

          {/* Optional Separator */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-500">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>

          <p className="text-sm text-center text-gray-500 mt-4">
            Don’t have an account yet?{" "}
            <Link to="/signup" className="text-[#009366] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
