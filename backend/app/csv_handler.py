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
        if filename is None:
            filename = datetime.now().strftime("%Y-%m-%d") + ".csv"
        filepath = os.path.join(DATA_DIRECTORY, filename)

        # Check if file exists to determine if we need to write headers
        file_exists = os.path.exists(filepath)

        # Extract date and time from current_time string
        current_time = bus_data.estimated_time  # Replace with actual 'current_time' if necessary
        date_time_obj = datetime.strptime(current_time, "%Y-%m-%d %H:%M:%S")
        date = date_time_obj.strftime("%Y-%m-%d")
        time = date_time_obj.strftime("%H:%M:%S")

        # Update the BusData with the extracted date and time
        bus_data.date = date
        bus_data.time = time

        with open(filepath, mode="a", newline='') as file:
            writer = csv.writer(file)
            
            # Write headers only if file is new
            if not file_exists:
                writer.writerow([
                    'Bus ID',
                    'Current Stop',
                    'Next Stop',
                    'Latitude',
                    'Longitude',
                    'Passengers',
                    'Estimated Time',
                    'Date',
                    'Time'
                ])
            
            # Write the data row
            writer.writerow([
                bus_data.bus_id,
                bus_data.current_stop,
                bus_data.next_stop,
                bus_data.latitude,
                bus_data.longitude,
                bus_data.passengers,
                bus_data.estimated_time,
                bus_data.date,
                bus_data.time
            ])

        return True

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
