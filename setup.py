from setuptools import setup, find_packages

setup(
    name="radiology-backend",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "python-dotenv",
        "passlib[bcrypt]",
        "python-jose[cryptography]",
        "python-multipart",
        "tortoise-orm",
        "aiosqlite",
        "pydantic",
        "email-validator"
    ],
) 