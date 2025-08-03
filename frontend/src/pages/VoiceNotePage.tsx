// import { useState, useRef, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { SidebarTrigger } from "@/components/ui/sidebar";
// import { Input } from "@/components/ui/input";
// import { Mic, Upload, Play, Pause, Trash2, Bot, Calendar, MessageCircle, Send, User, Clock, MapPin } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { useData, type VoiceNote } from "@/contexts/DataContext";

// const VoiceNotePage = () => {
//   const { voiceNotes, addVoiceNote, updateVoiceNote, deleteVoiceNote, messages, addMessage, clearMessages } = useData();
//   const [isRecording, setIsRecording] = useState(false);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [selectedNote, setSelectedNote] = useState<VoiceNote | null>(null);
//   const [playingId, setPlayingId] = useState<string | null>(null);
//   const [inputValue, setInputValue] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const symptomSuggestions = [
//     "I have a persistent headache",
//     "Chest pain and shortness of breath",
//     "Severe back pain for 2 weeks",
//     "Fever and cough for 3 days",
//     "Skin rash on arms and legs",
//     "Difficulty sleeping and anxiety"
//   ];

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const simulateAIResponse = (userMessage: string) => {
//     setIsTyping(true);
    
//     setTimeout(() => {
//       let aiResponse = "";
//       let doctorRecommendation = null;

//       const lowerMessage = userMessage.toLowerCase();
      
//       if (lowerMessage.includes("headache") || lowerMessage.includes("head")) {
//         aiResponse = "Based on your persistent headache symptoms, I recommend consulting with a neurologist. Here's a specialist in your area:";
//         doctorRecommendation = {
//           name: "Dr. Michael Chen",
//           specialty: "Neurology",
//           location: "Downtown Medical Center",
//           rating: 4.6,
//           availability: "Available tomorrow at 2:00 PM"
//         };
//       } else if (lowerMessage.includes("chest") || lowerMessage.includes("heart") || lowerMessage.includes("breath")) {
//         aiResponse = "Chest pain and breathing issues should be evaluated promptly. I recommend seeing a cardiologist:";
//         doctorRecommendation = {
//           name: "Dr. Sarah Johnson",
//           specialty: "Cardiology",
//           location: "Heart Care Institute",
//           rating: 4.8,
//           availability: "Available today at 4:00 PM"
//         };
//       } else if (lowerMessage.includes("back") || lowerMessage.includes("spine")) {
//         aiResponse = "For persistent back pain, an orthopedic specialist would be ideal:";
//         doctorRecommendation = {
//           name: "Dr. James Wilson",
//           specialty: "Orthopedics",
//           location: "Spine & Joint Clinic",
//           rating: 4.7,
//           availability: "Available this week"
//         };
//       } else if (lowerMessage.includes("fever") || lowerMessage.includes("cough") || lowerMessage.includes("cold")) {
//         aiResponse = "For fever and respiratory symptoms, I recommend starting with a general practitioner:";
//         doctorRecommendation = {
//           name: "Dr. Emily Rodriguez",
//           specialty: "General Practice",
//           location: "Community Health Center",
//           rating: 4.5,
//           availability: "Available same day"
//         };
//       } else if (lowerMessage.includes("skin") || lowerMessage.includes("rash")) {
//         aiResponse = "Skin conditions are best evaluated by a dermatologist:";
//         doctorRecommendation = {
//           name: "Dr. Lisa Park",
//           specialty: "Dermatology",
//           location: "Skin Care Specialists",
//           rating: 4.9,
//           availability: "Available next week"
//         };
//       } else if (lowerMessage.includes("anxiety") || lowerMessage.includes("sleep") || lowerMessage.includes("stress")) {
//         aiResponse = "For mental health concerns, I recommend consulting with a psychiatrist or psychologist:";
//         doctorRecommendation = {
//           name: "Dr. Robert Kim",
//           specialty: "Psychiatry",
//           location: "Mental Wellness Center",
//           rating: 4.6,
//           availability: "Available this week"
//         };
//       } else {
//         aiResponse = "I understand you're experiencing some health concerns. Could you provide more specific details about your symptoms so I can recommend the most appropriate specialist for you?";
//       }

//       addMessage({
//         text: aiResponse,
//         isUser: false,
//         timestamp: new Date(),
//         doctorRecommendation,
//       });
//       setIsTyping(false);
//     }, 1500);
//   };

//   const handleSendMessage = () => {
//     if (inputValue.trim()) {
//       addMessage({
//         text: inputValue,
//         isUser: true,
//         timestamp: new Date(),
//       });
//       simulateAIResponse(inputValue);
//       setInputValue("");
//     }
//   };

//   const handleSuggestionClick = (suggestion: string) => {
//     setInputValue(suggestion);
//   };

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const newNote: Omit<VoiceNote, 'id'> = {
//         name: file.name,
//         duration: "0:00",
//         uploadedAt: new Date(),
//         transcription: "",
//         status: "Processing"
//       };
//       addVoiceNote(newNote);
      
//       // Simulate processing
//       setTimeout(() => {
//         const noteToUpdate = voiceNotes.find(note => note.name === file.name);
//         if (noteToUpdate) {
//           updateVoiceNote(noteToUpdate.id, {
//             status: "Completed" as const,
//             transcription: "This is a sample transcription of the uploaded voice note. The AI is analyzing the content for medical symptoms and recommendations.",
//             aiAnalysis: {
//               symptoms: ["Sample symptom"],
//               urgency: "Low" as const,
//               recommendedSpecialty: "General Practice"
//             }
//           });
//         }
//       }, 3000);
//     }
//   };

//   const handleStartRecording = () => {
//     setIsRecording(true);
//     // Simulate recording
//     setTimeout(() => {
//       setIsRecording(false);
//       const newNote: Omit<VoiceNote, 'id'> = {
//         name: `Voice Recording - ${new Date().toLocaleTimeString()}`,
//         duration: "1:23",
//         uploadedAt: new Date(),
//         transcription: "",
//         status: "Processing"
//       };
//       addVoiceNote(newNote);
      
//       // Simulate processing
//       setTimeout(() => {
//         const noteToUpdate = voiceNotes.find(note => note.name.startsWith('Voice Recording'));
//         if (noteToUpdate) {
//           updateVoiceNote(noteToUpdate.id, {
//             status: "Completed" as const,
//             transcription: "I recorded this voice note to describe my current symptoms. The AI assistant has analyzed the content and provided recommendations.",
//             aiAnalysis: {
//               symptoms: ["Recorded symptom"],
//               urgency: "Low" as const,
//               recommendedSpecialty: "General Practice"
//             }
//           });
//         }
//       }, 3000);
//     }, 5000);
//   };

//   const handleDeleteNote = (id: string) => {
//     deleteVoiceNote(id);
//   };

//   const handlePlayPause = (id: string) => {
//     if (playingId === id) {
//       setPlayingId(null);
//     } else {
//       setPlayingId(id);
//       // Simulate audio ending
//       setTimeout(() => setPlayingId(null), 3000);
//     }
//   };

//   const getUrgencyColor = (urgency: string) => {
//     switch (urgency) {
//       case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
//       case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
//       case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
//       default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
//       case 'Processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
//       case 'Error': return 'bg-red-500/20 text-red-400 border-red-500/30';
//       default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
//     }
//   };

//   return (
//     <div className="h-screen flex flex-col">
//       <div className="flex items-center gap-4 p-6 border-b border-glass-border">
//         <SidebarTrigger className="text-white hover:bg-glass-light p-2 rounded-lg" />
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-gradient-to-r from-medical-primary to-medical-accent rounded-xl flex items-center justify-center">
//             <Mic className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-white">Voice Notes & AI Chat</h1>
//             <p className="text-sm text-slate-400">Upload voice notes and chat with AI assistant</p>
//           </div>
//           <Button onClick={clearMessages} size="sm" className="ml-auto btn-secondary">
//             Clear Chat
//           </Button>
//         </div>
//       </div>

//       {/* Messages Area */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-4">
//         {messages.map((message) => (
//           <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
//             <div className={`max-w-[80%] ${message.isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
//               <div className="flex items-start gap-3">
//                 {!message.isUser && (
//                   <div className="w-8 h-8 bg-gradient-to-r from-medical-primary to-medical-accent rounded-full flex items-center justify-center flex-shrink-0">
//                     <Bot className="w-4 h-4 text-white" />
//                   </div>
//                 )}
                
//                 <div className="flex-1">
//                   <p className="text-white">{message.text}</p>
                  
//                   {message.doctorRecommendation && (
//                     <div className="mt-4 p-4 bg-glass-light rounded-xl border border-glass-border">
//                       <div className="flex items-center gap-3 mb-3">
//                         <div className="w-8 h-8 bg-gradient-to-r from-medical-secondary to-purple-600 rounded-full flex items-center justify-center">
//                           <User className="w-4 h-4 text-white" />
//                         </div>
//                         <div>
//                           <h4 className="font-semibold text-white">{message.doctorRecommendation.name}</h4>
//                           <p className="text-sm text-medical-accent">{message.doctorRecommendation.specialty}</p>
//                         </div>
//                       </div>
                      
//                       <div className="space-y-2 text-sm text-slate-300">
//                         <div className="flex items-center gap-2">
//                           <MapPin className="w-4 h-4" />
//                           <span>{message.doctorRecommendation.location}</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Clock className="w-4 h-4" />
//                           <span>{message.doctorRecommendation.availability}</span>
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <span className="text-yellow-400">★ {message.doctorRecommendation.rating}/5</span>
//                           <Button size="sm" className="btn-primary">
//                             <Calendar className="w-3 h-3 mr-1" />
//                             Book Appointment
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
                  
//                   <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
//                     {message.isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
//                     <span>{message.timestamp.toLocaleTimeString()}</span>
//                   </div>
//                 </div>
                
//                 {message.isUser && (
//                   <div className="w-8 h-8 bg-gradient-to-r from-medical-secondary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
//                     <User className="w-4 h-4 text-white" />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
        
//         {isTyping && (
//           <div className="flex justify-start">
//             <div className="chat-bubble-ai max-w-[80%]">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 bg-gradient-to-r from-medical-primary to-medical-accent rounded-full flex items-center justify-center">
//                   <Bot className="w-4 h-4 text-white" />
//                 </div>
//                 <div className="flex space-x-1">
//                   <div className="w-2 h-2 bg-medical-accent rounded-full animate-bounce"></div>
//                   <div className="w-2 h-2 bg-medical-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                   <div className="w-2 h-2 bg-medical-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
        
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Symptom Suggestions */}
//       <div className="p-4 border-t border-glass-border">
//         <div className="flex gap-2 flex-wrap mb-4">
//           {symptomSuggestions.map((suggestion, index) => (
//             <Badge
//               key={index}
//               variant="outline"
//               className="cursor-pointer glass-light border-glass-border hover:bg-medical-primary/20 hover:border-medical-primary/50 text-slate-300 hover:text-white transition-all"
//               onClick={() => handleSuggestionClick(suggestion)}
//             >
//               {suggestion}
//             </Badge>
//           ))}
//         </div>
//       </div>

//       {/* Voice Upload Section - Collapsible */}
//       <div className="p-4 border-t border-glass-border">
//         <details className="group">
//           <summary className="cursor-pointer list-none">
//             <div className="flex items-center gap-3 p-4 glass-light rounded-xl hover:bg-glass-light/50 transition-colors">
//               <Upload className="w-5 h-5 text-medical-primary" />
//               <h3 className="text-lg font-medium text-white">Voice Note Upload</h3>
//               <div className="ml-auto transform transition-transform group-open:rotate-180">
//                 <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </div>
//             </div>
//           </summary>
          
//           <div className="mt-4 p-4 glass-light rounded-xl">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 p-6 border-2 border-dashed border-glass-border hover:border-medical-primary/50 transition-colors rounded-xl text-center">
//                 <Upload className="w-8 h-8 mx-auto mb-3 text-medical-primary" />
//                 <h4 className="text-white mb-2">Upload Voice File</h4>
//                 <p className="text-slate-400 text-sm mb-3">MP3, WAV, M4A files</p>
//                 <input
//                   type="file"
//                   accept="audio/*"
//                   onChange={handleFileUpload}
//                   className="hidden"
//                   id="file-upload"
//                 />
//                 <label htmlFor="file-upload">
//                   <Button className="btn-primary cursor-pointer" size="sm">
//                     <Upload className="w-4 h-4 mr-2" />
//                     Choose File
//                   </Button>
//                 </label>
//               </div>
              
//               <div className="flex-1 p-6 rounded-xl text-center">
//                 <Mic className={`w-8 h-8 mx-auto mb-3 ${isRecording ? 'text-red-400 animate-pulse' : 'text-medical-accent'}`} />
//                 <h4 className="text-white mb-2">Record Voice Note</h4>
//                 <p className="text-slate-400 text-sm mb-3">
//                   {isRecording ? 'Recording...' : 'Start recording'}
//                 </p>
//                 <Button
//                   onClick={handleStartRecording}
//                   disabled={isRecording}
//                   className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'btn-secondary'}
//                   size="sm"
//                 >
//                   <Mic className="w-4 h-4 mr-2" />
//                   {isRecording ? 'Stop' : 'Record'}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </details>
//       </div>

//       {/* Input Area */}
//       <div className="p-6 border-t border-glass-border">
//         <div className="flex gap-4">
//           <Input
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Ask about your voice notes or describe symptoms..."
//             className="flex-1 bg-glass border-glass-border text-white placeholder:text-slate-400"
//           />
//           <Button onClick={handleSendMessage} className="btn-primary px-6" disabled={!inputValue.trim()}>
//             <Send className="w-4 h-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Voice Notes Dialog */}
//       <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
//         <DialogContent className="modal-glass max-w-4xl h-[80vh]">
//           <DialogHeader>
//             <DialogTitle className="text-white flex items-center gap-2">
//               <Mic className="w-5 h-5 text-medical-primary" />
//               Your Voice Notes
//             </DialogTitle>
//           </DialogHeader>
          
//           <div className="flex-1 overflow-y-auto space-y-4">
//             {voiceNotes.length === 0 ? (
//               <div className="text-center py-12">
//                 <Mic className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
//                 <p className="text-slate-400">No voice notes yet. Upload or record your first voice note above.</p>
//               </div>
//             ) : (
//               voiceNotes.map((note) => (
//                 <div key={note.id} className="p-4 glass-light rounded-lg">
//                   <div className="flex items-center gap-3 mb-3">
//                     <div className="w-8 h-8 bg-gradient-to-r from-medical-accent to-medical-primary rounded-full flex items-center justify-center">
//                       <Mic className="w-4 h-4 text-white" />
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="font-semibold text-white">{note.name}</h4>
//                       <div className="flex items-center gap-4 text-sm text-slate-400">
//                         <span>Duration: {note.duration}</span>
//                         <span>Uploaded: {note.uploadedAt.toLocaleDateString()}</span>
//                       </div>
//                     </div>
//                     <Badge className={`${getStatusColor(note.status)} border`}>
//                       {note.status}
//                     </Badge>
//                   </div>
                  
//                   <div className="flex gap-2 mb-3">
//                     <Button
//                       size="sm"
//                       onClick={() => handlePlayPause(note.id)}
//                       className="bg-glass-light hover:bg-medical-primary/20 text-white"
//                     >
//                       {playingId === note.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
//                     </Button>
//                     <Button
//                       size="sm"
//                       onClick={() => handleDeleteNote(note.id)}
//                       className="bg-glass-light hover:bg-red-500/20 text-slate-400 hover:text-red-400"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </Button>
//                   </div>
                  
//                   {note.transcription && (
//                     <div className="p-3 bg-glass rounded-lg mb-3">
//                       <h5 className="font-medium text-white mb-2">Transcription</h5>
//                       <p className="text-slate-300 text-sm">{note.transcription}</p>
//                     </div>
//                   )}
                  
//                   {note.aiAnalysis && (
//                     <div className="p-3 bg-glass rounded-lg">
//                       <div className="flex items-center gap-2 mb-2">
//                         <Bot className="w-4 h-4 text-medical-primary" />
//                         <h5 className="font-medium text-white">AI Analysis</h5>
//                       </div>
//                       <div className="space-y-2 text-sm">
//                         <div>
//                           <span className="text-slate-400">Urgency:</span>
//                           <Badge className={`ml-2 ${getUrgencyColor(note.aiAnalysis.urgency)} border text-xs`}>
//                             {note.aiAnalysis.urgency}
//                           </Badge>
//                         </div>
//                         <div>
//                           <span className="text-slate-400">Recommended:</span>
//                           <span className="text-medical-accent font-medium ml-2">{note.aiAnalysis.recommendedSpecialty}</span>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default VoiceNotePage;

// import { useState, useRef, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Mic, Upload, Play, Pause, Trash2, Bot, Send, User, FileAudio, Brain, Stethoscope, Loader2 } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

// // Voice Note interface
// interface VoiceNote {
//   id: string;
//   name: string;
//   duration: string;
//   uploadedAt: Date;
//   transcription: string;
//   status: 'Processing' | 'Completed' | 'Error';
//   audioBlob?: Blob;
// }

// // Message interface
// interface Message {
//   id: string;
//   text: string;
//   isUser: boolean;
//   timestamp: Date;
//   relatedVoiceNote?: string;
// }

// const VoiceNotePage = () => {
//   const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isRecording, setIsRecording] = useState(false);
//   const [playingId, setPlayingId] = useState<string | null>(null);
//   const [inputValue, setInputValue] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const quickQuestions = [
//     "Summarize my voice messages",
//     "What are the key points?",
//     "What symptoms were mentioned?",
//     "What should I do next?",
//     "Give me the main takeaways",
//     "Are there any important details?"
//   ];

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Transcribe audio using the API endpoint
//   const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
//     try {
//       const formData = new FormData();
//       formData.append('audio', audioBlob);
      
//       const response = await fetch('/api/transcribe', {
//         method: 'POST',
//         body: formData
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to transcribe audio');
//       }
      
//       const data = await response.json();
//       return data.transcription;
//     } catch (error) {
//       console.error('Transcription error:', error);
//       return "Error transcribing audio. Please try again.";
//     }
//   };

//   // Chat with OpenAI
//   const chatWithAI = async (userMessage: string, voiceNotesContext: string): Promise<string> => {
//     try {
//       const response = await fetch('/api/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           message: userMessage,
//           context: voiceNotesContext,
//           voiceNotes: voiceNotes.filter(note => note.status === 'Completed')
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to get AI response');
//       }

//       const data = await response.json();
//       return data.response;
//     } catch (error) {
//       console.error('Error calling AI service:', error);
//       return "I'm having trouble processing your request right now. Please try again later.";
//     }
//   };

//   // Handle sending message
//   const handleSendMessage = async () => {
//     if (!inputValue.trim()) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       text: inputValue,
//       isUser: true,
//       timestamp: new Date(),
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInputValue("");
//     setIsTyping(true);

//     // Prepare context from voice notes
//     const voiceNotesContext = voiceNotes
//       .filter(note => note.status === 'Completed')
//       .map(note => `Voice Note: ${note.name}\nTranscription: ${note.transcription}`)
//       .join('\n\n');

//     try {
//       const aiResponse = await chatWithAI(inputValue, voiceNotesContext);
      
//       const aiMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         text: aiResponse,
//         isUser: false,
//         timestamp: new Date(),
//       };

//       setMessages(prev => [...prev, aiMessage]);
//     } catch (error) {
//       const errorMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         text: "Sorry, I encountered an error. Please try again.",
//         isUser: false,
//         timestamp: new Date(),
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   // Handle file upload
//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const newNote: VoiceNote = {
//       id: Date.now().toString(),
//       name: file.name,
//       duration: "Processing...",
//       uploadedAt: new Date(),
//       transcription: "",
//       status: "Processing",
//       audioBlob: file
//     };

//     setVoiceNotes(prev => [...prev, newNote]);

//     try {
//       // Transcribe the audio
//       const transcription = await transcribeAudio(file);
      
//       // Get audio duration
//       const audio = new Audio(URL.createObjectURL(file));
//       audio.onloadedmetadata = () => {
//         const duration = Math.floor(audio.duration);
//         const minutes = Math.floor(duration / 60);
//         const seconds = duration % 60;
//         const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
//         setVoiceNotes(prev => prev.map(note =>
//           note.id === newNote.id
//             ? { ...note, status: "Completed" as const, transcription, duration: durationStr }
//             : note
//         ));
//       };
//     } catch (error) {
//       console.error('Error processing audio:', error);
//       setVoiceNotes(prev => prev.map(note =>
//         note.id === newNote.id
//           ? { ...note, status: "Error" as const }
//           : note
//       ));
//     }
//   };

//   // Handle recording
//   const handleStartRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);
//       const chunks: Blob[] = [];

//       recorder.ondataavailable = (event) => {
//         chunks.push(event.data);
//       };

//       recorder.onstop = async () => {
//         const audioBlob = new Blob(chunks, { type: 'audio/wav' });
//         const newNote: VoiceNote = {
//           id: Date.now().toString(),
//           name: `Recording - ${new Date().toLocaleTimeString()}`,
//           duration: "Processing...",
//           uploadedAt: new Date(),
//           transcription: "",
//           status: "Processing",
//           audioBlob
//         };

//         setVoiceNotes(prev => [...prev, newNote]);

//         try {
//           const transcription = await transcribeAudio(audioBlob);
//           setVoiceNotes(prev => prev.map(note =>
//             note.id === newNote.id
//               ? { ...note, status: "Completed" as const, transcription, duration: "0:30" }
//               : note
//           ));
//         } catch (error) {
//           setVoiceNotes(prev => prev.map(note =>
//             note.id === newNote.id
//               ? { ...note, status: "Error" as const }
//               : note
//           ));
//         }
//       };

//       recorder.start();
//       setMediaRecorder(recorder);
//       setIsRecording(true);

//       // Auto-stop after 30 seconds
//       setTimeout(() => {
//         if (recorder.state === 'recording') {
//           recorder.stop();
//           stream.getTracks().forEach(track => track.stop());
//           setIsRecording(false);
//           setMediaRecorder(null);
//         }
//       }, 30000);

//     } catch (error) {
//       console.error('Error accessing microphone:', error);
//       alert('Could not access microphone. Please check permissions.');
//     }
//   };

//   const handleStopRecording = () => {
//     if (mediaRecorder && mediaRecorder.state === 'recording') {
//       mediaRecorder.stop();
//       setIsRecording(false);
//       setMediaRecorder(null);
//     }
//   };

//   const handleDeleteNote = (id: string) => {
//     setVoiceNotes(prev => prev.filter(note => note.id !== id));
//   };

//   const handlePlayPause = (id: string) => {
//     const note = voiceNotes.find(n => n.id === id);
//     if (!note?.audioBlob) return;

//     if (playingId === id) {
//       setPlayingId(null);
//     } else {
//       const audio = new Audio(URL.createObjectURL(note.audioBlob));
//       audio.play();
//       setPlayingId(id);
      
//       audio.onended = () => setPlayingId(null);
//       audio.onerror = () => setPlayingId(null);
//     }
//   };

//   const clearMessages = () => {
//     setMessages([]);
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
//       case 'Processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
//       case 'Error': return 'bg-red-500/20 text-red-400 border-red-500/30';
//       default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
//     }
//   };

//   return (
//     <div className="h-screen flex flex-col bg-slate-900">
//       {/* Header */}
//       <div className="flex items-center gap-4 p-6 border-b border-slate-700">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
//             <Brain className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-white">Voice Message Assistant</h1>
//             <p className="text-sm text-slate-400">Upload voice messages and chat with AI about them</p>
//           </div>
//           <Button onClick={clearMessages} size="sm" className="ml-auto bg-slate-700 hover:bg-slate-600">
//             Clear Chat
//           </Button>
//         </div>
//       </div>

//       {/* Voice Notes Summary */}
//       {voiceNotes.length > 0 && (
//         <div className="p-4 bg-slate-800 border-b border-slate-700">
//           <div className="flex items-center gap-4 text-sm">
//             <div className="flex items-center gap-2">
//               <FileAudio className="w-4 h-4 text-blue-400" />
//               <span className="text-slate-300">{voiceNotes.length} voice message(s)</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-slate-300">
//                 {voiceNotes.filter(n => n.status === 'Completed').length} processed
//               </span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Messages Area */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-4">
//         {messages.length === 0 && (
//           <div className="text-center py-12">
//             <Brain className="w-16 h-16 mx-auto mb-4 text-slate-600" />
//             <h3 className="text-xl font-semibold text-white mb-2">AI Voice Assistant</h3>
//             <p className="text-slate-400 mb-4">Upload voice messages and ask me anything about them</p>
//             <p className="text-slate-500 text-sm">I can summarize, analyze, and answer questions about your voice recordings</p>
//           </div>
//         )}

//         {messages.map((message) => (
//           <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
//             <div className={`max-w-[80%] p-4 rounded-2xl ${
//               message.isUser
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-slate-800 text-slate-100 border border-slate-700'
//             }`}>
//               <div className="flex items-start gap-3">
//                 {!message.isUser && (
//                   <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
//                     <Brain className="w-4 h-4 text-white" />
//                   </div>
//                 )}
                
//                 <div className="flex-1">
//                   <div className="whitespace-pre-wrap">{message.text}</div>
                  
//                   <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
//                     {message.isUser ? <User className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
//                     <span>{message.timestamp.toLocaleTimeString()}</span>
//                   </div>
//                 </div>
                
//                 {message.isUser && (
//                   <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
//                     <User className="w-4 h-4 text-white" />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}

//         {isTyping && (
//           <div className="flex justify-start">
//             <div className="bg-slate-800 text-slate-100 border border-slate-700 p-4 rounded-2xl max-w-[80%]">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//                   <Brain className="w-4 h-4 text-white" />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
//                   <span className="text-slate-300">AI is thinking...</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Quick Questions */}
//       {voiceNotes.some(note => note.status === 'Completed') && (
//         <div className="p-4 border-t border-slate-700">
//           <div className="flex gap-2 flex-wrap">
//             {quickQuestions.map((question, index) => (
//               <Badge
//                 key={index}
//                 variant="outline"
//                 className="cursor-pointer bg-slate-800 border-slate-600 hover:bg-blue-600/20 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all"
//                 onClick={() => setInputValue(question)}
//               >
//                 {question}
//               </Badge>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Voice Upload Section */}
//       <div className="p-4 border-t border-slate-700">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="p-4 border-2 border-dashed border-slate-600 hover:border-blue-500/50 transition-colors rounded-xl text-center">
//             <Upload className="w-8 h-8 mx-auto mb-3 text-blue-400" />
//             <h4 className="text-white mb-2">Upload Voice Message</h4>
//             <p className="text-slate-400 text-sm mb-3">MP3, WAV, M4A files</p>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="audio/*"
//               onChange={handleFileUpload}
//               className="hidden"
//             />
//             <Button
//               onClick={() => fileInputRef.current?.click()}
//               className="bg-blue-600 hover:bg-blue-700 text-white"
//               size="sm"
//             >
//               <Upload className="w-4 h-4 mr-2" />
//               Choose File
//             </Button>
//           </div>
          
//           <div className="p-4 rounded-xl text-center bg-slate-800">
//             <Mic className={`w-8 h-8 mx-auto mb-3 ${isRecording ? 'text-red-400 animate-pulse' : 'text-purple-400'}`} />
//             <h4 className="text-white mb-2">Record Voice Message</h4>
//             <p className="text-slate-400 text-sm mb-3">
//               {isRecording ? 'Recording... (max 30s)' : 'Record a voice message'}
//             </p>
//             <Button
//               onClick={isRecording ? handleStopRecording : handleStartRecording}
//               className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'}
//               size="sm"
//             >
//               <Mic className="w-4 h-4 mr-2" />
//               {isRecording ? 'Stop Recording' : 'Start Recording'}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Voice Notes List */}
//       {voiceNotes.length > 0 && (
//         <div className="p-4 border-t border-slate-700 max-h-48 overflow-y-auto">
//           <h3 className="text-white font-semibold mb-3">Voice Messages</h3>
//           <div className="space-y-2">
//             {voiceNotes.map((note) => (
//               <div key={note.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
//                 <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
//                   <FileAudio className="w-3 h-3 text-white" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm text-white truncate">{note.name}</span>
//                     <Badge className={`text-xs ${getStatusColor(note.status)}`}>
//                       {note.status}
//                     </Badge>
//                   </div>
//                   <div className="text-xs text-slate-400">
//                     {note.uploadedAt.toLocaleTimeString()} • {note.duration}
//                   </div>
//                 </div>
//                 <div className="flex gap-1">
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     onClick={() => handlePlayPause(note.id)}
//                     className="h-8 w-8 p-0 text-slate-400 hover:text-white"
//                     disabled={note.status !== 'Completed'}
//                   >
//                     {playingId === note.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     onClick={() => handleDeleteNote(note.id)}
//                     className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Input Area */}
//       <div className="p-4 border-t border-slate-700">
//         <div className="flex gap-3">
//           <Input
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
//             placeholder="Ask me anything about your voice messages..."
//             className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
//             disabled={isTyping}
//           />
//           <Button
//             onClick={handleSendMessage}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6"
//             disabled={!inputValue.trim() || isTyping}
//           >
//             <Send className="w-4 h-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VoiceNotePage;


// import { useState, useRef, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Brain, Loader2, Send, User } from "lucide-react";

// interface Message {
//   id: string;
//   text: string;
//   isUser: boolean;
//   timestamp: Date;
// }

// const VoiceNotePage = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputValue, setInputValue] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const quickQuestions = [
//     "Summarize my voice messages",
//     "What are the key points?",
//     "What symptoms were mentioned?",
//     "What should I do next?",
//     "Give me the main takeaways",
//     "Are there any important details?"
//   ];

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const chatWithAI = async (userMessage: string): Promise<string> => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: userMessage })
//       });

//       if (!response.ok) {
//         throw new Error("Failed to get AI response");
//       }

//       const data = await response.json();
//       return data.response;
//     } catch (error) {
//       console.error("Error calling chat API:", error);
//       return "Sorry, I couldn't process that. Please try again.";
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!inputValue.trim()) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       text: inputValue,
//       isUser: true,
//       timestamp: new Date()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInputValue("");
//     setIsTyping(true);

//     try {
//       const aiReply = await chatWithAI(inputValue);
//       const aiMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         text: aiReply,
//         isUser: false,
//         timestamp: new Date()
//       };
//       setMessages(prev => [...prev, aiMessage]);
//     } catch {
//       const errorMsg: Message = {
//         id: (Date.now() + 1).toString(),
//         text: "Sorry, something went wrong.",
//         isUser: false,
//         timestamp: new Date()
//       };
//       setMessages(prev => [...prev, errorMsg]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   const clearMessages = () => setMessages([]);

//   return (
//     <div className="h-screen flex flex-col bg-slate-900">
//       {/* Header */}
//       <div className="flex items-center justify-between p-6 border-b border-slate-700">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
//             <Brain className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-white">RAG Voice Assistant</h1>
//             <p className="text-sm text-slate-400">Ask questions based on your processed voice notes</p>
//           </div>
//         </div>
//         <Button onClick={clearMessages} size="sm" className="bg-slate-700 hover:bg-slate-600">
//           Clear Chat
//         </Button>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-4">
//         {messages.length === 0 && (
//           <div className="text-center py-12">
//             <Brain className="w-16 h-16 mx-auto mb-4 text-slate-600" />
//             <h3 className="text-xl font-semibold text-white mb-2">AI Assistant</h3>
//             <p className="text-slate-400 mb-4">Start asking questions about your data</p>
//           </div>
//         )}

//         {messages.map((msg) => (
//           <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
//             <div
//               className={`max-w-[80%] p-4 rounded-2xl ${
//                 msg.isUser ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-100 border border-slate-700"
//               }`}
//             >
//               <div className="flex items-start gap-3">
//                 {!msg.isUser && (
//                   <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//                     <Brain className="w-4 h-4 text-white" />
//                   </div>
//                 )}
//                 <div className="flex-1">
//                   <div className="whitespace-pre-wrap">{msg.text}</div>
//                   <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
//                     {msg.isUser ? <User className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
//                     <span>{msg.timestamp.toLocaleTimeString()}</span>
//                   </div>
//                 </div>
//                 {msg.isUser && (
//                   <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
//                     <User className="w-4 h-4 text-white" />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}

//         {isTyping && (
//           <div className="flex justify-start">
//             <div className="bg-slate-800 text-slate-100 border border-slate-700 p-4 rounded-2xl max-w-[80%]">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//                   <Brain className="w-4 h-4 text-white" />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
//                   <span className="text-slate-300">AI is thinking...</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Quick Questions */}
//       <div className="p-4 border-t border-slate-700">
//         <div className="flex gap-2 flex-wrap">
//           {quickQuestions.map((question, index) => (
//             <Badge
//               key={index}
//               variant="outline"
//               className="cursor-pointer bg-slate-800 border-slate-600 hover:bg-blue-600/20 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all"
//               onClick={() => setInputValue(question)}
//             >
//               {question}
//             </Badge>
//           ))}
//         </div>
//       </div>

//       {/* Input Area */}
//       <div className="p-4 border-t border-slate-700">
//         <div className="flex gap-3">
//           <Input
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
//             placeholder="Ask me anything..."
//             className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
//             disabled={isTyping}
//           />
//           <Button
//             onClick={handleSendMessage}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6"
//             disabled={!inputValue.trim() || isTyping}
//           >
//             <Send className="w-4 h-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VoiceNotePage;
import { useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Send, User } from "lucide-react";


interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const VoiceNotePage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { id: appointmentId } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  

  const quickQuestions = [
    "Summarize my voice messages",
    "What are the key points?",
    "What symptoms were mentioned?",
    "What should I do next?",
    "Give me the main takeaways",
    "Are there any important details?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch summary when appointmentId is set
  useEffect(() => {
    if (appointmentId) {
      fetchSummary();
    }
  }, [appointmentId]);
  const chatWithAI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch("http://127.0.0.1:8000/chatV", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, appointment_id: appointmentId })
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error calling chat API:", error);
      return "Sorry, I couldn't process that. Please try again.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const aiReply = await chatWithAI(inputValue);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiReply,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, something went wrong.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

const fetchSummary = async () => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/appointments/${appointmentId}/summary`);
    if (!res.ok) {
      throw new Error("Failed to fetch summary");
    }
    const data = await res.json();
    const summaryText = data.summary || '';

    setKeyPoints(summaryText);

    const summaryMessage: Message = {
      id: Date.now().toString(),
      text: summaryText,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, summaryMessage]);
  } catch (error) {
    console.error("Summary fetch error:", error);
  }
};

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !appointmentId) return;

    const formData = new FormData();
    formData.append("audio_file", file);

    try {
      const response = await fetch(`http://127.0.0.1:8000/appointments/${appointmentId}/upload-audio`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      alert("Audio uploaded and transcribed successfully!");
      console.log("Transcript:", data.transcript);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload audio. Check console for details.");
    }
  };

  const clearMessages = () => setMessages([]);

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">RAG Voice Assistant</h1>
            <p className="text-sm text-slate-400">Ask questions based on your processed voice notes</p>
          </div>
        </div>
        <Button onClick={clearMessages} size="sm" className="bg-slate-700 hover:bg-slate-600">
          Clear Chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">AI Assistant</h3>
            <p className="text-slate-400 mb-4">Start asking questions about your data</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.isUser ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-100 border border-slate-700"
              }`}
            >
              <div className="flex items-start gap-3">
                {!msg.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                    {msg.isUser ? <User className="w-3 h-3 text-slate-400" /> : <Brain className="w-3 h-3 text-slate-400" />}
                    <span>{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
                {msg.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-100 border border-slate-700 p-4 rounded-2xl max-w-[80%]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-slate-300">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2 flex-wrap">
          {quickQuestions.map((question, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer bg-slate-800 border-slate-600 hover:bg-blue-600/20 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all"
              onClick={() => setInputValue(question)}
            >
              {question}
            </Badge>
          ))}
        </div>
      </div>

      {/* Input + Upload Area */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>

        {/* Audio Upload */}
{/* <div className="flex gap-2 items-center">
  <Input
    placeholder="Enter Appointment ID"
    value={appointmentId}
    onChange={(e) => setAppointmentId(e.target.value)}
    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
  />
  <input
    type="file"
    accept="audio/*"
    ref={fileInputRef}
    className="hidden"
    onChange={handleAudioUpload}
  />
  <Button
    onClick={() => fileInputRef.current?.click()}
    className="bg-purple-600 hover:bg-purple-700 text-white"
    disabled={!appointmentId}
  >
    Upload Audio
  </Button>
</div> */}
        </div>
      </div>
    </div>
  );
};

export default VoiceNotePage;
