import json
import sqlite3

# Load JSON data
with open('specs.js', 'r') as file:
    data = json.load(file)

# Initialize SQLite database connection
conn = sqlite3.connect('specs.db')
cursor = conn.cursor()

for section in data['sections']:
    print(section)
    exit()