import React, { useState, useEffect, useRef } from "react";
import { useConversations } from "../context/Conversationcontext"; // Import the useConversations hook
import "./ChatWindow.css";
import { getAIMessage } from "../api/api";
import { FiDownload } from "react-icons/fi";
import { marked } from "marked";

function ChatWindow() {
  const { state, dispatch } = useConversations(); // Access state and dispatch from the reducer
  const defaultMessage = [
    {
      role: "assistant",
      content: {
        message: "Welcome! Ask me about cross rulings, HTS codes, or any other query.", // Store message inside content
      },
      intent: "general", // Set a default intent
    },
  ];
  const activeSessionId = state.activeSessionId;
  // Get the current active conversation's messages
  const activeConversationId = state.activeConversationId;
  const conversationMessages =
    state.messages[activeConversationId] || defaultMessage;

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom when messages are updated
  }, [conversationMessages]); // Trigger scroll whenever messages change

  // Send message and handle AI response
  // Send message and handle AI response
const handleSend = async () => {
  if (input.trim() !== "" && !isSending) {
    setIsSending(true);

    // Dispatch the user message to the reducer
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        conversationId: activeConversationId,
        message: { role: "user", content: input },
      },
    });

    setInput(""); // Clear the input field

    try {
      // Fetch the AI response
      const newMessage = await getAIMessage(input, activeSessionId);

      // Dispatch the AI response to the reducer
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          conversationId: activeConversationId,
          message: {
            role: "assistant",
            content: newMessage.content,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }

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
          <div className="ruling-link-container">
            <a
              href={message.best_ruling.SearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ruling-link"
            >
              <h5>{message.best_ruling.Title}</h5>
            </a>
            <a
              href={message.best_ruling.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="download-icon"
            >
              <FiDownload size={20} />
            </a>
          </div>
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
              <div className="ruling-link-container">
                <a
                  href={ruling.SearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ruling-link"
                >
                  <h5>{ruling.Title}</h5>
                </a>
                <a
                  href={ruling.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-icon"
                >
                  <FiDownload size={20} />
                </a>
              </div>
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
            <strong>{message.best_hts_code.htsno}</strong>:{" "}
            {message.best_hts_code.description}
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
                <strong>General:</strong> {hts.general} |{" "}
                <strong>Special:</strong> {hts.special}
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

  const renderMessageContent = (message) => {
    
    
    // Ensure message exists and has content
    if (!message || !message.content) {
      console.log("Rendering message:", message);
      return <div>Error: Message content is missing.</div>;
    }
    
    if (message.role === "user") {
      return <div>{message.content}</div>;
    }

    // Handle structured message objects with intent
    if (typeof message.content === "object" && message.content.intent) {
      if (message.content.intent === "cross_rulings_inquiry") {
        console.log("Rendering message cross:", message.content);
        return renderCrossRulings(message.content); // Pass structured data for cross rulings
      } else if (message.content.intent === "hts_inquiry") {
        console.log("Rendering message hts:", message.content);
        return renderHTSInquiry(message.content); // Pass structured data for HTS inquiries
      }
    }
  
    // Handle string content
    if (message.content && typeof message.content.message === "string") {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: marked(message.content.message).replace(/<p>|<\/p>/g, ""),
          }}
        />
      );
    }
  
    // Fallback for unsupported message formats
    return <div>Unsupported message format</div>;
  };

  return (
    <div className="chat-window">
      <div className="messages-container">
        {conversationMessages.map((message, index) => (
          <div key={index} className={`${message.role}-message-container`}>
            <div className={`message ${message.role}-message`}>
              {renderMessageContent(message)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
  
      {isSending && (
        <div className="loading-indicator">
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </div>
      )}
  
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSend(); // Only trigger sending on pressing Enter
              e.preventDefault();
            }
          }}
        />
        <button className="send-button" onClick={handleSend} disabled={isSending}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
