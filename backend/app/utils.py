import os

def get_monthly_file_name(timestamp):
    month_start = timestamp.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return os.path.join("csv_files", f"bus_data_month_{month_start.strftime('%Y-%m')}.csv")
