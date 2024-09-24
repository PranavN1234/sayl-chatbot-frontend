import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import { getAIMessage } from "../api/api";
import { marked } from "marked";

function ChatWindow() {
  const defaultMessage = [
    {
      role: "assistant",
      content: "Welcome! Ask me about cross rulings, HTS codes, or any other query.",
    },
  ];

  const [messages, setMessages] = useState(defaultMessage); // Keeps track of all messages
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesEndRef.current.parentNode;
  
      // Only auto-scroll to bottom if the user is already at the bottom
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  

  useEffect(() => {
    scrollToBottom(); // Ensures scrolling after every message update
  }, [messages]);

  const handleSend = async (input) => {
    if (input.trim() !== "" && !isSending) {
      setIsSending(true);

      // Append the user's message to the message list
      setMessages((prevMessages) => [...prevMessages, { role: "user", content: input }]);
      setInput("");

      const loadingMessageId = Date.now();

      // Append a loading message
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "loading", content: "...", id: loadingMessageId },
      ]);

      // Fetch new message
      const newMessage = await getAIMessage(input);

      // Replace the loading message with the response
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMessageId ? { ...newMessage, id: undefined } : msg
        )
      );

      setIsSending(false);
    }
  };

  // Rendering Cross Rulings data
  const renderCrossRulings = (message) => (
    <div className="cross-rulings">
      <h3>Cross Rulings for "{message.product}"</h3>
      <p>{message.message}</p>
      {message.best_ruling && (
        <div className="ruling-card">
          <h4>Best Ruling</h4>
          <a href={message.best_ruling.URL} target="_blank" rel="noopener noreferrer">
            <h5>{message.best_ruling.Title}</h5>
          </a>
          <p>{message.best_ruling.Summary}</p>
          {message.best_ruling.Tariffs.length > 0 && (
            <p>
              <strong>Tariffs:</strong> {message.best_ruling.Tariffs.join(", ")}
            </p>
          )}
        </div>
      )}
      {message.related_rulings.length > 0 && (
        <div className="related-rulings">
          <h4>Related Rulings</h4>
          {message.related_rulings.map((ruling, index) => (
            <div key={index} className="ruling-card">
              <a href={ruling.URL} target="_blank" rel="noopener noreferrer">
                <h5>{ruling.Title}</h5>
              </a>
              <p>{ruling.Summary}</p>
              {ruling.Tariffs.length > 0 && (
                <p>
                  <strong>Tariffs:</strong> {ruling.Tariffs.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {message.gpt_insights && (
        <div className="insights">
          <h4>Insights</h4>
          <p>{message.gpt_insights}</p>
        </div>
      )}
    </div>
  );

  // Rendering HTS Inquiry data
  const renderHTSInquiry = (message) => (
    <div className="hts-inquiry">
      <h3>HTS Codes for "{message.product}"</h3>
      <p>{message.message}</p>
      {message.best_hts_code && (
        <div className="hts-card">
          <h4>Best HTS Code</h4>
          <p>
            <strong>{message.best_hts_code.htsno}</strong>: {message.best_hts_code.description}
          </p>
          {message.best_hts_code.general && (
            <p>
              <strong>General Tariff:</strong> {message.best_hts_code.general}
            </p>
          )}
        </div>
      )}
      {message.related_hts_codes.length > 0 && (
        <div className="related-hts-codes">
          <h4>Related HTS Codes</h4>
          {message.related_hts_codes.map((hts, index) => (
            <div key={index} className="hts-card">
              <p>
                <strong>{hts.htsno}</strong>: {hts.description}
              </p>
              <p>
                <strong>General:</strong> {hts.general} | <strong>Special:</strong> {hts.special}
              </p>
            </div>
          ))}
        </div>
      )}
      {message.tariff_insights && (
        <div className="insights">
          <h4>Tariff Insights</h4>
          <p>{message.tariff_insights}</p>
        </div>
      )}
    </div>
  );

  // Rendering messages based on intent
  const renderMessageContent = (message) => {
    if (message.intent === "cross_rulings_inquiry") {
      return renderCrossRulings(message);
    } else if (message.intent === "hts_inquiry") {
      return renderHTSInquiry(message);
    } else {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: marked(message.content).replace(/<p>|<\/p>/g, "") }}
        />
      );
    }
  };

  return (
    <div className="messages-container">
      {messages.map((message, index) => (
        <div key={index} className={`${message.role}-message-container`}>
          {message.role === "loading" ? (
            <div className="message loading-dots">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          ) : (
            <div className={`message ${message.role}-message`}>
              {renderMessageContent(message)}
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSend(input);
              e.preventDefault();
            }
          }}
        />
        <button className="send-button" onClick={() => handleSend(input)} disabled={isSending}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
