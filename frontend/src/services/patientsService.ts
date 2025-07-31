import { Patient } from "@/contexts/DataContext";

const API_URL = "http://localhost:8000";

export const patientsService = {
  async getAll(token: string): Promise<Patient[]> {
    const res = await fetch(`${API_URL}/patients/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) throw new Error("Failed to fetch patients");
    return res.json();
  },

  async create(patient: Omit<Patient, "id">, token: string): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(patient),
    });
    if (!res.ok) throw new Error("Failed to create patient");
    return res.json();
  },

  async update(id: string, updates: Partial<Patient>, token: string): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update patient");
    return res.json();
  },

  async delete(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to delete patient");
    // DELETE usually returns 204, no JSON to parse
  },
};
