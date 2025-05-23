import subprocess
import time
import sys
import os

def run_tests():
    print("Starting Database and API Tests...")
    
    # First, run the database tests
    print("\n1. Running Database Tests...")
    try:
        subprocess.run([sys.executable, "test_database.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Database tests failed: {e}")
        return
    
    # Start the FastAPI server in the background
    print("\n2. Starting FastAPI Server...")
    server_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--reload"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for the server to start
    print("Waiting for server to start...")
    time.sleep(5)
    
    # Run the API tests
    print("\n3. Running API Tests...")
    try:
        subprocess.run([sys.executable, "test_api.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"API tests failed: {e}")
    finally:
        # Stop the server
        print("\nStopping FastAPI Server...")
        server_process.terminate()
        server_process.wait()

if __name__ == "__main__":
    # Ensure we're in the correct directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    run_tests() 