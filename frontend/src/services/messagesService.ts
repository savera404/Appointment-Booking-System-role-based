const API_URL = "http://localhost:8000";

// Helper function to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
  };
};

export const messagesService = {
  async getAll() {
    const res = await fetch(`${API_URL}/messages/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  },

  async create(message) {
    console.log("Message being sent to /messages/", message);
    const res = await fetch(`${API_URL}/messages/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(message),
    });
    if (!res.ok) throw new Error("Failed to create message");
    return res.json();
  },

  async update(id, updates) {
    const res = await fetch(`${API_URL}/messages/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update message");
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/messages/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete message");
    return res.json();
  },
}; 