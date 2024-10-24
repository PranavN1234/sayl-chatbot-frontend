import React, { useContext } from "react";
import { AuthContext } from "./context/Authcontext"; // Import AuthContext
import { Route, Routes, Navigate } from "react-router-dom";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  const { token } = useContext(AuthContext);

  return (
    <div className={`app-layout ${!token ? 'centered-login' : ''}`}>
      {/* Header is always present */}
      <header className="heading">Sayl HTS & CROSS Ruling Co-Pilot</header>

      {/* Conditionally render Sidebar only if token exists (user is logged in) */}
      {token && (
        <div className="sidebar-container">
          <Sidebar />
        </div>
      )}

      {/* Main content */}
      <main className={`${token ? 'main-content' : 'login-content'}`}>
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/chat" />} />
          <Route path="/chat" element={token ? <ChatWindow /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={token ? "/chat" : "/login"} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
