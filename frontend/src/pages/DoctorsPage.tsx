
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserCheck, UserPlus, Trash2, Search, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

const DoctorsPage = () => {
  const { doctors, addDoctor, deleteDoctor } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "", specialization: "", location: "", contact: "", experience: "", rating: "4.0", description: ""
  });

  const specializations = [...new Set(doctors.map(d => d.specialization))];

  const filteredDoctors = doctors.filter(doctor =>
    (doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doctor.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterSpecialization === "" || doctor.specialization === filterSpecialization)
  );

  const handleAddDoctor = async () => {
    if (newDoctor.name && newDoctor.specialization && newDoctor.location && newDoctor.contact) {
      try {
        await addDoctor({
          ...newDoctor,
          experience: parseInt(newDoctor.experience) || 0,
          rating: parseFloat(newDoctor.rating),
          availability: "Available" as const,
        });
        setNewDoctor({ name: "", specialization: "", location: "", contact: "", experience: "", rating: "4.0", description: "" });
        setIsAddModalOpen(false);
        toast({
          title: "Success",
          description: "Doctor added successfully!",
        });
      } catch (error) {
        console.error('Error adding doctor:', error);
        toast({
          title: "Error",
          description: "Failed to add doctor. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Specialization, Location, Contact)",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) {
      try {
        await deleteDoctor(id);
        toast({
          title: "Success",
          description: "Doctor deleted successfully!",
        });
      } catch (error) {
        console.error('Error deleting doctor:', error);
        toast({
          title: "Error",
          description: "Failed to delete doctor. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Busy': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Offline': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* ... keep existing code (header) */}
      <div className="flex items-center gap-4 mb-8">
        <SidebarTrigger className="text-white hover:bg-glass-light p-2 rounded-lg" />
        <div className="flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-medical-secondary" />
          <h1 className="text-3xl font-bold text-white">Doctor Directory</h1>
        </div>
      </div>

      {/* Header Actions */}
      <div className="card-glass">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search doctors by name, specialty, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-glass border-glass-border text-white placeholder:text-slate-400"
              />
            </div>
            
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className="p-2 bg-glass border border-glass-border rounded-md text-white min-w-[200px]"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="btn-secondary">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="modal-glass text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Add New Doctor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Name</Label>
                  <Input
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    className="bg-glass border-glass-border text-white"
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Specialization</Label>
                  <Input
                    value={newDoctor.specialization}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                    className="bg-glass border-glass-border text-white"
                    placeholder="Cardiology, Neurology, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Location</Label>
                    <select
                      value={newDoctor.location}
                      onChange={(e) => setNewDoctor({ ...newDoctor, location: e.target.value })}
                      className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
                    >
                      <option value="">Select Location</option>
                      <option value="Karachi">Karachi</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-slate-300">Experience (years)</Label>
                    <Input
                      type="number"
                      value={newDoctor.experience}
                      onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
                      className="bg-glass border-glass-border text-white"
                      placeholder="5"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Contact</Label>
                  <Input
                    value={newDoctor.contact}
                    onChange={(e) => setNewDoctor({ ...newDoctor, contact: e.target.value })}
                    className="bg-glass border-glass-border text-white"
                    placeholder="email@hospital.com"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Description</Label>
                  <Input
                    value={newDoctor.description}
                    onChange={(e) => setNewDoctor({ ...newDoctor, description: e.target.value })}
                    className="bg-glass border-glass-border text-white"
                    placeholder="Brief description of services"
                  />
                </div>
                <Button onClick={handleAddDoctor} className="btn-secondary w-full">
                  Add Doctor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="card-glass group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">{doctor.name}</h3>
                <p className="text-medical-accent font-medium">{doctor.specialization}</p>
              </div>
              <Badge className={`${getAvailabilityColor(doctor.availability)} border`}>
                {doctor.availability}
              </Badge>
            </div>
            
            <div className="space-y-2 text-slate-300 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-300" />
                <span>{doctor.location}</span>
              </div>
              <div className="flex justify-between">
                <span>Experience: {doctor.experience} years</span>
                <span className="text-yellow-400">★ {doctor.rating}</span>
              </div>
              <div className="text-sm">{doctor.contact}</div>
              {doctor.description && (
                <div className="text-sm text-slate-400 mt-2 italic">{doctor.description}</div>
              )}
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteDoctor(doctor.id)}
                className="text-slate-400 hover:text-red-400 hover:bg-glass-light flex-1"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="card-glass text-center py-12">
          <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
          <p className="text-slate-400">No doctors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
