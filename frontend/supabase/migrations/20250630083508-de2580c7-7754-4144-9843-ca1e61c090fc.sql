
-- Create patients table
CREATE TABLE public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  contact TEXT NOT NULL,
  condition TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive', 'Critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  location TEXT NOT NULL,
  contact TEXT NOT NULL,
  experience INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.0,
  availability TEXT NOT NULL CHECK (availability IN ('Available', 'Busy', 'Offline')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_slots table
CREATE TABLE public.time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Available', 'Booked', 'Blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Confirmed', 'Pending', 'Cancelled', 'Completed')),
  type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voice_notes table
CREATE TABLE public.voice_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transcription TEXT,
  status TEXT NOT NULL CHECK (status IN ('Processing', 'Completed', 'Error')),
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for chat functionality
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  is_user BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  doctor_recommendation JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (you can restrict these later with authentication)
CREATE POLICY "Allow all operations on patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on doctors" ON public.doctors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on time_slots" ON public.time_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on voice_notes" ON public.voice_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- Insert some initial sample data
INSERT INTO public.patients (name, age, gender, contact, condition, status) VALUES
('John Smith', 35, 'Male', 'john@email.com', 'Hypertension', 'Active'),
('Emma Wilson', 28, 'Female', 'emma@email.com', 'Diabetes', 'Active'),
('Michael Brown', 42, 'Male', 'michael@email.com', 'Cardiac', 'Critical'),
('Sarah Davis', 31, 'Female', 'sarah@email.com', 'Asthma', 'Inactive');

INSERT INTO public.doctors (name, specialization, location, contact, experience, rating, availability) VALUES
('Dr. Sarah Johnson', 'Cardiology', 'New York', 'sarah.j@hospital.com', 12, 4.8, 'Available'),
('Dr. Michael Chen', 'Neurology', 'San Francisco', 'm.chen@medical.com', 8, 4.6, 'Busy'),
('Dr. Emily Rodriguez', 'Pediatrics', 'Los Angeles', 'emily.r@clinic.com', 15, 4.9, 'Available'),
('Dr. James Wilson', 'Orthopedics', 'Chicago', 'j.wilson@ortho.com', 10, 4.7, 'Offline');

INSERT INTO public.time_slots (doctor_id, doctor_name, date, start_time, end_time, status)
SELECT 
  d.id,
  d.name,
  '2024-01-15'::date,
  '09:00'::time,
  '10:00'::time,
  'Available'
FROM public.doctors d WHERE d.name = 'Dr. Sarah Johnson'
LIMIT 1;

INSERT INTO public.appointments (patient_name, doctor_name, date, time, status, type, notes) VALUES
('John Smith', 'Dr. Sarah Johnson', '2024-01-15', '10:00', 'Confirmed', 'Cardiology Consultation', 'Regular checkup'),
('Emma Wilson', 'Dr. Michael Chen', '2024-01-16', '14:00', 'Pending', 'Neurology Check-up', 'Follow-up appointment'),
('Michael Brown', 'Dr. Emily Rodriguez', '2024-01-14', '09:00', 'Completed', 'Pediatric Examination', 'Annual physical'),
('Sarah Davis', 'Dr. James Wilson', '2024-01-17', '11:00', 'Cancelled', 'Orthopedic Consultation', 'Knee pain assessment');

INSERT INTO public.voice_notes (name, duration, transcription, status, ai_analysis) VALUES
('Voice Note - Headache Symptoms', '2:34', 'I''ve been experiencing persistent headaches for the past three days.', 'Completed', 
'{"symptoms": ["Persistent headaches", "Right-sided pain"], "urgency": "Medium", "recommendedSpecialty": "Neurology"}'::jsonb),
('Voice Note - Chest Pain', '1:45', 'I''m having chest pain that started about an hour ago.', 'Completed',
'{"symptoms": ["Chest pain", "Pressure sensation"], "urgency": "High", "recommendedSpecialty": "Cardiology"}'::jsonb);

INSERT INTO public.messages (text, is_user) VALUES
('Hello! I''m your AI Medical Assistant. How can I assist you today?', false);
