from enum import Enum

class DoctorSpecialty(str, Enum):
    cardiologist = "Cardiologist"
    dermatologist = "Dermatologist"
    general_physician = "General Physician"
    ent = "ENT"
    pediatrician = "Pediatrician"
    neurologist = "Neurologist"
