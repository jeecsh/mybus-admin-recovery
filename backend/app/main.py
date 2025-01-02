# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.csv_handler import BusData, save_to_csv, list_files, read_file
from app.visualization_handler import generate_data, DataRequest  # Import DataRequest here

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

@app.post("/generate-data")
async def generate_data_route(data: DataRequest):
    return await generate_data(data)

# Allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
