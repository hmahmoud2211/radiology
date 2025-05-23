from sqlalchemy import Column, Integer, String, Date, Enum
from database.database import Base
import enum

class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    phone_number = Column(String)
    email = Column(String, unique=True, index=True)
    address = Column(String)
    medical_record_number = Column(String, unique=True, index=True) 