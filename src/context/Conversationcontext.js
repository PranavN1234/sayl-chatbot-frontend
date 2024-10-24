import React, { createContext, useReducer, useContext } from "react";

// Create context
const ConversationsContext = createContext();

// Initial state
const initialState = {
  conversations: [], // List of conversations fetched from the backend
  activeConversationId: null, // Currently active conversation ID
  activeSessionId: null, // Currently active session ID
  messages: {}, // Messages for each conversation
};

// Reducer function
const conversationsReducer = (state, action) => {
  switch (action.type) {
    case "SET_CONVERSATIONS":
      return {
        ...state,
        conversations: action.payload, // Set all conversations
      };

    case "SET_ACTIVE_CONVERSATION":
      return {
        ...state,
        activeConversationId: action.payload.conversationId, // Set selected conversation ID
        activeSessionId: action.payload.sessionId, // Set the session ID for the active conversation
      };

    case "ADD_MESSAGES":
      const { conversationId, messages } = action.payload;

      // Process the messages to handle nested content for intents like hts_inquiry or cross_rulings_inquiry
      const formattedMessages = messages.map((message) => {
        if (typeof message.content === "object" && message.content.intent) {
          // If the message contains structured data (HTS, cross_rulings), handle formatting here
          return {
            ...message, // Keep other properties like role
            content: message.content, // Keep structured content for rendering in ChatWindow
          };
        }
        return message; // For simple text messages, return them as-is
      });

      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: formattedMessages, // Add formatted messages to the correct conversation
        },
      };
    case "ADD_MESSAGE":
      const { conversationId: id, message } = action.payload;

      // Normalize the message, always keeping the structure uniform
      const normalizedMessage = {
        role: message.role,
        content: message.content, // Keep the content as is, whether it's a string or an object
        intent: message.intent || null, // Add intent if available, else null
      };

      return {
        ...state,
        messages: {
          ...state.messages,
          [id]: [...(state.messages[id] || []), normalizedMessage], // Add new normalized message to existing ones
        },
      };

    case "CLEAR_CONVERSATIONS":
      return {
        ...state,
        conversations: [],
        activeConversationId: null,
        activeSessionId: null,
        messages: {},
      };

    default:
      return state;
  }
};

// Context provider component
export const ConversationsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(conversationsReducer, initialState);

  return (
    <ConversationsContext.Provider value={{ state, dispatch }}>
      {children}
    </ConversationsContext.Provider>
  );
};

// Hook to use conversations context
export const useConversations = () => useContext(ConversationsContext);
