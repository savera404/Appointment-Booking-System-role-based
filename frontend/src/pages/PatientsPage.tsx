
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Users, UserPlus, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

const PatientsPage = () => {
  const { patients, addPatient, deletePatient } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "", age: "", gender: "", contact: "", condition: "", status: "Active" as const
  });

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = async () => {
    if (newPatient.name && newPatient.age && newPatient.contact) {
      try {
        await addPatient({
          ...newPatient,
          age: parseInt(newPatient.age),
        });
        setNewPatient({ name: "", age: "", gender: "", contact: "", condition: "", status: "Active" });
        setIsAddModalOpen(false);
        toast({
          title: "Success",
          description: "Patient added successfully!",
        });
      } catch (error) {
        console.error('Error adding patient:', error);
        toast({
          title: "Error",
          description: "Failed to add patient. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Age, Contact)",
        variant: "destructive"
      });
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      try {
        await deletePatient(id);
        toast({
          title: "Success",
          description: "Patient deleted successfully!",
        });
      } catch (error) {
        console.error('Error deleting patient:', error);
        toast({
          title: "Error",
          description: "Failed to delete patient. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* ... keep existing code (header) */}
      <div className="flex items-center gap-4 mb-8">
        <SidebarTrigger className="text-white hover:bg-glass-light p-2 rounded-lg" />
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-medical-primary" />
          <h1 className="text-3xl font-bold text-white">Patient Management</h1>
        </div>
      </div>

      {/* Header Actions */}
      <div className="card-glass">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search patients by name or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-glass border-glass-border text-white placeholder:text-slate-400"
            />
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="modal-glass text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Add New Patient</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Name</Label>
                  <Input
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="bg-glass border-glass-border text-white"
                    placeholder="Enter patient name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Age</Label>
                    <Input
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                      className="bg-glass border-glass-border text-white"
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Gender</Label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Contact</Label>
                  <Input
                    value={newPatient.contact}
                    onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })}
                    className="bg-glass border-glass-border text-white"
                    placeholder="Email or phone"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Condition</Label>
                  <Input
                    value={newPatient.condition}
                    onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
                    className="bg-glass border-glass-border text-white"
                    placeholder="Medical condition"
                  />
                </div>
                <Button onClick={handleAddPatient} className="btn-primary w-full">
                  Add Patient
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Patients Table */}
      <div className="table-glass">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Registered Patients ({filteredPatients.length})
          </h2>
          
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No patients found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-glass-border">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Age</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Gender</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Contact</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Condition</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-glass-border/50 hover:bg-glass-light transition-colors">
                      <td className="py-4 px-4 text-white font-medium">{patient.name}</td>
                      <td className="py-4 px-4 text-slate-300">{patient.age}</td>
                      <td className="py-4 px-4 text-slate-300">{patient.gender}</td>
                      <td className="py-4 px-4 text-slate-300">{patient.contact}</td>
                      <td className="py-4 px-4 text-slate-300">{patient.condition}</td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusColor(patient.status)} border`}>
                          {patient.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-slate-400 hover:text-red-400 hover:bg-glass-light"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
