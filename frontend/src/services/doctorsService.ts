import { Doctor } from "@/contexts/DataContext";

const API_URL = "http://localhost:8000";

export const doctorsService = {
  async getAll(token: string): Promise<Doctor[]> {
    const res = await fetch(`${API_URL}/doctors/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) throw new Error("Failed to fetch doctors");
    return res.json();
  },

  async create(doctor: Omit<Doctor, "id">, token: string): Promise<Doctor> {
    const res = await fetch(`${API_URL}/doctors/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(doctor),
    });
    if (!res.ok) throw new Error("Failed to create doctor");
    return res.json();
  },

  async update(id: string, updates: Partial<Doctor>, token: string): Promise<Doctor> {
    const res = await fetch(`${API_URL}/doctors/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update doctor");
    return res.json();
  },

  async delete(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_URL}/doctors/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to delete doctor");
  },
}; 