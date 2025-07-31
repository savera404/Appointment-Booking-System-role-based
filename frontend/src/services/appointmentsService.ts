const API_URL = "http://localhost:8000";

export const appointmentsService = {
  async getAll(token: string) {
    console.log("Calling getAll appointments with token:", token ? "Token exists" : "No token");
    const res = await fetch(`${API_URL}/appointments/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    console.log("getAll appointments response status:", res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("getAll appointments error:", errorText);
      throw new Error("Failed to fetch appointments");
    }
    const data = await res.json();
    console.log("getAll appointments response data:", data);
    return data;
  },

  async getMyAppointments(token: string) {
    console.log("Calling getMyAppointments with token:", token ? "Token exists" : "No token");
    const res = await fetch(`${API_URL}/appointments/my-appointments`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    console.log("getMyAppointments response status:", res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("getMyAppointments error:", errorText);
      throw new Error("Failed to fetch my appointments");
    }
    const data = await res.json();
    console.log("getMyAppointments response data:", data);
    return data;
  },

  async create(appointment: any, token: string) {
    const res = await fetch(`${API_URL}/appointments/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(appointment),
    });
    if (!res.ok) throw new Error("Failed to create appointment");
    return res.json();
  },

  async createPatientAppointment(appointment: any, token: string) {
    const res = await fetch(`${API_URL}/appointments/patient-create`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(appointment),
    });
    if (!res.ok) throw new Error("Failed to create patient appointment");
    return res.json();
  },

  async createFromChat(appointmentData: any, token: string) {
    const res = await fetch(`${API_URL}/api/book-appointment-from-chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData),
    });
    if (!res.ok) throw new Error("Failed to create appointment from chat");
    return res.json();
  },

  async update(id: string, updates: any, token: string) {
    // If only updating status, use the status-specific endpoint
    if (Object.keys(updates).length === 1 && updates.status) {
      const res = await fetch(`${API_URL}/appointments/status/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: updates.status }),
      });
      if (!res.ok) throw new Error("Failed to update appointment status");
      return res.json();
    }
    
    // For full updates, use the regular PUT endpoint
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update appointment");
    return res.json();
  },

  async delete(id: string, token: string) {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to delete appointment");
    return res.json();
  },
}; 