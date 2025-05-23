from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.tortoise_config import init_db, close_db
from routers import patients, appointments, referring_physicians, studies, maintenance

app = FastAPI(title="Radiology System API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(referring_physicians.router)
app.include_router(studies.router)
app.include_router(maintenance.router)

@app.on_event("startup")
async def startup():
    await init_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

@app.get("/")
async def root():
    return {"message": "Welcome to Radiology System API"} 