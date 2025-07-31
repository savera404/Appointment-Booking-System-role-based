import { TimeSlot } from "@/contexts/DataContext";

const API_URL = "http://localhost:8000";

export const timeSlotsService = {
  async getAll(token: string): Promise<TimeSlot[]> {
    const res = await fetch(`${API_URL}/availabilities/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) throw new Error("Failed to fetch time slots");
    return res.json();
  },

  async create(slot: Omit<TimeSlot, "id">, token: string): Promise<TimeSlot> {
    const res = await fetch(`${API_URL}/availabilities/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(slot),
    });
    if (!res.ok) throw new Error("Failed to create time slot");
    return res.json();
  },

  async update(id: string, updates: Partial<TimeSlot>, token: string): Promise<TimeSlot> {
    const res = await fetch(`${API_URL}/availability/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update time slot");
    return res.json();
  },

  async delete(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_URL}/availabilities/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to delete time slot");
  },
}; 