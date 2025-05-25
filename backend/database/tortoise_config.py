from tortoise import Tortoise
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Get the absolute path for the database file
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "db.sqlite3")
DB_URL = f"sqlite://{DB_PATH}"

TORTOISE_ORM = {
    "connections": {
        "default": DB_URL
    },
    "apps": {
        "models": {
            "models": ["backend.models.tortoise_models", "aerich.models"],
            "default_connection": "default",
        },
    },
}

async def init_db():
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()

async def close_db():
    await Tortoise.close_connections() 