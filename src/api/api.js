export const getAIMessage = async (userQuery) => {
    const apiUrl = 'http://127.0.0.1:8000/chatbot/query';

    try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Add the JWT token to the Authorization header
            },
            body: JSON.stringify({ query: userQuery }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Check for different intents and handle the response accordingly
        if (data.intent === "cross_rulings_inquiry") {
            return {
                role: "assistant",
                intent: data.intent,
                content: data.message,
                product: data.product || null,
                best_ruling: data.best_ruling || null,  // Handle missing best ruling
                related_rulings: data.related_rulings || [],  // Handle missing related rulings
                gpt_insights: data.gpt_insights || null  // Handle missing GPT insights
            };
        } else if (data.intent === "hts_inquiry") {
            return {
                role: "assistant",
                intent: data.intent,
                content: data.message,
                product: data.product || null,
                best_hts_code: data.best_hts_code || null,  // Handle missing best HTS code
                related_hts_codes: data.related_hts_codes || [],  // Handle missing related HTS codes
                tariff_insights: data.tariff_insights || null  // Handle missing tariff insights
            };
        } else {
            // Handle any other type of response
            return {
                role: "assistant",
                intent: data.intent,
                content: data.message,  // General message content
            };
        }

    } catch (error) {
        console.error("Failed to fetch AI message:", error);
        return {
            role: "assistant",
            content: "Sorry, there was an error processing your request.",
        };
    }
};

export const loginUser = async (email, password) => {
    const apiUrl = 'http://127.0.0.1:8000/login';  // Update the URL as needed

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

