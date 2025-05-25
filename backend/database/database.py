import os
from dotenv import load_dotenv
from tortoise import Tortoise

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def init_db():
    await Tortoise.init(
        db_url=DATABASE_URL,
        modules={"models": ["backend.models.tortoise_models"]}
    )
    await Tortoise.generate_schemas()

async def close_db():
    await Tortoise.close_connections() 