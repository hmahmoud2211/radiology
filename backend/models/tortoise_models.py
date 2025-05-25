from tortoise import fields, models
from tortoise.contrib.pydantic import pydantic_model_creator
from datetime import datetime, date, time
import enum
from pydantic import BaseModel

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
    room = fields.ForeignKeyField('models.Room', related_name='studies')
    equipment = fields.ForeignKeyField('models.Equipment', related_name='studies')
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

class EquipmentStatus(str, enum.Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    REPAIR = "repair"
    RETIRED = "retired"
    RESERVED = "reserved"

class Equipment(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    type = fields.CharField(max_length=50)
    model = fields.CharField(max_length=100)
    serial_number = fields.CharField(max_length=100, unique=True)
    purchase_date = fields.DateField()
    warranty_expiry = fields.DateField()
    room = fields.ForeignKeyField('models.Room', related_name='equipment')
    status = fields.CharEnumField(EquipmentStatus, default=EquipmentStatus.ACTIVE)
    manufacturer = fields.CharField(max_length=100, null=True)
    installation_date = fields.DateField(null=True)
    last_calibration_date = fields.DateField(null=True)
    next_calibration_date = fields.DateField(null=True)
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "equipment"

class MaintenanceStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"

class MaintenanceType(str, enum.Enum):
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    EMERGENCY = "emergency"
    ROUTINE = "routine"

class MaintenanceRecord(models.Model):
    id = fields.IntField(pk=True)
    equipment = fields.ForeignKeyField('models.Equipment', related_name='maintenance_records')
    description = fields.TextField()
    performed_by = fields.CharField(max_length=100)
    cost = fields.DecimalField(max_digits=10, decimal_places=2)
    date = fields.DateField()
    last_maintenance_date = fields.DateField()
    next_maintenance_date = fields.DateField()
    status = fields.CharEnumField(MaintenanceStatus, default=MaintenanceStatus.SCHEDULED)
    maintenance_type = fields.CharField(max_length=50)  # e.g., "preventive", "corrective", "calibration"
    parts_replaced = fields.TextField(null=True)
    technician_notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "maintenance_records"

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    RADIOLOGIST = "radiologist"
    TECHNICIAN = "technician"
    RECEPTIONIST = "receptionist"
    REFERRING_PHYSICIAN = "referring_physician"

class User(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    email = fields.CharField(max_length=255, unique=True)
    password_hash = fields.CharField(max_length=255)
    role = fields.CharEnumField(UserRole)
    phone = fields.CharField(max_length=20, null=True)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    last_login = fields.DatetimeField(null=True)
    department = fields.CharField(max_length=100, null=True)
    specialization = fields.CharField(max_length=100, null=True)
    license_number = fields.CharField(max_length=50, null=True)

    class Meta:
        table = "users"

    def __str__(self):
        return f"{self.name} ({self.role})"

# Create Pydantic models
Patient_Pydantic = pydantic_model_creator(Patient, name="Patient")
PatientIn_Pydantic = pydantic_model_creator(Patient, name="PatientIn", exclude_readonly=True)

Appointment_Pydantic = pydantic_model_creator(Appointment, name="Appointment")
AppointmentIn_Pydantic = pydantic_model_creator(Appointment, name="AppointmentIn", exclude_readonly=True)

ReferringPhysician_Pydantic = pydantic_model_creator(ReferringPhysician, name="ReferringPhysician")
ReferringPhysicianIn_Pydantic = pydantic_model_creator(ReferringPhysician, name="ReferringPhysicianIn", exclude_readonly=True)

Study_Pydantic = pydantic_model_creator(Study, name="Study")
StudyIn_Pydantic = pydantic_model_creator(Study, name="StudyIn", exclude_readonly=True)

Equipment_Pydantic = pydantic_model_creator(Equipment, name="Equipment")
EquipmentIn_Pydantic = pydantic_model_creator(Equipment, name="EquipmentIn", exclude_readonly=True)

MaintenanceRecord_Pydantic = pydantic_model_creator(MaintenanceRecord, name="MaintenanceRecord")
MaintenanceRecordIn_Pydantic = pydantic_model_creator(MaintenanceRecord, name="MaintenanceRecordIn", exclude_readonly=True)

# Create Pydantic models for User
User_Pydantic = pydantic_model_creator(User, name="User", exclude=("password_hash",))
UserIn_Pydantic = pydantic_model_creator(
    User, 
    name="UserIn", 
    exclude_readonly=True,
    exclude=("id", "created_at", "updated_at", "last_login")
)

# --- Department and Room Models ---
class DepartmentStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    UNDER_MAINTENANCE = "under_maintenance"

class Department(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100, unique=True)
    description = fields.TextField(null=True)
    status = fields.CharEnumField(DepartmentStatus, default=DepartmentStatus.ACTIVE)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "departments"

class RoomStatus(str, enum.Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"
    INACTIVE = "inactive"

class Room(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    department = fields.ForeignKeyField('models.Department', related_name='rooms')
    capacity = fields.IntField()
    status = fields.CharEnumField(RoomStatus, default=RoomStatus.AVAILABLE)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "rooms"

# Create Pydantic models for Department and Room
Department_Pydantic = pydantic_model_creator(Department, name="Department")
DepartmentIn_Pydantic = pydantic_model_creator(Department, name="DepartmentIn", exclude_readonly=True)

Room_Pydantic = pydantic_model_creator(Room, name="Room")
RoomIn_Pydantic = pydantic_model_creator(Room, name="RoomIn", exclude_readonly=True)

class ReportStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    SIGNED = "signed"
    AMENDED = "amended"

class Report(models.Model):
    id = fields.IntField(pk=True)
    study = fields.ForeignKeyField('models.Study', related_name='reports')
    patient = fields.ForeignKeyField('models.Patient', related_name='reports')
    radiologist = fields.ForeignKeyField('models.User', related_name='reports')
    clinical_indication = fields.TextField()
    findings = fields.TextField()
    impression = fields.TextField()
    status = fields.CharEnumField(ReportStatus, default=ReportStatus.DRAFT)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    signed_at = fields.DatetimeField(null=True)
    signed_by = fields.CharField(max_length=100, null=True)
    is_ai_generated = fields.BooleanField(default=False)
    pdf_path = fields.TextField(null=True)
    template_used = fields.CharField(max_length=100, null=True)
    version = fields.CharField(max_length=20, default="1.0")
    additional_notes = fields.TextField(null=True)
    follow_up_recommendations = fields.TextField(null=True)
    critical_findings = fields.BooleanField(default=False)
    report_number = fields.CharField(max_length=50, unique=True)

    class Meta:
        table = "reports"

Report_Pydantic = pydantic_model_creator(Report, name="Report")
ReportIn_Pydantic = pydantic_model_creator(Report, name="ReportIn", exclude_readonly=True)

class ScheduleStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_LEAVE = "on_leave"
    BREAK = "break"

class Schedule(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='schedules')
    date = fields.DateField()
    start_time = fields.TimeField()
    end_time = fields.TimeField()
    status = fields.CharEnumField(ScheduleStatus, default=ScheduleStatus.SCHEDULED)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    notes = fields.TextField(null=True)
    is_recurring = fields.BooleanField(default=False)
    recurrence_pattern = fields.CharField(max_length=50, null=True)  # e.g., "weekly", "monthly"
    department = fields.ForeignKeyField('models.Department', related_name='schedules', null=True)

    class Meta:
        table = "schedules"

class AnnotationType(str, enum.Enum):
    MEASUREMENT = "measurement"
    MARKER = "marker"
    REGION = "region"
    TEXT = "text"
    SHAPE = "shape"
    CUSTOM = "custom"

class AnnotationStatus(str, enum.Enum):
    DRAFT = "draft"
    FINAL = "final"
    REVIEWED = "reviewed"
    REJECTED = "rejected"

class ImageAnnotation(models.Model):
    id = fields.IntField(pk=True)
    study = fields.ForeignKeyField('models.Study', related_name='annotations')
    annotation_data = fields.TextField()  # JSON string containing annotation coordinates and properties
    type = fields.CharEnumField(AnnotationType)
    status = fields.CharEnumField(AnnotationStatus, default=AnnotationStatus.DRAFT)
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    created_by = fields.ForeignKeyField('models.User', related_name='created_annotations')
    reviewed_by = fields.ForeignKeyField('models.User', related_name='reviewed_annotations', null=True)
    reviewed_at = fields.DatetimeField(null=True)
    version = fields.IntField(default=1)
    is_ai_generated = fields.BooleanField(default=False)
    confidence_score = fields.FloatField(null=True)  # For AI-generated annotations
    coordinates = fields.JSONField(null=True)  # Store geometric coordinates
    metadata = fields.JSONField(null=True)  # Additional metadata

    class Meta:
        table = "image_annotations"

# Create Pydantic models
Schedule_Pydantic = pydantic_model_creator(Schedule, name="Schedule")
ScheduleIn_Pydantic = pydantic_model_creator(Schedule, name="ScheduleIn", exclude_readonly=True)

ImageAnnotation_Pydantic = pydantic_model_creator(ImageAnnotation, name="ImageAnnotation")
ImageAnnotationIn_Pydantic = pydantic_model_creator(ImageAnnotation, name="ImageAnnotationIn", exclude_readonly=True)

class TechnologistStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"
    TERMINATED = "terminated"

class Technologist(models.Model):
    id = fields.IntField(pk=True)
    first_name = fields.CharField(max_length=100)
    last_name = fields.CharField(max_length=100)
    email = fields.CharField(max_length=100, unique=True)
    role = fields.CharField(max_length=50)
    department = fields.ForeignKeyField('models.Department', related_name='technologists')
    specialization = fields.CharField(max_length=100)
    npi = fields.CharField(max_length=50, unique=True, null=True)
    license = fields.CharField(max_length=50, unique=True)
    profile_pic = fields.TextField(null=True)  # URL or base64 string
    affiliation = fields.CharField(max_length=100)
    years_of_experience = fields.IntField()
    status = fields.CharEnumField(TechnologistStatus, default=TechnologistStatus.ACTIVE)
    phone_number = fields.CharField(max_length=20, null=True)
    address = fields.TextField(null=True)
    certifications = fields.JSONField(null=True)  # List of certifications
    shift_preference = fields.CharField(max_length=50, null=True)
    emergency_contact = fields.JSONField(null=True)  # Emergency contact details
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    last_login = fields.DatetimeField(null=True)
    notes = fields.TextField(null=True)

    class Meta:
        table = "technologists"

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"

# Create Pydantic models for Technologist
Technologist_Pydantic = pydantic_model_creator(Technologist, name="Technologist")
TechnologistIn_Pydantic = pydantic_model_creator(Technologist, name="TechnologistIn", exclude_readonly=True)

class InsuranceStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    PENDING = "pending"

class Insurance(models.Model):
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='insurances')
    provider_name = fields.CharField(max_length=100)
    policy_number = fields.CharField(max_length=50)
    group_number = fields.CharField(max_length=50, null=True)
    coverage_type = fields.CharField(max_length=50)
    start_date = fields.DateField()
    end_date = fields.DateField(null=True)
    status = fields.CharEnumField(InsuranceStatus, default=InsuranceStatus.ACTIVE)
    is_primary = fields.BooleanField(default=True)
    copay_amount = fields.DecimalField(max_digits=10, decimal_places=2, null=True)
    deductible_amount = fields.DecimalField(max_digits=10, decimal_places=2, null=True)
    coverage_percentage = fields.IntField(null=True)  # e.g., 80 for 80% coverage
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "insurances"

    def __str__(self):
        return f"{self.provider_name} - {self.policy_number}"

# Create Pydantic models for Insurance
Insurance_Pydantic = pydantic_model_creator(Insurance, name="Insurance")
InsuranceIn_Pydantic = pydantic_model_creator(Insurance, name="InsuranceIn", exclude_readonly=True)

class ConditionStatus(str, enum.Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"
    CHRONIC = "chronic"
    IN_REMISSION = "in_remission"

class MedicalHistory(models.Model):
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='medical_history')
    condition = fields.CharField(max_length=200)
    diagnosis_date = fields.DateField()
    status = fields.CharEnumField(ConditionStatus, default=ConditionStatus.ACTIVE)
    icd_code = fields.CharField(max_length=20, null=True)  # International Classification of Diseases code
    severity = fields.CharField(max_length=50, null=True)  # mild, moderate, severe
    treatment = fields.TextField(null=True)
    medications = fields.JSONField(null=True)  # List of medications
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    diagnosed_by = fields.ForeignKeyField('models.User', related_name='diagnoses', null=True)

    class Meta:
        table = "medical_history"

    def __str__(self):
        return f"{self.condition} ({self.status})"

class AllergySeverity(str, enum.Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    LIFE_THREATENING = "life_threatening"

class Allergy(models.Model):
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='allergies')
    allergen = fields.CharField(max_length=100)
    reaction = fields.TextField()
    severity = fields.CharEnumField(AllergySeverity, default=AllergySeverity.MODERATE)
    onset_date = fields.DateField(null=True)
    is_active = fields.BooleanField(default=True)
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    reported_by = fields.ForeignKeyField('models.User', related_name='reported_allergies', null=True)
    last_reaction_date = fields.DateField(null=True)
    treatment = fields.TextField(null=True)
    cross_reactions = fields.JSONField(null=True)  # List of related allergens

    class Meta:
        table = "allergies"

    def __str__(self):
        return f"{self.allergen} ({self.severity})"

# Create Pydantic models for MedicalHistory and Allergy
MedicalHistory_Pydantic = pydantic_model_creator(MedicalHistory, name="MedicalHistory")
MedicalHistoryIn_Pydantic = pydantic_model_creator(MedicalHistory, name="MedicalHistoryIn", exclude_readonly=True)

Allergy_Pydantic = pydantic_model_creator(Allergy, name="Allergy")
AllergyIn_Pydantic = pydantic_model_creator(Allergy, name="AllergyIn", exclude_readonly=True)

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"

class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    INSURANCE = "insurance"
    BANK_TRANSFER = "bank_transfer"
    ONLINE_PAYMENT = "online_payment"

class Billing(models.Model):
    id = fields.IntField(pk=True)
    patient = fields.ForeignKeyField('models.Patient', related_name='billings')
    study = fields.ForeignKeyField('models.Study', related_name='billings')
    insurance = fields.ForeignKeyField('models.Insurance', related_name='billings', null=True)
    amount = fields.DecimalField(max_digits=10, decimal_places=2)
    description = fields.TextField()
    billing_date = fields.DateField()
    due_date = fields.DateField()
    is_paid = fields.BooleanField(default=False)
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    created_by = fields.ForeignKeyField('models.User', related_name='created_billings')
    updated_by = fields.ForeignKeyField('models.User', related_name='updated_billings')

    class Meta:
        table = "billings"

    def __str__(self):
        return f"Billing {self.id} - {self.patient.first_name} {self.patient.last_name}"

class Payment(models.Model):
    id = fields.IntField(pk=True)
    billing = fields.ForeignKeyField('models.Billing', related_name='payments')
    amount = fields.DecimalField(max_digits=10, decimal_places=2)
    payment_date = fields.DateField()
    payment_method = fields.CharEnumField(PaymentMethod)
    status = fields.CharEnumField(PaymentStatus, default=PaymentStatus.PENDING)
    transaction_id = fields.CharField(max_length=100, null=True)
    receipt_number = fields.CharField(max_length=100, null=True)
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    processed_by = fields.ForeignKeyField('models.User', related_name='processed_payments')

    class Meta:
        table = "payments"

    def __str__(self):
        return f"Payment {self.id} - {self.billing.patient.first_name} {self.billing.patient.last_name}"

# Create Pydantic models for Billing and Payment
Billing_Pydantic = pydantic_model_creator(Billing, name="Billing")
BillingIn_Pydantic = pydantic_model_creator(Billing, name="BillingIn", exclude_readonly=True)

Payment_Pydantic = pydantic_model_creator(Payment, name="Payment")
PaymentIn_Pydantic = pydantic_model_creator(Payment, name="PaymentIn", exclude_readonly=True)

class QualityControlStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    PASSED = "passed"
    FAILED = "failed"
    NEEDS_REVIEW = "needs_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class QualityControlType(str, enum.Enum):
    EQUIPMENT = "equipment"
    IMAGE = "image"
    REPORT = "report"
    PROCEDURE = "procedure"
    SAFETY = "safety"
    COMPLIANCE = "compliance"

class QualityControl(models.Model):
    id = fields.IntField(pk=True)
    type = fields.CharEnumField(QualityControlType)
    status = fields.CharEnumField(QualityControlStatus, default=QualityControlStatus.PENDING)
    study = fields.ForeignKeyField('models.Study', related_name='quality_controls', null=True)
    equipment = fields.ForeignKeyField('models.Equipment', related_name='quality_controls', null=True)
    report = fields.ForeignKeyField('models.Report', related_name='quality_controls', null=True)
    description = fields.TextField()
    findings = fields.TextField(null=True)
    corrective_actions = fields.TextField(null=True)
    performed_by = fields.ForeignKeyField('models.User', related_name='performed_quality_controls')
    reviewed_by = fields.ForeignKeyField('models.User', related_name='reviewed_quality_controls', null=True)
    review_date = fields.DateField(null=True)
    review_notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    due_date = fields.DateField(null=True)
    priority = fields.CharField(max_length=20, default="normal")
    attachments = fields.JSONField(null=True)  # List of file paths or references
    metrics = fields.JSONField(null=True)  # Quality metrics and measurements

    class Meta:
        table = "quality_controls"

    def __str__(self):
        return f"QC {self.id} - {self.type} ({self.status})"

class ProtocolCategory(str, enum.Enum):
    CT = "ct"
    MRI = "mri"
    XRAY = "xray"
    ULTRASOUND = "ultrasound"
    NUCLEAR_MEDICINE = "nuclear_medicine"
    INTERVENTIONAL = "interventional"
    GENERAL = "general"

class ProtocolTemplate(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=200)
    category = fields.CharEnumField(ProtocolCategory)
    description = fields.TextField()
    equipment_type = fields.CharField(max_length=100)
    protocol_steps = fields.JSONField()  # List of steps with parameters
    parameters = fields.JSONField()  # Technical parameters
    contraindications = fields.TextField(null=True)
    preparation_instructions = fields.TextField(null=True)
    post_procedure_instructions = fields.TextField(null=True)
    estimated_duration = fields.IntField(null=True)  # in minutes
    is_active = fields.BooleanField(default=True)
    version = fields.CharField(max_length=20, default="1.0")
    created_by = fields.ForeignKeyField('models.User', related_name='created_protocols')
    updated_by = fields.ForeignKeyField('models.User', related_name='updated_protocols')
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    department = fields.ForeignKeyField('models.Department', related_name='protocols')
    attachments = fields.JSONField(null=True)  # List of file paths or references
    notes = fields.TextField(null=True)
    quality_requirements = fields.JSONField(null=True)  # Quality control requirements
    radiation_dose = fields.JSONField(null=True)  # Radiation dose information
    safety_guidelines = fields.TextField(null=True)

    class Meta:
        table = "protocol_templates"

    def __str__(self):
        return f"{self.name} ({self.category})"

# Create Pydantic models for QualityControl and ProtocolTemplate
QualityControl_Pydantic = pydantic_model_creator(QualityControl, name="QualityControl")
QualityControlIn_Pydantic = pydantic_model_creator(QualityControl, name="QualityControlIn", exclude_readonly=True)

ProtocolTemplate_Pydantic = pydantic_model_creator(ProtocolTemplate, name="ProtocolTemplate")
ProtocolTemplateIn_Pydantic = pydantic_model_creator(ProtocolTemplate, name="ProtocolTemplateIn", exclude_readonly=True)

class SupplyCategory(str, enum.Enum):
    CONTRAST_AGENT = "contrast_agent"
    MEDICATION = "medication"
    CONSUMABLE = "consumable"
    EQUIPMENT_PART = "equipment_part"
    OTHER = "other"

class SupplyStatus(str, enum.Enum):
    IN_STOCK = "in_stock"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    DISCONTINUED = "discontinued"
    ON_ORDER = "on_order"

class Supply(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=200)
    category = fields.CharEnumField(SupplyCategory)
    description = fields.TextField(null=True)
    manufacturer = fields.CharField(max_length=200, null=True)
    supplier = fields.CharField(max_length=200, null=True)
    unit_of_measure = fields.CharField(max_length=50)
    current_quantity = fields.DecimalField(max_digits=10, decimal_places=2)
    minimum_quantity = fields.DecimalField(max_digits=10, decimal_places=2)
    maximum_quantity = fields.DecimalField(max_digits=10, decimal_places=2)
    unit_price = fields.DecimalField(max_digits=10, decimal_places=2)
    lot_number = fields.CharField(max_length=100, null=True)
    expiration_date = fields.DateField(null=True)
    storage_location = fields.CharField(max_length=200, null=True)
    status = fields.CharEnumField(SupplyStatus, default=SupplyStatus.IN_STOCK)
    department = fields.ForeignKeyField('models.Department', related_name='supplies')
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    created_by = fields.ForeignKeyField('models.User', related_name='created_supplies')
    updated_by = fields.ForeignKeyField('models.User', related_name='updated_supplies')

    class Meta:
        table = "supplies"

    def __str__(self):
        return f"{self.name} ({self.category})"

class TransactionType(str, enum.Enum):
    RECEIVED = "received"
    ISSUED = "issued"
    ADJUSTED = "adjusted"
    RETURNED = "returned"
    EXPIRED = "expired"
    DAMAGED = "damaged"

class InventoryTransaction(models.Model):
    id = fields.IntField(pk=True)
    supply = fields.ForeignKeyField('models.Supply', related_name='transactions')
    transaction_type = fields.CharEnumField(TransactionType)
    quantity = fields.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = fields.DatetimeField()
    reference_number = fields.CharField(max_length=100, null=True)
    study = fields.ForeignKeyField('models.Study', related_name='inventory_transactions', null=True)
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    performed_by = fields.ForeignKeyField('models.User', related_name='performed_transactions')
    department = fields.ForeignKeyField('models.Department', related_name='inventory_transactions')

    class Meta:
        table = "inventory_transactions"

    def __str__(self):
        return f"{self.transaction_type} - {self.supply.name}"

class AlertType(str, enum.Enum):
    LOW_STOCK = "low_stock"
    EXPIRING = "expiring"
    EXPIRED = "expired"
    RECALL = "recall"
    CUSTOM = "custom"

class InventoryAlert(models.Model):
    id = fields.IntField(pk=True)
    supply = fields.ForeignKeyField('models.Supply', related_name='alerts')
    alert_type = fields.CharEnumField(AlertType)
    message = fields.TextField()
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    acknowledged_at = fields.DatetimeField(null=True)
    acknowledged_by = fields.ForeignKeyField('models.User', related_name='acknowledged_alerts', null=True)
    department = fields.ForeignKeyField('models.Department', related_name='inventory_alerts')

    class Meta:
        table = "inventory_alerts"

    def __str__(self):
        return f"{self.alert_type} - {self.supply.name}"

# Create Pydantic models for Inventory Management
Supply_Pydantic = pydantic_model_creator(Supply, name="Supply")
SupplyIn_Pydantic = pydantic_model_creator(Supply, name="SupplyIn", exclude_readonly=True)

InventoryTransaction_Pydantic = pydantic_model_creator(InventoryTransaction, name="InventoryTransaction")
InventoryTransactionIn_Pydantic = pydantic_model_creator(InventoryTransaction, name="InventoryTransactionIn", exclude_readonly=True)

InventoryAlert_Pydantic = pydantic_model_creator(InventoryAlert, name="InventoryAlert")
InventoryAlertIn_Pydantic = pydantic_model_creator(InventoryAlert, name="InventoryAlertIn", exclude_readonly=True)

class AuditAction(str, enum.Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"
    IMPORT = "import"
    APPROVE = "approve"
    REJECT = "reject"
    SHARE = "share"
    DOWNLOAD = "download"
    PRINT = "print"

class AuditModule(str, enum.Enum):
    PATIENT = "patient"
    STUDY = "study"
    REPORT = "report"
    USER = "user"
    EQUIPMENT = "equipment"
    INVENTORY = "inventory"
    BILLING = "billing"
    SYSTEM = "system"
    DOCUMENT = "document"

class AuditLog(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='audit_logs')
    action = fields.CharEnumField(AuditAction)
    module = fields.CharEnumField(AuditModule)
    description = fields.TextField()
    ip_address = fields.CharField(max_length=50, null=True)
    user_agent = fields.TextField(null=True)
    resource_id = fields.IntField(null=True)  # ID of the affected resource
    resource_type = fields.CharField(max_length=100, null=True)
    old_values = fields.JSONField(null=True)  # Previous state
    new_values = fields.JSONField(null=True)  # New state
    created_at = fields.DatetimeField(auto_now_add=True)
    department = fields.ForeignKeyField('models.Department', related_name='audit_logs', null=True)

    class Meta:
        table = "audit_logs"

    def __str__(self):
        return f"{self.action} - {self.module} by {self.user.name}"

class ComplianceStatus(str, enum.Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PENDING_REVIEW = "pending_review"
    NEEDS_ACTION = "needs_action"
    EXEMPT = "exempt"

class ComplianceRecord(models.Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=200)
    description = fields.TextField()
    regulation = fields.CharField(max_length=200)  # e.g., "HIPAA", "GDPR"
    requirement = fields.TextField()
    status = fields.CharEnumField(ComplianceStatus, default=ComplianceStatus.PENDING_REVIEW)
    due_date = fields.DateField(null=True)
    completion_date = fields.DateField(null=True)
    assigned_to = fields.ForeignKeyField('models.User', related_name='assigned_compliance_records')
    department = fields.ForeignKeyField('models.Department', related_name='compliance_records')
    evidence = fields.JSONField(null=True)  # Links to evidence documents
    notes = fields.TextField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    created_by = fields.ForeignKeyField('models.User', related_name='created_compliance_records')
    updated_by = fields.ForeignKeyField('models.User', related_name='updated_compliance_records')

    class Meta:
        table = "compliance_records"

    def __str__(self):
        return f"{self.title} - {self.regulation}"

class IncidentSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IncidentStatus(str, enum.Enum):
    REPORTED = "reported"
    UNDER_INVESTIGATION = "under_investigation"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REOPENED = "reopened"

class IncidentReport(models.Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=200)
    description = fields.TextField()
    severity = fields.CharEnumField(IncidentSeverity)
    status = fields.CharEnumField(IncidentStatus, default=IncidentStatus.REPORTED)
    reported_by = fields.ForeignKeyField('models.User', related_name='reported_incidents')
    assigned_to = fields.ForeignKeyField('models.User', related_name='assigned_incidents', null=True)
    department = fields.ForeignKeyField('models.Department', related_name='incidents')
    incident_date = fields.DatetimeField()
    resolution_date = fields.DatetimeField(null=True)
    resolution_notes = fields.TextField(null=True)
    affected_patients = fields.JSONField(null=True)  # List of affected patient IDs
    affected_studies = fields.JSONField(null=True)  # List of affected study IDs
    corrective_actions = fields.TextField(null=True)
    preventive_measures = fields.TextField(null=True)
    attachments = fields.JSONField(null=True)  # List of file paths or references
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "incident_reports"

    def __str__(self):
        return f"{self.title} - {self.severity}"

# Create Pydantic models for Audit and Compliance
AuditLog_Pydantic = pydantic_model_creator(AuditLog, name="AuditLog")
AuditLogIn_Pydantic = pydantic_model_creator(AuditLog, name="AuditLogIn", exclude_readonly=True)

ComplianceRecord_Pydantic = pydantic_model_creator(ComplianceRecord, name="ComplianceRecord")
ComplianceRecordIn_Pydantic = pydantic_model_creator(ComplianceRecord, name="ComplianceRecordIn", exclude_readonly=True)

IncidentReport_Pydantic = pydantic_model_creator(IncidentReport, name="IncidentReport")
IncidentReportIn_Pydantic = pydantic_model_creator(IncidentReport, name="IncidentReportIn", exclude_readonly=True)

class DocumentCategory(str, enum.Enum):
    REPORT = "report"
    POLICY = "policy"
    PROCEDURE = "procedure"
    FORM = "form"
    TEMPLATE = "template"
    CONTRACT = "contract"
    CERTIFICATE = "certificate"
    TRAINING = "training"
    COMPLIANCE = "compliance"
    OTHER = "other"

class DocumentStatus(str, enum.Enum):
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    ARCHIVED = "archived"
    EXPIRED = "expired"

class Document(models.Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=200)
    description = fields.TextField(null=True)
    category = fields.CharEnumField(DocumentCategory)
    status = fields.CharEnumField(DocumentStatus, default=DocumentStatus.DRAFT)
    file_path = fields.TextField()  # Path to the stored file
    file_type = fields.CharField(max_length=50)  # e.g., "pdf", "docx"
    file_size = fields.IntField()  # Size in bytes
    version = fields.CharField(max_length=20, default="1.0")
    department = fields.ForeignKeyField('models.Department', related_name='documents')
    created_by = fields.ForeignKeyField('models.User', related_name='created_documents')
    updated_by = fields.ForeignKeyField('models.User', related_name='updated_documents')
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    expiration_date = fields.DateField(null=True)
    tags = fields.JSONField(null=True)  # List of tags
    metadata = fields.JSONField(null=True)  # Additional metadata
    is_public = fields.BooleanField(default=False)
    access_control = fields.JSONField(null=True)  # Access control rules
    parent_document = fields.ForeignKeyField('models.Document', related_name='child_documents', null=True)

    class Meta:
        table = "documents"

    def __str__(self):
        return f"{self.title} (v{self.version})"

class DocumentVersion(models.Model):
    id = fields.IntField(pk=True)
    document = fields.ForeignKeyField('models.Document', related_name='versions')
    version_number = fields.CharField(max_length=20)
    file_path = fields.TextField()
    file_size = fields.IntField()
    changes = fields.TextField(null=True)  # Description of changes
    created_by = fields.ForeignKeyField('models.User', related_name='created_versions')
    created_at = fields.DatetimeField(auto_now_add=True)
    is_current = fields.BooleanField(default=False)

    class Meta:
        table = "document_versions"

    def __str__(self):
        return f"{self.document.title} v{self.version_number}"

class DocumentShare(models.Model):
    id = fields.IntField(pk=True)
    document = fields.ForeignKeyField('models.Document', related_name='shares')
    shared_with = fields.ForeignKeyField('models.User', related_name='shared_documents')
    shared_by = fields.ForeignKeyField('models.User', related_name='shared_by_me')
    permission = fields.CharField(max_length=20)  # e.g., "read", "write", "admin"
    expires_at = fields.DatetimeField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    is_active = fields.BooleanField(default=True)

    class Meta:
        table = "document_shares"

    def __str__(self):
        return f"{self.document.title} shared with {self.shared_with.name}"

# Create Pydantic models for Document Management
Document_Pydantic = pydantic_model_creator(Document, name="Document")
DocumentIn_Pydantic = pydantic_model_creator(Document, name="DocumentIn", exclude_readonly=True)

DocumentVersion_Pydantic = pydantic_model_creator(DocumentVersion, name="DocumentVersion")
DocumentVersionIn_Pydantic = pydantic_model_creator(DocumentVersion, name="DocumentVersionIn", exclude_readonly=True)

DocumentShare_Pydantic = pydantic_model_creator(DocumentShare, name="DocumentShare")
DocumentShareIn_Pydantic = pydantic_model_creator(DocumentShare, name="DocumentShareIn", exclude_readonly=True)

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    phone: str = None
    is_active: bool = True
    department: str = None
    specialization: str = None
    license_number: str = None

# ... existing code ... 