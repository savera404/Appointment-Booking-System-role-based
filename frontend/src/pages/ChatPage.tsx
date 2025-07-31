import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { MessageCircle, Send, Trash2, User, Clock, MapPin, Star, Phone, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  doctorRecommendations?: DoctorRecommendation[];
}

interface PatientInfo {
  id?: string; // Added for appointment booking
  name: string;
  contact: string;
  age: number;
  gender: string;
  symptoms: string;
  location: string;
  medicalHistory: string;
}

interface DoctorRecommendation {
  id: string;
  name: string;
  specialization: string;
  location: string;
  contact: string;
  experience: number;
  rating: number;
  availability: string;
  description: string;
}

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [doctorRecommendations, setDoctorRecommendations] = useState<DoctorRecommendation[]>([]);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [patientRegistered, setPatientRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRecommendation | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [showTimeSlotsDialog, setShowTimeSlotsDialog] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token, user, isAuthenticated } = useAuth();

  // Check if user is authenticated and is a patient
  useEffect(() => {
    if (!isAuthenticated) {
      addMessage({
        text: "Please log in to use the chat feature.",
        isUser: false,
        timestamp: new Date(),
      });
      return;
    }

    if (user?.role !== 'patient') {
      addMessage({
        text: "Only patients can use the chat feature. Please log in as a patient.",
        isUser: false,
        timestamp: new Date(),
      });
      return;
    }

    // Add welcome message for authenticated patients
    if (messages.length === 0) {
      addMessage({
        text: "Hello! I'm your AI medical assistant. I'm here to help you book appointments. Please tell me about your symptoms or medical condition.",
        isUser: false,
        timestamp: new Date(),
      });
    }
  }, [isAuthenticated, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const sendMessageToAPI = async (message: string) => {
    // Check authentication before making API call
    if (!isAuthenticated || !token) {
      throw new Error('You must be logged in to use the chat feature');
    }

    if (user?.role !== 'patient') {
      throw new Error('Only patients can use the chat feature');
    }

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
        isUser: msg.isUser
      }));

      console.log('Sending request with token:', token ? 'Token exists' : 'No token');
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      });

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          conversationHistory
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to get response from AI: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      // Update appointment info if available
      if (data.appointmentInfo) {
        setPatientInfo({
          id: data.appointmentInfo.id, // Patient ID from backend
          name: data.appointmentInfo.name || "Current Patient",
          contact: data.appointmentInfo.contact || "Current Patient",
          age: 0, // Not needed for appointment booking
          gender: "Not specified", // Not needed for appointment booking
          symptoms: data.appointmentInfo.condition || "",
          location: "Not specified", // Not needed for appointment booking
          medicalHistory: ""
        });
      }
      
      if (data.doctorRecommendations) setDoctorRecommendations(data.doctorRecommendations);
      
      return {
        message: data.message,
        doctorRecommendations: data.doctorRecommendations,
        hasEnoughInfo: data.hasEnoughInfo,
        isConfirming: data.isConfirming
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return { message: "I apologize, but I'm having trouble processing your request right now. Please try again later.", doctorRecommendations: null, hasEnoughInfo: false, isConfirming: false };
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = inputValue;
      setInputValue("");
      addMessage({ text: userMessage, isUser: true, timestamp: new Date() });
      setIsTyping(true);
      
      try {
        // Get AI response
        const { message, doctorRecommendations, hasEnoughInfo, isConfirming } = await sendMessageToAPI(userMessage);
        
        // Debug logging
        console.log('API Response:', { message, doctorRecommendations, hasEnoughInfo, isConfirming });
        
        // Add AI response to chat
        addMessage({
          text: message,
          isUser: false,
          timestamp: new Date(),
          doctorRecommendations: doctorRecommendations && doctorRecommendations.length > 0 ? doctorRecommendations : [],
        });
        
        // Update state with doctor recommendations if available
        if (doctorRecommendations && doctorRecommendations.length > 0) {
          setDoctorRecommendations(doctorRecommendations);
        }
        
      } catch (error) {
        console.error('Error:', error);
        addMessage({
          text: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
          isUser: false,
          timestamp: new Date(),
        });
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleRegisterPatient = async () => {
  if (!patientInfo) return;

  setIsRegistering(true);

  try {
    const response = await fetch('http://localhost:8000/api/register-patient-from-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientInfo }),
    });

    if (!response.ok) {
      throw new Error('Failed to register patient');
    }
const data = await response.json();
      setPatientRegistered(true);

      // Add success message to chat
      const successMessage = `Great! I've successfully registered you as a patient. Your information has been saved in our system.`;
      const recommendationMessage = doctorRecommendations.length > 0 
        ? `Now, let me show you some doctor recommendations based on your symptoms and location.`
        : `Let me search for doctors based on your symptoms and location.`;

       addMessage({
        text: `${successMessage} ${recommendationMessage}`,
        isUser: false,
        timestamp: new Date(),
        doctorRecommendations: doctorRecommendations.length > 0 ? doctorRecommendations : [],
      });
      
      setShowRegistrationDialog(false);
    } catch (error) {
      console.error('Error registering patient:', error);
      addMessage({
        text: "I apologize, but there was an error registering your information. Please try again.",
        isUser: false,
        timestamp: new Date(),
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGetTimeSlots = async (doctor: DoctorRecommendation) => {
    setSelectedDoctor(doctor);
    setIsTyping(true);

    try {
      const response = await fetch(`http://localhost:8000/api/doctors/${doctor.id}/availability`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch time slots');
      }

      const slots = await response.json();
      setTimeSlots(slots);
      setShowTimeSlotsDialog(true);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      addMessage({
        text: "Sorry, I couldn't fetch the available time slots. Please try again.",
        isUser: false,
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleBookAppointment = async (timeSlot: TimeSlot) => {
    if (!selectedDoctor || !patientInfo) {
      console.log("Early return: missing doctor or patient info");
      return;
    }
   
    setIsBooking(true);
    try {
      const response = await fetch('http://localhost:8000/api/book-appointment-from-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: patientInfo.id, // Use the patient ID from the backend response
          doctorId: selectedDoctor.id,
          date: timeSlot.date,
          time: timeSlot.startTime,
          condition: patientInfo.symptoms || "General consultation"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to book appointment');
      }

      const data = await response.json();
      
      // Add success message to chat
      addMessage({
        text: `Perfect! I've successfully booked your appointment with ${selectedDoctor.name} on ${timeSlot.date} at ${timeSlot.startTime}. You'll receive a confirmation shortly.`,
        isUser: false,
        timestamp: new Date(),
      });

      setShowTimeSlotsDialog(false);
      setSelectedDoctor(null);
      setTimeSlots([]);
      setPatientInfo(null);
      setDoctorRecommendations([]);
    } catch (error) {
      console.error('Error booking appointment:', error);
      addMessage({
        text: "I apologize, but there was an error booking your appointment. Please try again.",
        isUser: false,
        timestamp: new Date(),
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleClearChat = async () => {
    try {
      // Clear session on backend
      await fetch('http://localhost:8000/api/clear-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error clearing session:', error);
    }

    // Clear local state
    setMessages([]);
    setPatientInfo(null);
    setDoctorRecommendations([]);
    setPatientRegistered(false);
    setShowRegistrationDialog(false);
    setSelectedDoctor(null);
    setTimeSlots([]);
    setShowTimeSlotsDialog(false);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <SidebarTrigger className="text-white hover:bg-glass-light p-2 rounded-lg" />
        <div className="flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-medical-primary" />
          <h1 className="text-3xl font-bold text-white">AI Chat Assistant</h1>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Messages */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Chat with AI Assistant</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation with the AI assistant</p>
                    <p className="text-sm">Ask about booking appointments, symptoms, or general health questions</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.isUser
                            ? 'bg-medical-primary text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        
                        {/* Doctor Recommendations */}
                        {message.doctorRecommendations && message.doctorRecommendations.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold">Recommended Doctors:</p>
                            {message.doctorRecommendations.map((doctor) => (
                              <div
                                key={doctor.id}
                                className="bg-white rounded p-2 text-xs border"
                              >
                                <div className="font-semibold">{doctor.name}</div>
                                <div className="text-gray-600">{doctor.specialization}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{doctor.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span>{doctor.rating}/5</span>
                                </div>
                                <Button
                                  size="sm"
                                  className="mt-2 text-xs"
                                  onClick={() => handleGetTimeSlots(doctor)}
                                >
                                  Check Availability
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isTyping || !inputValue.trim()}
                    className="btn-primary"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          {patientInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{patientInfo.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{patientInfo.contact}</span>
                </div>
                <div className="text-sm">
                  <strong>Condition:</strong> {patientInfo.symptoms}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctor Recommendations */}
          {doctorRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommended Doctors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {doctorRecommendations.map((doctor) => (
                  <div key={doctor.id} className="border rounded-lg p-3">
                    <div className="font-semibold text-sm">{doctor.name}</div>
                    <div className="text-xs text-gray-600">{doctor.specialization}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs">{doctor.rating}/5</span>
                    </div>
                    <Badge className={`text-xs mt-2 ${getAvailabilityColor(doctor.availability)}`}>
                      {doctor.availability}
                    </Badge>
                    <Button
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => handleGetTimeSlots(doctor)}
                    >
                      Check Availability
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Time Slots Dialog */}
      <Dialog open={showTimeSlotsDialog} onOpenChange={setShowTimeSlotsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Available Time Slots</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedDoctor && (
              <div className="border rounded-lg p-3">
                <div className="font-semibold">{selectedDoctor.name}</div>
                <div className="text-sm text-gray-600">{selectedDoctor.specialization}</div>
              </div>
            )}
            {timeSlots.length === 0 ? (
              <p className="text-center text-gray-500">No available time slots</p>
            ) : (
              timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleBookAppointment(slot)}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{slot.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <Badge className={`mt-2 ${slot.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {slot.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeSlotsDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;