from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from backend.database.tortoise_config import init_db, close_db, DB_URL
from backend.routers import (
    patients, appointments, referring_physicians, studies,
    maintenance, users, auth, rooms, departments, equipment,
    report, schedule, image_annotation, technologists, insurances,
    medical_history, allergies, billing, payment, quality_control, protocol_template,
    inventory, audit, document
)
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from root directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Radiology Information System API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:19006",
        "http://localhost:8081",  # Expo web default
        "http://localhost:8083",  # If Expo asks to use another port
        "http://*",  # Allow all HTTP origins
        "https://*",  # Allow all HTTPS origins
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(referring_physicians.router)
app.include_router(studies.router)
app.include_router(maintenance.router)
app.include_router(users.router)
app.include_router(rooms.router)
app.include_router(departments.router)
app.include_router(equipment.router)
app.include_router(report.router)
app.include_router(schedule.router)
app.include_router(image_annotation.router)
app.include_router(technologists.router)
app.include_router(insurances.router)
app.include_router(medical_history.router)
app.include_router(allergies.router)
app.include_router(billing.router)
app.include_router(payment.router)
app.include_router(quality_control.router)
app.include_router(protocol_template.router)
app.include_router(inventory.router)
app.include_router(audit.router)
app.include_router(document.router)

# Register Tortoise ORM
register_tortoise(
    app,
    db_url=DB_URL,
    modules={"models": ["backend.models.tortoise_models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)

@app.on_event("startup")
async def startup():
    await init_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

@app.get("/")
async def root():
    return {"message": "Welcome to Radiology Information System API"}