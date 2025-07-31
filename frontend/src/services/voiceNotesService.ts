const API_URL = "http://localhost:8000";

export const voiceNotesService = {
  async getAll() {
    const res = await fetch(`${API_URL}/voicenotes`);
    if (!res.ok) throw new Error("Failed to fetch voice notes");
    return res.json();
  },

  async create(note) {
    const res = await fetch(`${API_URL}/voicenotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error("Failed to create voice note");
    return res.json();
  },

  async update(id, updates) {
    const res = await fetch(`${API_URL}/voicenotes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update voice note");
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/voicenotes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete voice note");
    return res.json();
  },
}; 