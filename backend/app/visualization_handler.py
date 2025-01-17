from pydantic import BaseModel
import pandas as pd
import io
from datetime import datetime
import json

class DataRequest(BaseModel):
    file: str  # CSV data as a string
    dateFilter: dict
    timeFilter: dict
    selectedDataToVisualize: dict
    selectedChartTypes: dict

def normalize_station_name(name):
    """Normalize station names by removing extra spaces and converting to lowercase"""
    return name.strip().lower()

# Updated stations list with normalized names and common variants
stations = [
    {"name": "Anıt", "variants": ["anit", "anıt", "anît"], "loc": {"latitude": 35.1221121, "longitude": 33.9367454}},
    {"name": "Registration", "variants": ["registration", "reg"], "loc": {"latitude": 35.1423563, "longitude": 33.9095623}},
    {"name": "Mahkeme", "variants": ["mahkeme"], "loc": {"latitude": 35.1168732, "longitude": 33.943972}},
    {"name": "Kaliland", "variants": ["kaliland", "kali land"], "loc": {"latitude": 35.1307779, "longitude": 33.9181349}},
    {"name": "Harika Mahallesi", "variants": ["harika", "harika mah"], "loc": {"latitude": 35.1006281, "longitude": 33.9453198}},
    {"name": "Harbour", "variants": ["harbour", "liman"], "loc": {"latitude": 35.1219237, "longitude": 33.947304}},
    {"name": "Main Gate", "variants": ["main gate", "ana kapı"], "loc": {"latitude": 35.1421206, "longitude": 33.9134012}},
    {"name": "Kurtalan", "variants": ["kurtalan"], "loc": {"latitude": 35.0955934, "longitude": 33.9346812}},
    {"name": "Maksim", "variants": ["maksim"], "loc": {"latitude": 35.1006281, "longitude": 33.9453198}},
    {"name": "Civil", "variants": ["civil", "sivil"], "loc": {"latitude": 35.1452446, "longitude": 33.9094298}},
    {"name": "Gazimağusa Vergi Dairesi", "variants": ["vergi", "vergi dairesi"], "loc": {"latitude": 35.1222896, "longitude": 33.9485728}},
    {"name": "Gazi", "variants": ["gazi"], "loc": {"latitude": 35.1277599, "longitude": 33.9224228}},
    {"name": "NKL", "variants": ["nkl"], "loc": {"latitude": 35.1193872, "longitude": 33.9415275}},
    {"name": "Activity Center", "variants": ["activity", "activity center"], "loc": {"latitude": 35.1414035, "longitude": 33.9129289}},
    {"name": "Baykal", "variants": ["baykal"], "loc": {"latitude": 35.1206592, "longitude": 33.9361933}},
    {"name": "Intercity Bus Station", "variants": ["intercity", "bus station"], "loc": {"latitude": 35.1226413, "longitude": 33.9320308}},
    {"name": "M/Sa Arena Durağı", "variants": ["arena", "m/sa arena"], "loc": {"latitude": 35.1321075, "longitude": 33.9229207}},
    {"name": "Dumlupınar", "variants": ["dumlupinar", "dumlupınar"], "loc": {"latitude": 35.1268975, "longitude": 33.9319466}},
    {"name": "Sanayi", "variants": ["sanayi"], "loc": {"latitude": 35.126178, "longitude": 33.9251674}},
    {"name": "Canbulat", "variants": ["canbulat"], "loc": {"latitude": 35.1122602, "longitude": 33.9454177}},
    {"name": "Library", "variants": ["library", "kütüphane"], "loc": {"latitude": 35.1407914, "longitude": 33.9116762}},
    {"name": "Çimen Sokak", "variants": ["çimen", "cimen sokak"], "loc": {"latitude": 35.0975237, "longitude": 33.9425102}},
    {"name": "Uni Bus Station", "variants": ["uni bus", "university bus"], "loc": {"latitude": 35.141695, "longitude": 33.907058}},
    {"name": "Yeni İzmir", "variants": ["yeni izmir", "izmir"], "loc": {"latitude": 35.1291494, "longitude": 33.9296027}},
    {"name": "Tarlabaşı", "variants": ["tarlabasi", "tarlabaşı"], "loc": {"latitude": 35.0985327, "longitude": 33.9443814}},
]

def find_station_info(station_name, stations_list):
    """Find station information using normalized name and variants"""
    normalized_name = normalize_station_name(station_name)
    
    # Try exact match first
    for station in stations_list:
        if normalized_name == normalize_station_name(station['name']):
            return station
        
        # Try variants
        if normalized_name in [normalize_station_name(v) for v in station['variants']]:
            return station
    
    return None

async def generate_data(data: DataRequest):
    csv_data = data.file
    df = pd.read_csv(io.StringIO(csv_data))

    # Print unique stations in the data for debugging

    # Combine Date and Time columns into a datetime column
    df['DateTime'] = pd.to_datetime(df['Date'] + ' ' + df['Time'], errors='coerce')

    def parse_datetime(date_str, time_str="12:00 AM"):
        try:
            return pd.to_datetime(f"{date_str} {time_str}", errors='coerce')
        except ValueError:
            return None

    # Apply date and time filters if present
    if data.dateFilter.get('start'):
        start_datetime = parse_datetime(data.dateFilter['start'], "12:00 AM")
        if start_datetime is not None:
            df = df[df['DateTime'] >= start_datetime]

    if data.dateFilter.get('end'):
        end_datetime = parse_datetime(data.dateFilter['end'], "11:59 PM")
        if end_datetime is not None:
            df = df[df['DateTime'] <= end_datetime]

    if data.timeFilter.get('start'):
        time_start = parse_datetime('01/01/2025', data.timeFilter['start'])
        if time_start is not None:
            df = df[df['DateTime'].dt.time >= time_start.time()]

    if data.timeFilter.get('end'):
        time_end = parse_datetime('01/01/2025', data.timeFilter['end'])
        if time_end is not None:
            df = df[df['DateTime'].dt.time <= time_end.time()]

    charts = {}
    if data.selectedDataToVisualize.get("estimatedVsActual"):
        try:
            # Sort the DataFrame by bus ID and DateTime
            df = df.sort_values(by=['bus ID', 'DateTime'])

            # Initialize data structures for visualization
            time_comparison_data = {
                "scatter": [],
                "line": []
            }

            # Temporary dictionary to store data for averaging
            aggregated_data = {}

            # Iterate through the DataFrame to calculate actual travel times
            for i in range(1, len(df)):
                current_row = df.iloc[i - 1]
                next_row = df.iloc[i]

                # Ensure the rows are part of the same route and correctly ordered
                if current_row['bus ID'] == next_row['bus ID'] and current_row['Next Stop'] == next_row['Current Stop']:
                    # Calculate actual travel time in minutes
                    actual_time = (next_row['DateTime'] - current_row['DateTime']).total_seconds() / 60

                    # Convert estimated time to minutes
                    estimated_time = pd.to_timedelta(current_row['Estimated Time']).total_seconds() / 60

                    # Define the stop pair name
                    stop_name = f"{current_row['Current Stop']} to {current_row['Next Stop']}"

                    # Aggregate data for the same stop pair
                    if stop_name not in aggregated_data:
                        aggregated_data[stop_name] = {
                            "estimated_times": [],
                            "actual_times": []
                        }

                    # Add the times to the respective lists
                    aggregated_data[stop_name]["estimated_times"].append(estimated_time)
                    aggregated_data[stop_name]["actual_times"].append(actual_time)

            # After collecting all data, calculate the averages for each stop pair
            for stop_name, times in aggregated_data.items():
                average_estimated_time = round(sum(times["estimated_times"]) / len(times["estimated_times"]), 2)
                average_actual_time = round(sum(times["actual_times"]) / len(times["actual_times"]), 2)

                # Prepare aggregated data for scatter plot
                time_comparison_data["scatter"].append({
                    "stop": stop_name,
                    "estimated_time": average_estimated_time,
                    "actual_time": average_actual_time
                })

                # Use the stop pair name as the x-axis label for the line graph
                time_comparison_data["line"].append({
                    "x": stop_name,  # Use the stop pair name as x-axis
                    "estimated_time": average_estimated_time,
                    "actual_time": average_actual_time
                })

            # Create chart data for visualization
            charts["estimatedVsActual"] = {
                "processName": "Estimated vs. Actual Time Accuracy",
                "data": time_comparison_data
            }

            # Debugging: Print aggregated data
            print("Aggregated Data:")
            print(aggregated_data)

        except Exception as e:
            print(f"Error processing estimated vs. actual time: {str(e)}")
    # Processing for most crowded station
    if data.selectedDataToVisualize.get("mostCrowdedStation"):
        try:
            df = df.sort_values(by=['bus ID', 'DateTime'])
            boarding_passengers = {}
            processed_stations = set()

            # Track unmatched stations
            unmatched_stations = set()

            for i in range(1, len(df)):
                current_row = df.iloc[i - 1]
                next_row = df.iloc[i]

                if current_row['bus ID'] == next_row['bus ID'] and current_row['Next Stop'] == next_row['Current Stop']:
                    passengers_boarded = next_row['Passengers'] - current_row['Passengers']

                    if passengers_boarded > 0:
                        station_name = current_row['Current Stop']
                        station_info = find_station_info(station_name, stations)

                        if station_info:
                            canonical_name = station_info['name']
                            boarding_passengers[canonical_name] = boarding_passengers.get(canonical_name, 0) + passengers_boarded
                            processed_stations.add(canonical_name)
                        else:
                            unmatched_stations.add(station_name)

            # Create the heatmap data
            heatmap_data = []
            for station_name, intensity in boarding_passengers.items():
                station_info = find_station_info(station_name, stations)
                if station_info:
                    heatmap_data.append({
                        "station_name": station_name,
                        "latitude": station_info['loc']['latitude'],
                        "longitude": station_info['loc']['longitude'],
                        "intensity": int(intensity)
                    })

            charts["mostCrowdedStation"] = {
                "processName": "Heatmap for Most Crowded Station",
                "data": heatmap_data
            }
        except Exception as e:
            print(f"Error processing most crowded station: {str(e)}")

            
        if data.selectedDataToVisualize.get("passengerCountPerRouteByDay"):
            try:
                # Ensure Date and bus ID are defined
                df['Date'] = pd.to_datetime(df['Date'])  # Convert 'Date' to datetime if not already
                df['DayOfWeek'] = df['Date'].dt.day_name()  # Extract day of the week (e.g., Monday, Tuesday)

                # Group by bus ID and DayOfWeek, calculating the average passengers
                route_day_df = df.groupby(['bus ID', 'DayOfWeek'])['Passengers'].mean().unstack(fill_value=0)

                # Prepare data for stacked bar chart
                charts["passengerCountPerRouteByDay"] = {
                    "processName": "Passenger Count per Route by Day of Week",
                    "data": {
                        'stackedBar': route_day_df.astype(int).to_dict(),
                    }
                }

                # Prepare data for heatmap
                heatmap_data = route_day_df.astype(int).reset_index().melt(id_vars='bus ID', var_name='DayOfWeek', value_name='Passengers')
                charts["passengerCountPerRouteByDay"]["heatmap"] = heatmap_data.to_dict(orient='records')

                print(charts)  # Debugging: Print the charts data

            except Exception as e:
                print(f"Error processing passenger count per route by day of week: {str(e)}")
    # Processing route popularity
    if data.selectedDataToVisualize.get("routePopularity"):
        try:
            route_popularity = df.groupby('bus ID')['Passengers'].sum().sort_values(ascending=False)
            charts['routePopularity'] = {
                "processName": "Route Popularity Analysis",
                "data": {
                    'bar': route_popularity.astype(int).to_dict(),
                    'line': route_popularity.astype(int).to_dict()
                }
            }
        except Exception as e:
            print(f"Error processing route popularity: {str(e)}")

    # Processing most crowded time
    if data.selectedDataToVisualize.get("mostCrowdedTime"):
        try:
            df['Hour'] = df['DateTime'].dt.hour
            crowded_time = df.groupby('Hour')['Passengers'].sum().sort_values(ascending=False)
            charts['mostCrowdedTime'] = {
                "processName": "Most Crowded Time Analysis",
                "data": {
                    'bar': crowded_time.astype(int).to_dict(),
                    'line': crowded_time.astype(int).to_dict()
                }
            }
        except Exception as e:
            print(f"Error processing most crowded time: {str(e)}")

    return {"charts": charts}
