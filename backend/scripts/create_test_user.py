import asyncio
import sys
import os

# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from tortoise import Tortoise
from backend.models.tortoise_models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_test_user():
    # Initialize Tortoise
    await Tortoise.init(
        db_url='postgres://postgres:postgres@localhost:5432/radiology_db',
        modules={'models': ['backend.models.tortoise_models']}
    )
    
    # Create tables
    await Tortoise.generate_schemas()
    
    # Check if user already exists
    if not await User.filter(email="test@example.com").exists():
        # Create test user
        await User.create(
            name="Test User",
            email="test@example.com",
            password_hash=pwd_context.hash("password123"),
            role="admin"
        )
        print("Test user created successfully!")
    else:
        print("Test user already exists!")
    
    # Close connection
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(create_test_user()) 