import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    # Connect to PostgreSQL server
    conn = psycopg2.connect(
        user="postgres",
        password="1234",
        host="localhost",
        port="5432"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    # Create a cursor
    cur = conn.cursor()
    
    try:
        # Check if database exists
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'radiology_db'")
        exists = cur.fetchone()
        
        if not exists:
            # Create database
            cur.execute('CREATE DATABASE radiology_db')
            print("Database 'radiology_db' created successfully!")
        else:
            print("Database 'radiology_db' already exists.")
            
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Close cursor and connection
        cur.close()
        conn.close()

if __name__ == "__main__":
    create_database() 