# main.py
from fastapi import FastAPI
from app.csv_handler import BusData, save_to_csv, list_files, read_file

app = FastAPI()

@app.post("/receive-data")
async def receive_data(bus_data: BusData):
    save_to_csv(bus_data)
    return {"status": "success", "message": "Data saved successfully"}

@app.get("/list-files")
def list_available_files():
    files = list_files()
    return {"files": files}

@app.get("/read-file/{filename}")
def get_file_content(filename: str):
    content = read_file(filename)
    return {"data": content}