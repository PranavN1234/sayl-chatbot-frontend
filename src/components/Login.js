import React, { useState, useContext } from "react";
import { Box, Input, Button, VStack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/Authcontext"; // Import AuthContext
import { loginUser, getUserConversations, getConversationMessages } from "../api/api"; // Import the loginUser function to call the API
import { useConversations } from "../context/Conversationcontext"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // To handle errors
  const { login } = useContext(AuthContext);
  const { dispatch } = useConversations(); 
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const token = await loginUser(email, password); // Call the login API
      if (token) {
        login(token); // Save token to the context and localStorage
  
        // Fetch the user's conversations
        const conversations = await getUserConversations();
  
        if (conversations.length > 0) {
          const lastConversation = conversations[conversations.length - 1];
  
          // Dispatch to set conversations and the most recent one as active
          dispatch({ type: "SET_CONVERSATIONS", payload: conversations });
          dispatch({
            type: "SET_ACTIVE_CONVERSATION",
            payload: {
              conversationId: lastConversation.id,
              sessionId: lastConversation.session_id,
            },
          });
  
          // Fetch the messages for the most recent conversation
          const messagesData = await getConversationMessages(lastConversation.session_id);
          if (messagesData && messagesData.messages) {
            const allMessages = messagesData.messages.flatMap(batch => batch.messages);
  
            // Dispatch the messages to the conversation state, including the default message
            dispatch({
              type: "ADD_MESSAGES",
              payload: {
                conversationId: lastConversation.id,
                messages: allMessages,
              },
            });
          }
        }
  
        navigate("/chat"); // Redirect to the chat page after login
      }
    } catch (err) {
      setError("Invalid username or password."); // Set error message on failure
    }
  };
  

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bg="gray.100"
    >
      <VStack spacing={4} padding={8} bg="white" boxShadow="md" borderRadius="lg">
        <Text fontSize="xl" fontWeight="bold">
          Login
        </Text>
        <Input
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Text color="red.500">{error}</Text>}
        <Button colorScheme="blue" onClick={handleLogin}>
          Login
        </Button>
      </VStack>
    </Box>
  );
}

export default Login;
