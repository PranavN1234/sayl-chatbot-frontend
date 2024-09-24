import React from "react";
import "./App.css";
import ChatWindow from "./components/ChatWindow";

function App() {

  return (
    <div className="App">
      <div className="heading">
        Sayl HTS/Cross rulings chatbot
      </div>
        <ChatWindow/>
    </div>
  );
}

export default App;