import React from "react";
import Navbar from "../Components/Navbar";
import ChatRoom from "../Components/ChatRoom"; // Ensure this path matches your project structure

const OnlineConsultation = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to Online Consultation</h1>
        <ChatRoom />
      </div>
    </>
  );
};

export default OnlineConsultation;
