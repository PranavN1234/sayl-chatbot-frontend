import React, { useContext, useEffect } from "react";
import {
  Box,
  Heading,
  List,
  ListItem,
  IconButton,
  Button,
  Text,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";
import { useConversations } from "../context/Conversationcontext";
import { getUserConversations, deleteConversation, createNewConversation } from "../api/api";
import { getConversationMessages } from "../api/api"; 

function Sidebar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { state, dispatch } = useConversations(); // Access global state and dispatch

  // Function to handle logout
  
  // Function to handle logout
  const handleLogout = () => {
    // Clear the conversation state before logout
    dispatch({
      type: "CLEAR_CONVERSATIONS", // New action type to clear conversation state
    });
    
    logout(); // Perform logout
    navigate("/login"); // Redirect to login page after logout
  };

  // Fetch conversations on component load
  useEffect(() => {
    const fetchConversations = async () => {
      const conversations = await getUserConversations(); // Fetch conversations from API

      // Dispatch conversations to the global state
      dispatch({
        type: "SET_CONVERSATIONS",
        payload: conversations,
      });
    };

    fetchConversations();  // Trigger the fetch function when the component loads
  }, [dispatch]);

  const handleAddConversation = async () => {
    try {
      const newConversation = await createNewConversation();  // Call API to create conversation
  
      // Check if the new conversation has a default message and dispatch it
      const defaultMessage = {
        role: "assistant",
        content: {
          message: "Welcome! Ask me about cross rulings, HTS codes, or any other query.",
        },
        intent: "general",
      };
  
      // Update state with the new conversation and its default message
      dispatch({
        type: "SET_CONVERSATIONS",
        payload: [...state.conversations, newConversation],
      });
  
      // Set active conversation and include the default message
      dispatch({
        type: "SET_ACTIVE_CONVERSATION",
        payload: {
          conversationId: newConversation.id,
          sessionId: newConversation.session_id,
        },
      });
  
      // Add the default message to the new conversation
      dispatch({
        type: "ADD_MESSAGES",
        payload: {
          conversationId: newConversation.id,
          messages: [defaultMessage], // Add the default message
        },
      });
  
    } catch (error) {
      console.error("Failed to create new conversation:", error);
    }
  };

  // Handle deleting a conversation by session_id
  const handleDeleteConversation = async (sessionId) => {
    try {
      await deleteConversation(sessionId);  // Call API to delete conversation
      const updatedConversations = state.conversations.filter(
        (conversation) => conversation.session_id !== sessionId
      );
      dispatch({
        type: "SET_CONVERSATIONS",
        payload: updatedConversations,
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleSelectConversation = async (id, sessionId) => {
    // Set active conversation and session IDs
    dispatch({
      type: 'SET_ACTIVE_CONVERSATION',
      payload: { conversationId: id, sessionId },  // Pass both conversationId and sessionId
    });
  
    try {
      const messagesData = await getConversationMessages(sessionId);  // Fetch messages using sessionId
  
      if (messagesData && messagesData.messages) {
        const allMessages = messagesData.messages.flatMap(batch => batch.messages);
  
        dispatch({
          type: 'ADD_MESSAGES',
          payload: {
            conversationId: id,
            messages: allMessages,  // Add fetched messages to the state
          },
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  
  
  

  
  return (
    <Box
      width="250px"
      bg="#1b3875"
      color="white"
      display="flex"
      flexDirection="column"
      height="100vh"
      boxShadow="2px 0 5px rgba(0, 0, 0, 0.1)"
    >
      {/* Header of the sidebar */}
      <Box
        p="20px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Heading as="h3" size="md" color="white">
          Conversations
        </Heading>

        {/* Add Conversation Button */}
        <IconButton
          icon={<AddIcon />}
          size="sm"
          bg="transparent"
          aria-label="Add Conversation"
          onClick={handleAddConversation}  // Handle adding conversation later
          _hover={{ bg: "#5b7fd6" }}
          color="white"
        />
      </Box>

      {/* Conversation List taking up 75% height, scrollable */}
      <Box flex="1" height="75%" overflowY="auto" px="10px" pb="10px">
        <List spacing={3}>
          {state.conversations.map((conversation) => (
            <ListItem
              key={conversation.id}
              bg={state.activeConversationId === conversation.id ? "#5b7fd6" : "#2a4b94"}
              p="10px"
              borderRadius="8px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              _hover={{ bg: "#4467cc" }}
              cursor="pointer"
              onClick={() => handleSelectConversation(conversation.id, conversation.session_id)}
            >
              {/* Conversation name (session_id) */}
              <Text flex="1">{conversation.session_id}</Text>

              {/* Delete conversation button */}
              <IconButton
                icon={<DeleteIcon />}
                size="sm"
                bg="transparent"
                aria-label="Delete Conversation"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the select action
                  handleDeleteConversation(conversation.session_id);  // Use session_id to delete
                }}
                _hover={{ bg: "red.500" }}
                color="white"
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Logout button taking up 25% height and centered */}
      <Box
        height="25%"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg="#1b3875"
      >
        <Button
          colorScheme="red"
          onClick={handleLogout} // Trigger the logout function
          width="80%"
          _hover={{ bg: "red.600" }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;
