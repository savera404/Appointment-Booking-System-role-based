import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { Calendar, MessageCircle, UserCheck, Clock, Users, Mic, Settings, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, doctors, appointments } = useData();

  // Admin features
  const adminFeatures = [
    {
      icon: Users,
      title: "Patient Management",
      description: "View and manage all patient records and profiles"
    },
    {
      icon: UserCheck,
      title: "Doctor Directory",
      description: "Manage doctor profiles, specializations, and availability"
    },
    {
      icon: Calendar,
      title: "Appointment Management",
      description: "Oversee all appointments, confirmations, and scheduling"
    },
    {
      icon: Clock,
      title: "Availability Control",
      description: "Set and manage doctor availability and time slots"
    }
  ];

  // Patient features
  const patientFeatures = [
    {
      icon: MessageCircle,
      title: "AI Medical Assistant",
      description: "Get instant medical recommendations and doctor suggestions based on your symptoms"
    },
    {
      icon: Calendar,
      title: "Smart Appointment Booking",
      description: "Book appointments with doctors based on AI recommendations and availability"
    },
    {
      icon: Mic,
      title: "Voice-Powered Consultations",
      description: "Describe symptoms through voice notes and get AI-powered medical guidance"
    },
    {
      icon: UserCheck,
      title: "Expert Doctor Network",
      description: "Connect with specialized doctors matched to your specific medical needs"
    }
  ];

  // Admin stats
  const adminStats = [
    { label: "Total Patients", value: patients.length.toString() },
    { label: "Active Doctors", value: doctors.length.toString() },
    { label: "Total Appointments", value: appointments.length.toString() },
    { label: "Pending Appointments", value: appointments.filter(a => a.status === "Pending").length.toString() }
  ];

  // Patient stats
  const patientStats = [
    { label: "Active Patients", value: "2,500+" },
    { label: "Medical Specialists", value: "150+" },
    { label: "Successful Consultations", value: "10,000+" },
    { label: "AI Accuracy Rate", value: "95%" }
  ];

  const isAdmin = user?.role === 'admin';
  const features = isAdmin ? adminFeatures : patientFeatures;
  const stats = isAdmin ? adminStats : patientStats;

  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <SidebarTrigger className="text-white hover:bg-glass-light p-2 rounded-lg" />
        <h1 className="text-2xl font-bold text-white">
          {isAdmin ? "Admin Dashboard" : "Medical Flow Dashboard"}
        </h1>
      </div>

      {/* Hero Section */}
      <div className="card-glass mb-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-medical-primary to-medical-accent bg-clip-text text-transparent">
            {isAdmin 
              ? "Healthcare Management Dashboard" 
              : "Book Appointments Instantly with Our AI Medical Assistant"
            }
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {isAdmin 
              ? "Comprehensive healthcare management platform for overseeing patients, doctors, appointments, and system operations."
              : "Experience the future of healthcare with our AI-powered platform that connects you with the right doctors, manages your appointments, and provides instant medical guidance."
            }
          </p>
          {!isAdmin && (
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                onClick={() => navigate('/chat')} 
                className="btn-primary text-lg px-8 py-4"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Start AI Chat
              </Button>
              <Button 
                onClick={() => navigate('/appointments')} 
                className="btn-secondary text-lg px-8 py-4"
              >
                <Calendar className="w-5 h-5 mr-2 text-white" />
                Book Appointment
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          {isAdmin ? "System Management Features" : "Revolutionizing Healthcare Management"}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="card-glass text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-medical-primary to-medical-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="card-glass mb-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          {isAdmin ? "System Overview" : "Trusted by Thousands"}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-medical-accent mb-2">{stat.value}</div>
              <div className="text-slate-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-glass">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isAdmin ? (
            // Admin quick actions
            <>
              <Button 
                onClick={() => navigate('/patients')} 
                className="glass-light text-white p-6 h-auto justify-start hover:scale-105 transition-all duration-200"
              >
                <Users className="w-6 h-6 mr-3 text-medical-primary" />
                <div className="text-left">
                  <div className="font-semibold">Manage Patients</div>
                  <div className="text-sm text-slate-400">View and manage patient records</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => navigate('/doctors')} 
                className="glass-light text-white p-6 h-auto justify-start hover:scale-105 transition-all duration-200"
              >
                <UserCheck className="w-6 h-6 mr-3 text-medical-secondary" />
                <div className="text-left">
                  <div className="font-semibold">Doctor Directory</div>
                  <div className="text-sm text-slate-400">Manage doctor profiles and availability</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => navigate('/appointments')} 
                className="glass-light text-white p-6 h-auto justify-start hover:scale-105 transition-all duration-200"
              >
                <Calendar className="w-6 h-6 mr-3 text-medical-accent" />
                <div className="text-left">
                  <div className="font-semibold">Appointments</div>
                  <div className="text-sm text-slate-400">Manage all appointments</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => navigate('/availability')} 
                className="glass-light text-white p-6 h-auto justify-start hover:scale-105 transition-all duration-200"
              >
                <Clock className="w-6 h-6 mr-3 text-medical-primary" />
                <div className="text-left">
                  <div className="font-semibold">Availability</div>
                  <div className="text-sm text-slate-400">Set doctor availability</div>
                </div>
              </Button>
            </>
          ) : (
            // Patient quick actions
            <>
              <Button 
                onClick={() => navigate('/chat')} 
                className="glass-light text-white p-6 h-auto justify-start hover:scale-105 transition-all duration-200"
              >
                <MessageCircle className="w-6 h-6 mr-3 text-medical-primary" />
                <div className="text-left">
                  <div className="font-semibold">AI Chat</div>
                  <div className="text-sm text-slate-400">Get medical recommendations</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => navigate('/appointments')} 
                className="glass-light text-white p-6 h-auto justify-start hover:scale-105 transition-all duration-200"
              >
                <Calendar className="w-6 h-6 mr-3 text-medical-secondary" />
                <div className="text-left">
                  <div className="font-semibold">My Appointments</div>
                  <div className="text-sm text-slate-400">View and book appointments</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => navigate('/voice-note')} 
                className="glass-light text-white p-6 h-auto justify-start hover:scale-105 transition-all duration-200"
              >
                <Mic className="w-6 h-6 mr-3 text-medical-accent" />
                <div className="text-left">
                  <div className="font-semibold">Voice Notes</div>
                  <div className="text-sm text-slate-400">Record and transcribe symptoms</div>
                </div>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
