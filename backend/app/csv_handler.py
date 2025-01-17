# csv_handler.py
import csv
import os
from datetime import datetime
from fastapi import HTTPException
from pydantic import BaseModel

class BusData(BaseModel):
    bus_id: str
    current_stop: str
    next_stop: str
    latitude: float
    longitude: float
    passengers: int
    estimated: str
    current_time:str
    

# Directory to store CSV files
DATA_DIRECTORY = "data"

# Ensure the directory exists
os.makedirs(DATA_DIRECTORY, exist_ok=True)
def save_to_csv(bus_data: BusData, filename=None):
    try:
        # Generate the filename for the current month if not provided
        if filename is None:
            filename = datetime.now().strftime("%Y-%m") + ".csv"
        filepath = os.path.join(DATA_DIRECTORY, filename)

        # Extract date and time from current_time string
        date_time_obj = datetime.strptime(bus_data.current_time, "%Y-%m-%d %H:%M:%S")
        date = date_time_obj.strftime("%Y-%m-%d")
        time = date_time_obj.strftime("%H:%M:%S")

        # Define correct headers
        correct_headers = [
            'Bus ID',
            'Current Stop',
            'Next Stop',
            'Latitude',
            'Longitude',
            'Passengers',
            'Estimated Time',
            'Date',
            'Time'
        ]

        # Check if the file already exists
        file_exists = os.path.exists(filepath)

        with open(filepath, mode="a", newline='') as file:
            writer = csv.writer(file)

            # Write headers only if the file is new
            if not file_exists:
                writer.writerow(correct_headers)

            # Write the data row
            writer.writerow([
                bus_data.bus_id,
                bus_data.current_stop,
                bus_data.next_stop,
                bus_data.latitude,
                bus_data.longitude,
                bus_data.passengers,
                bus_data.estimated,
                date,
                time
            ])

        return {"status": "success", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving data: {str(e)}")

def list_files():
    try:
        return [f for f in os.listdir(DATA_DIRECTORY) if f.endswith('.csv')]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")

def read_file(filename: str):
    try:
        filepath = os.path.join(DATA_DIRECTORY, filename)
        if not os.path.isfile(filepath):
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
            
        with open(filepath, mode="r", newline='') as file:
            reader = csv.reader(file)
            return list(reader)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
