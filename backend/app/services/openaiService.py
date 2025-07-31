import logging
from typing import List, Dict
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")
deployment_name = os.getenv("AZURE_OPENAI_MODEL")


class OpenAIService:
    def __init__(self):
        logging.debug("[OpenAIService] Initializing OpenAI Azure client...")
        self.client = OpenAI(
            api_key=AZURE_API_KEY,
            base_url=AZURE_ENDPOINT,
            default_query={"api-version": "preview"},
        )
        self.deployment_name = "gpt-4o"
        logging.debug(
            f"[OpenAIService] Client initialized with endpoint {AZURE_ENDPOINT} and deployment '{self.deployment_name}'")

    def get_system_prompt(self) -> str:
        return """You are a friendly and professional medical assistant chatbot for a healthcare platform. Your role is to:

1. **Engage in natural conversation** while gradually collecting patient information:
   - Patient's full name (first and last name)
   - Contact information (phone number or email address)
   - Age (numeric value)
   - Gender (Male/Female/Other)
   - Current symptoms and medical concerns
   - Location/city where they live
   - Any relevant medical history

2. **Conversation Guidelines:**
   - Be warm, empathetic, and professional
   - Ask one question at a time to avoid overwhelming the patient
   - If a patient provides multiple pieces of information, acknowledge each one warmly
   - If information is missing or unclear, politely ask for clarification
   - Use natural language - don't sound like a form or questionnaire
   - Show understanding and empathy for their medical concerns
   - Be conversational and friendly, not robotic

3. **Information Collection Strategy:**
   - Start by asking their name and how you can help them
   - Then ask about their symptoms or medical concerns
   - Ask for their location/city
   - Ask for their age and gender
   - Finally, ask for their contact information (phone or email)
   - If they provide information out of order, acknowledge it warmly and continue with what's missing
   - Don't rush - let the conversation flow naturally

4. **When you have collected the required information, provide a summary:**
   "Thank you for providing your information. Let me summarize what I have:
   - Name: [name]
   - Contact: [contact]
   - Age: [age]
   - Gender: [gender]
   - Symptoms: [symptoms]
   - Location: [location]
   
   Based on your symptoms and location, I can recommend some doctors for you. Would you like me to proceed with doctor recommendations?"

5. **When the patient confirms (says "yes", "sure", "okay", "please", "go ahead", etc.), respond:**
   "Great! I'll search for doctors based on your symptoms and location. Let me find the best matches for you..."

6. **Important Rules:**
   - Always maintain patient privacy and confidentiality
   - If a patient seems to be in immediate danger, advise them to call emergency services
   - Be supportive and reassuring
   - Don't make medical diagnoses - only collect information and provide doctor recommendations
   - If someone asks to start over or clear the conversation, be understanding and start fresh
   - Be patient and understanding if someone provides information slowly or in fragments

Current conversation context: You are starting a new conversation with a patient.
        """

    def extract_patient_info_with_llm(self, conversation_history: List[Dict]) -> Dict:
        user_messages = "\n".join(
            msg["content"] for msg in conversation_history if msg.get("role") == "user" or msg.get("isUser")
        )

        extraction_prompt = f"""You are a data extraction specialist. Extract patient information from the following conversation messages.

    Conversation:
    {user_messages}

    Extract the following information and return ONLY a valid JSON object:
    {{
      "name": "full name or empty string",
      "contact": "phone number or email or empty string", 
      "age": "numeric age or empty string",
      "gender": "Male/Female/Other or empty string",
      "location": "city name or empty string",
      "symptoms": "detailed symptoms description or empty string",
      "medicalHistory": "any mentioned medical history or empty string"
    }}

    Rules:
    - Return ONLY the JSON object, no other text
    - If information is not found, use empty string
    - For age, return only the number as a string
    - For gender, use "Male", "Female", or "Other"
    - For contact, return phone number or email
    - For symptoms, provide detailed description of what the patient is experiencing
    """

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {"role": "system", "content": extraction_prompt},
                    {"role": "user", "content": user_messages}
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            extracted_text = response.choices[0].message.content.strip()
            
            # Try to parse JSON
            import json
            try:
                extracted_data = json.loads(extracted_text)
                return extracted_data
            except json.JSONDecodeError:
                # Fallback: return empty structure
                return {
                    "name": "",
                    "contact": "",
                    "age": "",
                    "gender": "",
                    "location": "",
                    "symptoms": "",
                    "medicalHistory": ""
                }
                
        except Exception as e:
            logging.error(f"Error extracting patient info: {e}")
            return {
                "name": "",
                "contact": "",
                "age": "",
                "gender": "",
                "location": "",
                "symptoms": "",
                "medicalHistory": ""
            }

    def extract_appointment_info_with_llm(self, conversation_history: List[Dict]) -> Dict:
        """Extract appointment information from conversation for existing patients"""
        user_messages = "\n".join(
            msg["content"] for msg in conversation_history if msg.get("role") == "user" or msg.get("isUser")
        )

        extraction_prompt = f"""You are a data extraction specialist. Extract appointment booking information from the following conversation messages.

    Conversation:
    {user_messages}

    Extract the following information and return ONLY a valid JSON object:
    {{
      "condition": "detailed description of symptoms or medical condition",
      "date": "preferred appointment date in YYYY-MM-DD format or empty string",
      "time": "preferred appointment time in HH:MM format or empty string",
      "urgency": "urgent/regular/checkup or empty string"
    }}

    Rules:
    - Return ONLY the JSON object, no other text
    - If information is not found, use empty string
    - For date, use YYYY-MM-DD format
    - For time, use 24-hour format (HH:MM)
    - For condition, provide detailed description of symptoms
    - For urgency, use "urgent", "regular", or "checkup"
    """

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {"role": "system", "content": extraction_prompt},
                    {"role": "user", "content": user_messages}
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            extracted_text = response.choices[0].message.content.strip()
            
            # Try to parse JSON
            import json
            try:
                extracted_data = json.loads(extracted_text)
                return extracted_data
            except json.JSONDecodeError:
                # Fallback: return empty structure
                return {
                    "condition": "",
                    "date": "",
                    "time": "",
                    "urgency": ""
                }
                
        except Exception as e:
            logging.error(f"Error extracting appointment info: {e}")
            return {
                "condition": "",
                "date": "",
                "time": "",
                "urgency": ""
            }

    def get_appointment_system_prompt(self) -> str:
        """System prompt for appointment-focused chat"""
        return """You are a friendly and professional medical assistant chatbot for a healthcare platform. Your role is to help existing patients book appointments.

1. **Engage in natural conversation** while collecting appointment information:
   - Patient's symptoms or medical condition (MOST IMPORTANT - get this first)
   - Only ask for date/time preferences AFTER finding suitable doctors

2. **Conversation Flow:**
   - Start by asking about their symptoms or medical concerns
   - Once you have a clear understanding of their condition, offer to find suitable doctors
   - Don't ask for date/time preferences until after showing doctor recommendations
   - Let the patient choose their preferred doctor first

3. **Information Collection Strategy:**
   - First: Ask about their symptoms or medical concerns
   - Second: Summarize their condition and offer to find doctors
   - Third: After showing doctors, ask for their preferred date/time
   - Use natural language - don't sound like a form
   - Be conversational and friendly, not robotic

4. **When you have collected the condition, provide a summary:**
   "Thank you for telling me about your condition. Let me summarize what I have:
   - Condition: [condition]
   
   Based on your symptoms, I can recommend some doctors for you. Would you like me to proceed with doctor recommendations?"

5. **When the patient confirms (says "yes", "sure", "okay", "please", "go ahead", etc.), respond:**
   "Great! I'll search for doctors based on your condition. Let me find the best matches for you..."

6. **Important Rules:**
   - Always maintain patient privacy and confidentiality
   - If a patient seems to be in immediate danger, advise them to call emergency services
   - Be supportive and reassuring
   - Don't make medical diagnoses - only collect information and provide doctor recommendations
   - Focus on getting the condition first, then find doctors
   - Don't ask for date/time until after showing doctor options
   - If someone asks to start over or clear the conversation, be understanding and start fresh
   - Be patient and understanding if someone provides information slowly or in fragments

Current conversation context: You are starting a new conversation with an existing patient who wants to book an appointment.
        """

    def generate_doctor_search_query_for_appointment(self, appointment_info: Dict) -> str:
        """Generate search query for doctors based on appointment information"""
        condition = appointment_info.get("condition", "").lower()
        urgency = appointment_info.get("urgency", "")
        
        # Map common symptoms to specialties
        symptom_to_specialty = {
            "fever": "general physician",
            "sore throat": "general physician",
            "headache": "neurology",
            "heart": "cardiologist",
            "chest": "cardiologist",
            "chest pain": "cardiologist",
            "skin": "dermatologist",
            "rash": "dermatologist",
            "anxiety": "psychiatrist",
            "depression": "psychiatrist",
            "stomach": "gastroenterologist",
            "nausea": "gastroenterologist",
            "bone": "orthopedist",
            "joint": "orthopedist",
            "eye": "ophthalmologist",
            "vision": "ophthalmologist",
            "ear": "general physician",
            "throat": "general physician",
            "nose": "general physician",
            "bleeding": "emergency",
            "heart attack": "cardiologist",
            "stroke": "neurology",
            "seizure": "neurology",
            "shortness of breath": "pulmunology",
            "breathing": "pulmunology",
            "breath": "pulmunology",
            "cough": "pulmunology",
            "cold": "general physician",
            "flu": "general physician",
            "infection": "general physician",
            "child": "paediatrics",
            "baby": "paediatrics",
            "infant": "paediatrics",
            "tooth": "dentistry",
            "dental": "dentistry",
            "teeth": "dentistry"
        }
        
        # Find the most relevant specialty
        specialty = "general physician"  # default
        for symptom, spec in symptom_to_specialty.items():
            if symptom in condition:
                specialty = spec
                break
        
        # Return just the specialty name for searching
        return specialty

    def recommend_doctors_with_llm(self, patient_info: Dict, doctors_database: List[Dict]) -> Dict:
        recommendation_prompt = f"""You are a medical specialist matcher.
        Patient Information:
        - Symptoms: {patient_info.get('symptoms')}
        - Location: {patient_info.get('location')}
        - Age: {patient_info.get('age')}
        - Gender: {patient_info.get('gender')}
        - Medical History: {patient_info.get('medicalHistory')}

        Available Doctors:
        {doctors_database}

Your task:
1. Analyze the patient's symptoms and determine the most appropriate medical specialties
2. Find doctors from the database that match:
   - Relevant specialty for the symptoms
   - Same or nearby location
   - Consider patient's age and gender if relevant
3. Rank the top 3-5 doctors by relevance

Return a JSON object with this structure:
{{
  "recommendedSpecialty": "primary specialty needed",
  "reasoning": "brief explanation of why this specialty",
  "doctors": [
    {{
      "id": "doctor_id",
      "name": "Doctor Name",
      "specialty": "Specialty",
      "location": "City",
      "experience": "years or description",
      "rating": "if available",
      "matchScore": "1-10 relevance score",
      "whyRecommended": "specific reason for this patient"
    }}
  ]
}}

Rules:
- Return only valid JSON
- Maximum 5 doctor recommendations
- Include match score (1-10) based on specialty relevance and location proximity
- Provide specific reasoning for each recommendation
- If no perfect matches, suggest closest alternatives
        """

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[{"role": "user", "content": recommendation_prompt}],
                max_tokens=1000,
                temperature=0.3,
                response_format="json_object"
            )
            return response.choices[0].message.content
        except Exception as e:
            logging.error(f"[recommend_doctors_with_llm] LLM Recommendation Error: {e}")
            return {
                "recommendedSpecialty": "general physician",
                "reasoning": "Unable to process recommendations",
                "doctors": []
            }

    def chat_with_patient(self, user_message: str, conversation_history: List[Dict] = None) -> Dict:
        conversation_history = conversation_history or []
        messages = [{"role": "system", "content": self.get_appointment_system_prompt()}] + conversation_history + [
            {"role": "user", "content": user_message}]

        logging.debug("[chat_with_patient] Sending messages to OpenAI:\n%s", messages)

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
                top_p=0.9,
                frequency_penalty=0,
                presence_penalty=0
            )
            logging.debug("[chat_with_patient] OpenAI response:\n%s", response)
            return {
                "success": True,
                "message": response.choices[0].message.content,
                "conversationHistory": messages
            }
        except Exception as e:
            logging.error(f"[chat_with_patient] OpenAI Chat Error: {e}")
            return {
                "success": False,
                "message": "I'm having trouble processing your request right now. Please try again later.",
                "error": str(e)
            }

    def is_confirming_recommendations(self, user_message: str) -> bool:
        confirmations = [
            'yes', 'sure', 'okay', 'please', 'go ahead', 'proceed', 'continue', 'ok', 'yeah', 'yep',
            'no medical history', 'no history', 'new issue', 'first time', 'no previous', 'none',
            'recommend', 'recommendation', 'doctor', 'find', 'search', 'show', 'list'
        ]
        message = user_message.lower().strip()
        return any(term in message for term in confirmations)

    def generate_doctor_search_query(self, patient_info: Dict) -> str:
        symptom_to_specialty = {
            "headache": "neurologist", "heart": "cardiologist", "chest": "cardiologist",
            "skin": "dermatologist", "rash": "dermatologist", "anxiety": "psychiatrist",
            "depression": "psychiatrist", "stomach": "gastroenterologist", "nausea": "gastroenterologist",
            "bone": "orthopedist", "joint": "orthopedist", "eye": "ophthalmologist",
            "vision": "ophthalmologist", "ear": "otolaryngologist", "throat": "otolaryngologist",
            "chest pain": "cardiologist", "bleeding": "emergency", "heart attack": "cardiologist",
            "stroke": "neurologist", "seizure": "neurologist", "shortness of breath": "pulmonologist",
            "breathing": "pulmonologist", "breath": "pulmonologist"
        }

        symptoms = (patient_info.get("symptoms") or "").lower()
        specialty = next((spec for symptom, spec in symptom_to_specialty.items() if symptom in symptoms),
                         "general practitioner")
        location = patient_info.get("location", "").strip()
        return f"{specialty} in {location}" if location else specialty
