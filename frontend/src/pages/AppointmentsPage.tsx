import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, Plus, Trash2, Edit, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useData, type Appointment } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface TimeSlot {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "Available" | "Booked" | "Blocked";
}

const AppointmentsPage = () => {
  const { appointments, patients, doctors, addAppointment, updateAppointment, deleteAppointment } = useData();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [newAppointment, setNewAppointment] = useState({ 
    patient_id: "", 
    doctor_id: "", 
    date: "", 
    time: "", 
    condition: "" 
  });
  
  // New state for time slots
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

  const appointmentTypes = ["Consultation", "Check-up", "Follow-up", "Emergency", "Surgery"];

  // For patients, show only their own appointments
  const userAppointments = appointments;

  const filteredAppointments = userAppointments.filter(appointment =>
    (appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     appointment.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     appointment.condition?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === "" || appointment.status === filterStatus)
  );

  // Function to fetch available time slots for a doctor
  const fetchAvailableTimeSlots = async (doctorId: string) => {
    if (!doctorId) {
      setAvailableTimeSlots([]);
      setSelectedTimeSlot(null);
      return;
    }

    setIsLoadingSlots(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/availabilities/doctor/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch time slots');
      }

      const slots = await response.json();
      
      // Filter only available slots and future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      
      const availableSlots = slots.filter((slot: TimeSlot) => {
        // Check if slot is available
        if (slot.status !== "Available") return false;
        
        // Check if date is in the future
        const slotDate = new Date(slot.date);
        slotDate.setHours(0, 0, 0, 0);
        
        // For today's slots, also check if the time has passed
        if (slotDate.getTime() === today.getTime()) {
          const now = new Date();
          const slotTime = new Date(`${slot.date}T${slot.startTime}`);
          return slotTime > now;
        }
        
        return slotDate > today;
      });
      
      setAvailableTimeSlots(availableSlots);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available time slots",
        variant: "destructive"
      });
      setAvailableTimeSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Handle doctor selection
  const handleDoctorChange = (doctorId: string) => {
    setNewAppointment({ ...newAppointment, doctor_id: doctorId, date: "", time: "" });
    fetchAvailableTimeSlots(doctorId);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setNewAppointment({ 
      ...newAppointment, 
      date: slot.date, 
      time: slot.startTime 
    });
  };

  const handleAddAppointment = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to book an appointment",
        variant: "destructive"
      });
      return;
    }

    if (newAppointment.patient_id && newAppointment.doctor_id && newAppointment.date && newAppointment.time && newAppointment.condition) {
      try {
        // Use backend API instead of DataContext to ensure slot status is updated
        const response = await fetch('http://127.0.0.1:8000/appointments/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            patient_id: newAppointment.patient_id,
            doctor_id: newAppointment.doctor_id,
            date: newAppointment.date,
            time: newAppointment.time,
            condition: newAppointment.condition
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to book appointment');
        }

        const createdAppointment = await response.json();
        
        // Add to local state
        addAppointment({ 
          ...createdAppointment, 
          status: "Pending" as const 
        });
        
        setNewAppointment({ patient_id: "", doctor_id: "", date: "", time: "", condition: "" });
        setAvailableTimeSlots([]);
        setSelectedTimeSlot(null);
        setIsAddModalOpen(false);
        
        toast({
          title: "Success",
          description: "Appointment booked successfully!",
        });
      } catch (error) {
        console.error('Error booking appointment:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to book appointment. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteAppointment(id);
        toast({
          title: "Success",
          description: "Appointment deleted successfully!",
        });
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete appointment. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleStatusChange = (id: string, newStatus: Appointment["status"]) => {
    updateAppointment(id, { status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <SidebarTrigger className="text-white hover:bg-glass-light p-2 rounded-lg" />
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-medical-primary" />
          <h1 className="text-3xl font-bold text-white">
            {user?.role === 'admin' ? 'Appointment Management' : 'My Appointments'}
          </h1>
        </div>
      </div>

      {/* Filters + Book */}
      <div className="card-glass">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-glass border-glass-border text-white placeholder:text-slate-400"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 bg-glass border border-glass-border rounded-md text-white min-w-[150px]"
            >
              <option value="">All Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Show Book Appointment for both admins and patients */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                {user?.role === 'admin' ? 'Book Appointment' : 'Book New Appointment'}
              </Button>
            </DialogTrigger>
            <DialogContent className="modal-glass text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {user?.role === 'admin' ? 'Book New Appointment' : 'Book Your Appointment'}
                </DialogTitle>
                <DialogDescription>
                  Please select a patient, doctor, and available time slot for the appointment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Fields */}
                {user?.role === 'admin' && (
                  <div>
                    <Label>Patient</Label>
                    <select
                      value={newAppointment.patient_id}
                      onChange={(e) => setNewAppointment({ ...newAppointment, patient_id: e.target.value })}
                      className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
                    >
                      <option value="">Select Patient</option>
                      {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <Label>Doctor</Label>
                  <select
                    value={newAppointment.doctor_id}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>)}
                  </select>
                </div>

                {/* Available Time Slots */}
                {newAppointment.doctor_id && (
                  <div>
                    <Label>Available Time Slots</Label>
                    {isLoadingSlots ? (
                      <div className="p-4 text-center text-slate-400">
                        Loading available slots...
                      </div>
                    ) : availableTimeSlots.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {availableTimeSlots.map((slot) => (
                          <div
                            key={slot.id}
                            onClick={() => handleTimeSlotSelect(slot)}
                            className={`p-3 border rounded-md cursor-pointer transition-colors ${
                              selectedTimeSlot?.id === slot.id
                                ? 'bg-medical-primary/20 border-medical-primary text-medical-primary'
                                : 'bg-glass border-glass-border text-white hover:bg-glass-light'
                            }`}
                          >
                            <div className="font-medium">
                              {new Date(slot.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-slate-300">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-400 border border-glass-border rounded-md">
                        No available time slots for this doctor
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Time Slot Display */}
                {selectedTimeSlot && (
                  <div className="p-3 bg-medical-primary/10 border border-medical-primary/30 rounded-md">
                    <div className="text-sm text-medical-accent font-medium">Selected Slot:</div>
                    <div className="text-white">
                      {new Date(selectedTimeSlot.date).toLocaleDateString()} at {selectedTimeSlot.startTime}
                    </div>
                  </div>
                )}

                <div>
                  <Label>Condition/Symptoms</Label>
                  <Input
                    value={newAppointment.condition}
                    onChange={(e) => setNewAppointment({ ...newAppointment, condition: e.target.value })}
                    className="bg-glass border-glass-border text-white"
                    placeholder="e.g., Headache, Cold, Flu"
                  />
                </div>

                <Button 
                  onClick={handleAddAppointment} 
                  className="btn-primary w-full"
                  disabled={!selectedTimeSlot}
                >
                  {user?.role === 'admin' ? 'Book Appointment' : 'Book My Appointment'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="card-glass text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
            <p className="text-slate-400">
              {user?.role === 'admin' ? 'No appointments found.' : 'You have no appointments yet.'}
            </p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => {
            const fileInputRef = useRef<HTMLInputElement>(null);
            const [keyPoints, setKeyPoints] = useState<string[]>([]);
            const [isUploading, setIsUploading] = useState(false);

            const handleUploadClick = () => fileInputRef.current?.click();

            const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setIsUploading(true);
              const formData = new FormData();
              formData.append("audio_file", file);
              
              try {
                const response = await fetch(`http://127.0.0.1:8000/appointments/${appointment.id}/upload-audio`, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${token}`
                  },
                  body: formData,
                });
                if (!response.ok) {
                  const errorText = await response.text();
                  console.error("Upload failed", response.status, response.statusText, errorText);
                  throw new Error("Upload failed");
                }
                const data = await response.json();
                setKeyPoints(data.key_points || []);
                alert("✅ Audio uploaded successfully!");
              } catch (err) {
                console.error("Upload failed", err);
                alert("Failed to upload audio");
              } finally {
                setIsUploading(false);
              }
            };

            return (
              <div key={appointment.id} className="card-glass hover:scale-[1.01] transition-all duration-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-white">{appointment.patientName}</h3>
                      <Badge className={`${getStatusColor(appointment.status)} border w-fit`}>{appointment.status}</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                      <div><strong className="text-medical-accent">Doctor:</strong> {appointment.doctorName}</div>
                      <div><strong className="text-medical-accent">Date:</strong> {new Date(appointment.date).toLocaleDateString()}</div>
                      <div><strong className="text-medical-accent">Time:</strong> {appointment.time}</div>
                    </div>

                    <div className="mt-2 text-slate-300">
                      <strong className="text-medical-accent">Type:</strong> {appointment.type}
                    </div>

                    {appointment.notes && (
                      <div className="mt-2 text-slate-400 text-sm">
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}

                    {/* Only show voice note features for patients */}
                    {user?.role === 'patient' && appointment.status === "Completed" && (
                      <div className="mt-4">
                        <input
                          type="file"
                          accept="audio/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                        
                        {/* Upload indicator */}
                        {isUploading && (
                          <div className="mb-3 p-3 bg-medical-primary/10 border border-medical-primary/30 rounded-lg">
                            <div className="flex items-center gap-2 text-medical-primary">
                              <div className="w-4 h-4 border-2 border-medical-primary border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm">Uploading audio file...</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button 
                            onClick={handleUploadClick} 
                            className="btn-primary flex-1"
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Uploading...
                              </>
                            ) : (
                              'Upload Voice Note'
                            )}
                          </Button>

                          <Button
                            className="btn-secondary flex-1"
                            onClick={() => navigate(`/voice-note/${appointment.id}`)}
                            disabled={isUploading}
                          >
                            Chat About This Appointment
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Only show management buttons for admins */}
                  {user?.role === 'admin' && (
                    <div className="flex gap-2 flex-wrap">
                      {appointment.status === "Confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, "Completed")}
                          className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                        >
                          Mark as Completed
                        </Button>
                      )}
                      {appointment.status !== "Cancelled" && appointment.status !== "Completed" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, "Cancelled")}
                          className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-slate-400 hover:text-red-400 hover:bg-glass-light"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;