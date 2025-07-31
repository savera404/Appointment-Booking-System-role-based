import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Clock, Plus, Trash2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import type { TimeSlot } from "@/contexts/DataContext";

const AvailabilityPage = () => {
  const { doctors, timeSlots, addTimeSlot, deleteTimeSlot } = useData();
  const { toast } = useToast();
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    doctorId: "", date: "", startTime: "", endTime: ""
  });

  const filteredSlots = selectedDoctor 
    ? timeSlots.filter(slot => slot.doctorId === selectedDoctor)
    : timeSlots;

  const handleAddSlot = async () => {
    if (newSlot.doctorId && newSlot.date && newSlot.startTime && newSlot.endTime) {
      try {
        const doctor = doctors.find(d => d.id === newSlot.doctorId);
        await addTimeSlot({
          ...newSlot,
          doctorName: doctor?.name || "",
          status: "Available" as const,
        });
        setNewSlot({ doctorId: "", date: "", startTime: "", endTime: "" });
        setIsAddModalOpen(false);
        toast({
          title: "Success",
          description: "Time slot added successfully!",
        });
      } catch (error) {
        console.error('Error adding time slot:', error);
        toast({
          title: "Error",
          description: "Failed to add time slot. Please try again.",
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

  const handleDeleteSlot = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this time slot? This action cannot be undone.")) {
      try {
        await deleteTimeSlot(id);
        toast({
          title: "Success",
          description: "Time slot deleted successfully!",
        });
      } catch (error) {
        console.error('Error deleting time slot:', error);
        toast({
          title: "Error",
          description: "Failed to delete time slot. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Booked': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Blocked': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    return slots.reduce((groups, slot) => {
      const date = slot.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {} as Record<string, TimeSlot[]>);
  };

  const groupedSlots = groupSlotsByDate(filteredSlots);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <SidebarTrigger className="text-white hover:bg-glass-light p-2 rounded-lg" />
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-medical-accent" />
          <h1 className="text-3xl font-bold text-white">Doctor Availability</h1>
        </div>
      </div>

      {/* Header Controls */}
      <div className="card-glass">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-4 items-center">
            <Label className="text-slate-300 whitespace-nowrap">Filter by Doctor:</Label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="p-2 bg-glass border border-glass-border rounded-md text-white min-w-[200px]"
            >
              <option value="">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
              ))}
            </select>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Time Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="modal-glass text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Add Availability Slot</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Doctor</Label>
                  <select
                    value={newSlot.doctorId}
                    onChange={(e) => setNewSlot({ ...newSlot, doctorId: e.target.value })}
                    className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-slate-300">Date</Label>
                  <Input
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                    className="bg-glass border-glass-border text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Start Time</Label>
                    <Input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="bg-glass border-glass-border text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">End Time</Label>
                    <Input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="bg-glass border-glass-border text-white"
                    />
                  </div>
                </div>
                <Button onClick={handleAddSlot} className="btn-primary w-full">
                  Add Slot
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Availability Calendar */}
      <div className="space-y-6">
        {Object.keys(groupedSlots).length === 0 ? (
          <div className="card-glass text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
            <p className="text-slate-400">No availability slots found.</p>
          </div>
        ) : (
          Object.entries(groupedSlots).map(([date, slots]) => (
            <div key={date} className="card-glass">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-medical-accent" />
                <h3 className="text-xl font-semibold text-white">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {slots.map((slot) => (
                  <div key={slot.id} className="glass-light rounded-xl p-4 group hover:scale-105 transition-all duration-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-medium">{slot.doctorName}</div>
                        <div className="text-slate-300 text-sm">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(slot.status)} border text-xs`}>
                        {slot.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-slate-400 hover:text-red-400 hover:bg-glass-light"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AvailabilityPage;
