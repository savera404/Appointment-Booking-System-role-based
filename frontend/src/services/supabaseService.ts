
import { supabase } from "@/integrations/supabase/client";
import type { Patient, Doctor, TimeSlot, Appointment, VoiceNote, Message } from "@/contexts/DataContext";

// Patient operations
export const patientsService = {
  async getAll(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(patient => ({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contact: patient.contact,
      condition: patient.condition,
      status: patient.status as 'Active' | 'Inactive' | 'Critical'
    })) || [];
  },

  async create(patient: Omit<Patient, 'id'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      age: data.age,
      gender: data.gender,
      contact: data.contact,
      condition: data.condition,
      status: data.status as 'Active' | 'Inactive' | 'Critical'
    };
  },

  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    // Exclude id from updates and convert types for database
    const { id: _, ...updateData } = updates;
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    
    if (updateData.name) dbUpdates.name = updateData.name;
    if (updateData.age) dbUpdates.age = updateData.age;
    if (updateData.gender) dbUpdates.gender = updateData.gender;
    if (updateData.contact) dbUpdates.contact = updateData.contact;
    if (updateData.condition) dbUpdates.condition = updateData.condition;
    if (updateData.status) dbUpdates.status = updateData.status;

    const { data, error } = await supabase
      .from('patients')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      age: data.age,
      gender: data.gender,
      contact: data.contact,
      condition: data.condition,
      status: data.status as 'Active' | 'Inactive' | 'Critical'
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Doctor operations
export const doctorsService = {
  async getAll(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      location: doctor.location,
      contact: doctor.contact,
      experience: doctor.experience,
      rating: doctor.rating,
      availability: doctor.availability as 'Available' | 'Busy' | 'Offline'
    })) || [];
  },

  async create(doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const { data, error } = await supabase
      .from('doctors')
      .insert(doctor)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      specialization: data.specialization,
      location: data.location,
      contact: data.contact,
      experience: data.experience,
      rating: data.rating,
      availability: data.availability as 'Available' | 'Busy' | 'Offline'
    };
  },

  async update(id: string, updates: Partial<Doctor>): Promise<Doctor> {
    // Exclude id from updates and convert types for database
    const { id: _, ...updateData } = updates;
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    
    if (updateData.name) dbUpdates.name = updateData.name;
    if (updateData.specialization) dbUpdates.specialization = updateData.specialization;
    if (updateData.location) dbUpdates.location = updateData.location;
    if (updateData.contact) dbUpdates.contact = updateData.contact;
    if (updateData.experience) dbUpdates.experience = updateData.experience;
    if (updateData.rating) dbUpdates.rating = updateData.rating;
    if (updateData.availability) dbUpdates.availability = updateData.availability;

    const { data, error } = await supabase
      .from('doctors')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      specialization: data.specialization,
      location: data.location,
      contact: data.contact,
      experience: data.experience,
      rating: data.rating,
      availability: data.availability as 'Available' | 'Busy' | 'Offline'
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Time slots operations
export const timeSlotsService = {
  async getAll(): Promise<TimeSlot[]> {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data?.map(slot => ({
      id: slot.id,
      doctorId: slot.doctor_id || '',
      doctorName: slot.doctor_name,
      date: slot.date,
      startTime: slot.start_time,
      endTime: slot.end_time,
      status: slot.status as 'Available' | 'Booked' | 'Blocked'
    })) || [];
  },

  async create(slot: Omit<TimeSlot, 'id'>): Promise<TimeSlot> {
    const { data, error } = await supabase
      .from('time_slots')
      .insert({
        doctor_id: slot.doctorId,
        doctor_name: slot.doctorName,
        date: slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
        status: slot.status
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      doctorId: data.doctor_id || '',
      doctorName: data.doctor_name,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status as 'Available' | 'Booked' | 'Blocked'
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Appointments operations
export const appointmentsService = {
  async getAll(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data?.map(appointment => ({
      id: appointment.id,
      patientName: appointment.patient_name,
      doctorName: appointment.doctor_name,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status as 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed',
      type: appointment.type,
      notes: appointment.notes
    })) || [];
  },

  async create(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_name: appointment.patientName,
        doctor_name: appointment.doctorName,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        type: appointment.type,
        notes: appointment.notes
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      patientName: data.patient_name,
      doctorName: data.doctor_name,
      date: data.date,
      time: data.time,
      status: data.status as 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed',
      type: data.type,
      notes: data.notes
    };
  },

  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.patientName) dbUpdates.patient_name = updates.patientName;
    if (updates.doctorName) dbUpdates.doctor_name = updates.doctorName;
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.time) dbUpdates.time = updates.time;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { data, error } = await supabase
      .from('appointments')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      patientName: data.patient_name,
      doctorName: data.doctor_name,
      date: data.date,
      time: data.time,
      status: data.status as 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed',
      type: data.type,
      notes: data.notes
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Voice notes operations
export const voiceNotesService = {
  async getAll(): Promise<VoiceNote[]> {
    const { data, error } = await supabase
      .from('voice_notes')
      .select('*')
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(note => ({
      id: note.id,
      name: note.name,
      duration: note.duration,
      uploadedAt: new Date(note.uploaded_at || ''),
      transcription: note.transcription || '',
      status: note.status as 'Processing' | 'Completed' | 'Error',
      aiAnalysis: note.ai_analysis as any
    })) || [];
  },

  async create(note: Omit<VoiceNote, 'id'>): Promise<VoiceNote> {
    const { data, error } = await supabase
      .from('voice_notes')
      .insert({
        name: note.name,
        duration: note.duration,
        uploaded_at: note.uploadedAt.toISOString(),
        transcription: note.transcription,
        status: note.status,
        ai_analysis: note.aiAnalysis
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      duration: data.duration,
      uploadedAt: new Date(data.uploaded_at || ''),
      transcription: data.transcription || '',
      status: data.status as 'Processing' | 'Completed' | 'Error',
      aiAnalysis: data.ai_analysis as any
    };
  },

  async update(id: string, updates: Partial<VoiceNote>): Promise<VoiceNote> {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.duration) dbUpdates.duration = updates.duration;
    if (updates.transcription !== undefined) dbUpdates.transcription = updates.transcription;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.aiAnalysis !== undefined) dbUpdates.ai_analysis = updates.aiAnalysis;

    const { data, error } = await supabase
      .from('voice_notes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      duration: data.duration,
      uploadedAt: new Date(data.uploaded_at || ''),
      transcription: data.transcription || '',
      status: data.status as 'Processing' | 'Completed' | 'Error',
      aiAnalysis: data.ai_analysis as any
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('voice_notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Messages operations
export const messagesService = {
  async getAll(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    return data?.map(message => ({
      id: message.id,
      text: message.text,
      isUser: message.is_user,
      timestamp: new Date(message.timestamp || ''),
      doctorRecommendation: message.doctor_recommendation as any
    })) || [];
  },

  async create(message: Omit<Message, 'id'>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        text: message.text,
        is_user: message.isUser,
        timestamp: message.timestamp.toISOString(),
        doctor_recommendation: message.doctorRecommendation
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      text: data.text,
      isUser: data.is_user,
      timestamp: new Date(data.timestamp || ''),
      doctorRecommendation: data.doctor_recommendation as any
    };
  },

  async clear(): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .neq('id', '');
    
    if (error) throw error;

    // Add initial message
    await this.create({
      text: "Hello! I'm your AI Medical Assistant. I can help you find the right doctor based on your symptoms and location. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    });
  }
};
