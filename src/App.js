import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <div className="App">
      <div className="heading">
        Sayl HTS/Cross rulings chatbot
      </div>
        <Routes>
          {/* Route for the login page */}
          <Route path="/login" element={<Login />} />

          {/* Route for the chatbot page */}
          <Route path="/chat" element={<ChatWindow />} />

          {/* Redirect to login by default */}
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
