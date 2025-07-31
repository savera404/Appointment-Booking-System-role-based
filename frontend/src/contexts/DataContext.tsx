import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { patientsService } from '@/services/patientsService';
import { doctorsService } from '@/services/doctorsService';
import { timeSlotsService } from '@/services/timeSlotsService';
import { appointmentsService } from '@/services/appointmentsService';
import { voiceNotesService } from '@/services/voiceNotesService';
import { messagesService } from '@/services/messagesService';
import { useAuth } from './AuthContext';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  condition: string;
  status: 'Active' | 'Inactive' | 'Critical';
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  contact: string;
  experience: number;
  rating: number;
  availability: 'Available' | 'Busy' | 'Offline';
  description?: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Available' | 'Booked' | 'Blocked';
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  type: string;
  notes?: string;
}

export interface VoiceNote {
  id: string;
  name: string;
  duration: string;
  uploadedAt: Date;
  transcription: string;
  status: 'Processing' | 'Completed' | 'Error';
  aiAnalysis?: {
    symptoms: string[];
    urgency: 'Low' | 'Medium' | 'High';
    recommendedSpecialty: string;
  };
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  doctorRecommendation?: {
    name: string;
    specialty: string;
    location: string;
    rating: number;
    availability: string;
  };
  doctorRecommendations?: {
    id: string;
    name: string;
    specialization: string;
    location: string;
    contact: string;
    experience: number;
    rating: number;
    availability: string;
    description: string;
  }[];
}

interface DataContextType {
  patients: Patient[];
  doctors: Doctor[];
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  voiceNotes: VoiceNote[];
  messages: Message[];
  loading: boolean;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addDoctor: (doctor: Omit<Doctor, 'id'>) => Promise<void>;
  updateDoctor: (id: string, doctor: Partial<Doctor>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  addTimeSlot: (slot: Omit<TimeSlot, 'id'>) => Promise<void>;
  deleteTimeSlot: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addVoiceNote: (note: Omit<VoiceNote, 'id'>) => Promise<void>;
  updateVoiceNote: (id: string, note: Partial<VoiceNote>) => Promise<void>;
  deleteVoiceNote: (id: string) => Promise<void>;
  addMessage: (message: Omit<Message, 'id'>) => Promise<void>;
  clearMessages: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log("=== DataContext loadData called ===");
      console.log("Token exists:", !!token);
      console.log("User:", user);
      console.log("User role:", user?.role);
      
      if (!token) {
        console.log("No token available, skipping data load");
        setLoading(false);
        return;
      }

      if (!user) {
        console.log("No user available, skipping data load");
        setLoading(false);
        return;
      }

      console.log("Loading data with token:", token ? "Token exists" : "No token");
      console.log("User role:", user?.role);

      // Load data based on user role
      if (user?.role === 'admin') {
        // Admin can see all data
        const [patientsData, doctorsData, timeSlotsData] = await Promise.all([
          patientsService.getAll(token),
          doctorsService.getAll(token),
          timeSlotsService.getAll(token)
        ]);

        console.log("Loaded patients:", patientsData.length);
        console.log("Loaded doctors:", doctorsData.length);
        console.log("Loaded time slots:", timeSlotsData.length);

        setPatients(patientsData);
        setDoctors(doctorsData);
        setTimeSlots(timeSlotsData);

        // Load all appointments for admin
        console.log("Loading all appointments for admin...");
        try {
          const appointmentsData = await appointmentsService.getAll(token);
          console.log("Loaded appointments for admin:", appointmentsData);
          setAppointments(appointmentsData);
        } catch (error) {
          console.error("Error loading admin appointments:", error);
          setAppointments([]);
        }
      } else if (user?.role === 'patient') {
        // Patient can only see their own profile and doctors
        const [doctorsData, timeSlotsData] = await Promise.all([
          doctorsService.getAll(token),
          timeSlotsService.getAll(token)
        ]);

        console.log("Loaded doctors:", doctorsData.length);
        console.log("Loaded time slots:", timeSlotsData.length);

        // For patients, we don't load all patients - they only see their own profile
        setPatients([]);
        setDoctors(doctorsData);
        setTimeSlots(timeSlotsData);

        // Load patient's own appointments
        console.log("Loading patient's own appointments...");
        try {
          const myAppointmentsData = await appointmentsService.getMyAppointments(token);
          console.log("Loaded patient appointments:", myAppointmentsData);
          console.log("First appointment structure:", myAppointmentsData[0]);
          console.log("First appointment keys:", Object.keys(myAppointmentsData[0] || {}));
          setAppointments(myAppointmentsData);
        } catch (error) {
          console.error("Error loading patient appointments:", error);
          setAppointments([]);
        }
      } else {
        console.log("Unknown user role, not loading data");
        setPatients([]);
        setDoctors([]);
        setTimeSlots([]);
        setAppointments([]);
      }

      // Remove voice notes and messages loading since those endpoints don't exist
      // const [voiceNotesData, messagesData] = await Promise.all([
      //   voiceNotesService.getAll(),
      //   messagesService.getAll()
      // ]);

      // setVoiceNotes(voiceNotesData);
      // setMessages(messagesData);
      
      console.log("=== DataContext loadData completed ===");
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when token or user changes
  useEffect(() => {
    loadData();
  }, [token, user]);

  // CRUD handlers
  const addPatient = async (patientData: Omit<Patient, 'id'>) => {
    if (!token) throw new Error("No authentication token");
    const newPatient = await patientsService.create(patientData, token);
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    if (!token) throw new Error("No authentication token");
    const updatedPatient = await patientsService.update(id, patientData, token);
    setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
  };

  const deletePatient = async (id: string) => {
    if (!token) throw new Error("No authentication token");
    
    // Use backend API instead of Supabase service
    const response = await fetch(`http://127.0.0.1:8000/patients/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete patient');
    }

    // Update local state
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const addDoctor = async (doctorData: Omit<Doctor, 'id'>) => {
    if (!token) throw new Error("No authentication token");
    const newDoctor = await doctorsService.create(doctorData, token);
    setDoctors(prev => [...prev, newDoctor]);
  };

  const updateDoctor = async (id: string, doctorData: Partial<Doctor>) => {
    if (!token) throw new Error("No authentication token");
    const updatedDoctor = await doctorsService.update(id, doctorData, token);
    setDoctors(prev => prev.map(d => d.id === id ? updatedDoctor : d));
  };

  const deleteDoctor = async (id: string) => {
    if (!token) throw new Error("No authentication token");
    
    // Use backend API instead of Supabase service
    const response = await fetch(`http://127.0.0.1:8000/doctors/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete doctor');
    }

    // Update local state
    setDoctors(prev => prev.filter(d => d.id !== id));
  };

  const addTimeSlot = async (slotData: Omit<TimeSlot, 'id'>) => {
    if (!token) throw new Error("No authentication token");
    const newSlot = await timeSlotsService.create(slotData, token);
    setTimeSlots(prev => [...prev, newSlot]);
  };

  const deleteTimeSlot = async (id: string) => {
    if (!token) throw new Error("No authentication token");
    
    // Use backend API instead of Supabase service
    const response = await fetch(`http://127.0.0.1:8000/availabilities/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete time slot');
    }

    // Update local state
    setTimeSlots(prev => prev.filter(s => s.id !== id));
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    if (!token) throw new Error("No authentication token");
    
    // Use different endpoint based on user role
    let newAppointment;
    if (user?.role === 'admin') {
      newAppointment = await appointmentsService.create(appointmentData, token);
    } else {
      // For patients, use the patient-create endpoint and set patient_id to current patient
      const patient = patients.find(p => p.contact === user?.contact);
      if (!patient) throw new Error("Patient profile not found");
      
      const patientAppointmentData = {
        ...appointmentData,
        patient_id: patient.id
      };
      
      newAppointment = await appointmentsService.createPatientAppointment(patientAppointmentData, token);
    }
    
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    if (!token) throw new Error("No authentication token");
    const updatedAppointment = await appointmentsService.update(id, appointmentData, token);
    setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));
  };

  const deleteAppointment = async (id: string) => {
    if (!token) throw new Error("No authentication token");
    
    // Use backend API instead of Supabase service
    const response = await fetch(`http://127.0.0.1:8000/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete appointment');
    }

    // Update local state
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const addVoiceNote = async (noteData: Omit<VoiceNote, 'id'>) => {
    const newNote = await voiceNotesService.create(noteData);
    setVoiceNotes(prev => [newNote, ...prev]);
  };
  const updateVoiceNote = async (id: string, noteData: Partial<VoiceNote>) => {
    const updated = await voiceNotesService.update(id, noteData);
    setVoiceNotes(prev => prev.map(n => n.id === id ? updated : n));
  };
  const deleteVoiceNote = async (id: string) => {
    await voiceNotesService.delete(id);
    setVoiceNotes(prev => prev.filter(n => n.id !== id));
  };

const addMessage = async (messageData: Omit<Message, 'id'>) => {
  // Always create a local message first to ensure UI updates immediately
  const tempMessage: Message = {
    id: Date.now().toString(),
    ...messageData
  };
  setMessages(prev => [...prev, tempMessage]);

  // Convert timestamp to string only for backend, keep Date for local state
  const messageForBackend = {
    ...messageData,
    timestamp: messageData.timestamp.toISOString(),
  };

  try {
    const newMessage = await messagesService.create(messageForBackend);
    setMessages(prev => prev.map(msg =>
      msg.id === tempMessage.id ? { ...newMessage, id: newMessage.id } : msg
    ));
  } catch (error) {
    console.error('Error saving message to backend:', error);
  }
};

  const clearMessages = async () => {
    try {
      // Clear backend session
      await fetch('http://localhost:8000/api/clear-session', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Error clearing backend session:', error);
    }
    setMessages([]);
  };

  return (
    <DataContext.Provider
      value={{
        patients,
        doctors,
        timeSlots,
        appointments,
        voiceNotes,
        messages,
        loading,
        addPatient,
        updatePatient,
        deletePatient,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addTimeSlot,
        deleteTimeSlot,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addVoiceNote,
        updateVoiceNote,
        deleteVoiceNote,
        addMessage,
        clearMessages,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

