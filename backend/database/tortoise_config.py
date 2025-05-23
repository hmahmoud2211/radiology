from tortoise import Tortoise
from dotenv import load_dotenv
import os

load_dotenv()

TORTOISE_ORM = {
    "connections": {
        "default": os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/radiology_db")
    },
    "apps": {
        "models": {
            "models": ["models.tortoise_models", "aerich.models"],
            "default_connection": "default",
        },
    },
}

async def init_db():
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()

async def close_db():
    await Tortoise.close_connections() 