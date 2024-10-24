export const getAIMessage = async (userQuery, sessionId) => {
    const apiUrl = 'https://backend.sayl.io/chatbot/query';
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No token found");
      }
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: userQuery, session_id: sessionId }),  // Include session_id in the request
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      
      // Normalize AI response format to match the stored message format
      let normalizedResponse;
  
      if (data.intent === "cross_rulings_inquiry") {
        normalizedResponse = {
          role: "assistant",
          content: {
            intent: data.ai_response.intent,
            message: data.ai_response.message,
            product: data.ai_response.product || null,
            best_ruling: data.ai_response.best_ruling || null,
            related_rulings: data.ai_response.related_rulings || [],
            gpt_insights: data.ai_response.gpt_insights || null
          }
        };
      } else if (data.intent === "hts_inquiry") {
        normalizedResponse = {
          role: "assistant",
          content: {
            intent: data.ai_response.intent,
            message: data.ai_response.message,
            product: data.ai_response.product || null,
            best_hts_code: data.ai_response.best_hts_code || null,
            related_hts_codes: data.ai_response.related_hts_codes || [],
            tariff_insights: data.ai_response.tariff_insights || null
          }
        };
      } else {
        normalizedResponse = {
          role: "assistant",
          content: {
            message: data.ai_response.message || "No content provided", // Store message inside content
          },
          intent: data.intent || "general" // Keep intent if available, default to "general"
        };
      }
      console.log("Normalized response", normalizedResponse);
      return normalizedResponse;
  
    } catch (error) {
      console.error("Failed to fetch AI message:", error);
      return {
        role: "assistant",
        content: "Sorry, there was an error processing your request.",
      };
    }
  };
  


  

export const loginUser = async (email, password) => {
    const apiUrl = 'https://backend.sayl.io/login';  // Update the URL as needed

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.access_token;  // Return the JWT token on successful login

    } catch (error) {
        console.error("Failed to login:", error);
        throw error;  // Propagate error to handle it in the component
    }
};

export const logoutUser = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
};

export const getUserConversations = async () => {
    const apiUrl = 'https://backend.sayl.io/conversations';  // Endpoint to fetch conversations

    try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Add the JWT token to the Authorization header
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;  // Return the list of conversations

    } catch (error) {
        console.error("Failed to fetch conversations:", error);
        return [];
    }
};

// Function to delete a conversation using session_id
export const deleteConversation = async (sessionId) => {
    const apiUrl = `https://backend.sayl.io/conversations/${sessionId}`;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,  // Add JWT token in headers
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error("Failed to delete conversation:", error);
        throw error;
    }
};

export const createNewConversation = async () => {
    const apiUrl = 'https://backend.sayl.io/conversations/create';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // Add JWT token in headers
            },
            body: JSON.stringify({}),  // No need to send anything in the body
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const newConversation = await response.json();
        return newConversation;

    } catch (error) {
        console.error("Failed to create conversation:", error);
        throw error;
    }
};

export const getConversationMessages = async (sessionId, page = 1) => {
    const apiUrl = `https://backend.sayl.io/conversations/${sessionId}/messages?page=${page}`;
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No token found");
      }
  
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data;  // This should contain the messages and pagination data
  
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      return null;
    }
  };