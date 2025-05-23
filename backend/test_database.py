from sqlalchemy.orm import Session
from database.database import SessionLocal, engine
from models import patient, appointment, referring_physician, study
from datetime import datetime, timedelta
import random

# Create all tables
patient.Base.metadata.create_all(bind=engine)
appointment.Base.metadata.create_all(bind=engine)
referring_physician.Base.metadata.create_all(bind=engine)
study.Base.metadata.create_all(bind=engine)

def create_test_data():
    db = SessionLocal()
    try:
        # Create test patients
        patients = [
            patient.Patient(
                first_name="John",
                last_name="Doe",
                date_of_birth=datetime(1980, 1, 1),
                gender="male",
                phone_number="+1234567890",
                email="john.doe@example.com",
                address="123 Main St",
                medical_record_number="MRN001"
            ),
            patient.Patient(
                first_name="Jane",
                last_name="Smith",
                date_of_birth=datetime(1985, 5, 15),
                gender="female",
                phone_number="+1987654321",
                email="jane.smith@example.com",
                address="456 Oak St",
                medical_record_number="MRN002"
            )
        ]
        db.add_all(patients)
        db.commit()

        # Create test referring physicians
        physicians = [
            referring_physician.ReferringPhysician(
                first_name="Dr. Robert",
                last_name="Johnson",
                specialization="Cardiology",
                contact_number="+1122334455",
                email="robert.johnson@hospital.com",
                address="789 Medical Center Dr",
                hospital_affiliation="City General Hospital",
                license_number="MD123456"
            ),
            referring_physician.ReferringPhysician(
                first_name="Dr. Sarah",
                last_name="Williams",
                specialization="Neurology",
                contact_number="+1555666777",
                email="sarah.williams@hospital.com",
                address="321 Health Ave",
                hospital_affiliation="Memorial Hospital",
                license_number="MD789012"
            )
        ]
        db.add_all(physicians)
        db.commit()

        # Create test studies
        study_types = ["X-Ray", "MRI", "CT Scan", "Ultrasound"]
        priorities = ["urgent", "normal", "routine"]
        
        for i in range(5):
            new_study = study.Study(
                patient_id=random.choice([p.id for p in patients]),
                referring_physician_id=random.choice([p.id for p in physicians]),
                room_id=1,  # Assuming room_id 1 exists
                equipment_id=1,  # Assuming equipment_id 1 exists
                study_date=datetime.now() + timedelta(days=random.randint(1, 30)),
                study_type=random.choice(study_types),
                priority=random.choice(priorities),
                notes=f"Test study {i+1}",
                status=study.StudyStatus.SCHEDULED
            )
            db.add(new_study)
        
        db.commit()
        print("Test data created successfully!")

    except Exception as e:
        print(f"Error creating test data: {e}")
        db.rollback()
    finally:
        db.close()

def verify_data():
    db = SessionLocal()
    try:
        # Verify patients
        patients = db.query(patient.Patient).all()
        print(f"\nFound {len(patients)} patients:")
        for p in patients:
            print(f"- {p.first_name} {p.last_name} (MRN: {p.medical_record_number})")

        # Verify physicians
        physicians = db.query(referring_physician.ReferringPhysician).all()
        print(f"\nFound {len(physicians)} physicians:")
        for p in physicians:
            print(f"- Dr. {p.first_name} {p.last_name} ({p.specialization})")

        # Verify studies
        studies = db.query(study.Study).all()
        print(f"\nFound {len(studies)} studies:")
        for s in studies:
            print(f"- Study {s.id}: {s.study_type} for Patient {s.patient_id}")

    except Exception as e:
        print(f"Error verifying data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating test data...")
    create_test_data()
    print("\nVerifying data...")
    verify_data() 