from tortoise import fields, models
from tortoise.contrib.pydantic import pydantic_model_creator
from datetime import datetime, date
import enum

class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class Patient(models.Model):
    id = fields.IntField(pk=True)
    first_name = fields.CharField(max_length=100)
    last_name = fields.CharField(max_length=100)
    date_of_birth = fields.DateField()
    gender = fields.CharEnumField(Gender)
    phone_number = fields.CharField(max_length=20, null=True)
    email = fields.CharField(max_length=100, unique=True, null=True)
    address = fields.TextField(null=True)
    medical_record_number = fields.CharField(max_length=50, unique=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "patients"

class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class AppointmentType(str, enum.Enum):
    CONSULTATION = "consultation"
    SCAN = "scan"
    FOLLOW_UP = "follow_up"
    OTHER = "other"

class Appointment(models.Model):
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='appointments')
    scheduled_time = fields.DatetimeField()
    type = fields.CharEnumField(AppointmentType)
    status = fields.CharEnumField(AppointmentStatus, default=AppointmentStatus.SCHEDULED)
    reason = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "appointments"

class ReferringPhysician(models.Model):
    id = fields.IntField(pk=True)
    first_name = fields.CharField(max_length=50)
    last_name = fields.CharField(max_length=50)
    specialization = fields.CharField(max_length=100)
    contact_number = fields.CharField(max_length=20, null=True)
    email = fields.CharField(max_length=100, unique=True, null=True)
    address = fields.TextField(null=True)
    hospital_affiliation = fields.CharField(max_length=100, null=True)
    license_number = fields.CharField(max_length=50, unique=True)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "referring_physicians"

class StudyStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REPORTED = "reported"

class Study(models.Model):
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='studies')
    referring_physician = fields.ForeignKeyField('models.ReferringPhysician', related_name='studies')
    room_id = fields.IntField()
    equipment_id = fields.IntField()
    study_date = fields.DatetimeField()
    study_type = fields.CharField(max_length=100)
    priority = fields.CharField(max_length=20, default="normal")
    notes = fields.TextField(null=True)
    status = fields.CharEnumField(StudyStatus, default=StudyStatus.SCHEDULED)
    report = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "studies"

class MaintenanceStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MaintenanceType(str, enum.Enum):
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    EMERGENCY = "emergency"
    ROUTINE = "routine"

class MaintenanceRecord(models.Model):
    maintenance_id = fields.IntField(pk=True)
    equipment_id = fields.IntField()
    description = fields.TextField()
    performed_by = fields.CharField(max_length=100)
    cost = fields.DecimalField(max_digits=10, decimal_places=2)
    date = fields.DateField()
    last_maintenance_date = fields.DateField()
    next_maintenance_date = fields.DateField()
    status = fields.CharEnumField(MaintenanceStatus, default=MaintenanceStatus.SCHEDULED)
    maintenance_type = fields.CharEnumField(MaintenanceType)
    parts_replaced = fields.TextField(null=True)
    technician_notes = fields.TextField(null=True)
    created_at = fields.DateField(auto_now_add=True)
    updated_at = fields.DateField(auto_now=True)

    class Meta:
        table = "maintenance_records"

# Create Pydantic models
Patient_Pydantic = pydantic_model_creator(Patient, name="Patient")
PatientIn_Pydantic = pydantic_model_creator(Patient, name="PatientIn", exclude_readonly=True)

Appointment_Pydantic = pydantic_model_creator(Appointment, name="Appointment")
AppointmentIn_Pydantic = pydantic_model_creator(Appointment, name="AppointmentIn", exclude_readonly=True)

ReferringPhysician_Pydantic = pydantic_model_creator(ReferringPhysician, name="ReferringPhysician")
ReferringPhysicianIn_Pydantic = pydantic_model_creator(ReferringPhysician, name="ReferringPhysicianIn", exclude_readonly=True)

Study_Pydantic = pydantic_model_creator(Study, name="Study")
StudyIn_Pydantic = pydantic_model_creator(Study, name="StudyIn", exclude_readonly=True)

MaintenanceRecord_Pydantic = pydantic_model_creator(MaintenanceRecord, name="MaintenanceRecord")
MaintenanceRecordIn_Pydantic = pydantic_model_creator(MaintenanceRecord, name="MaintenanceRecordIn", exclude_readonly=True) 