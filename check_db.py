import sqlite3
import os

paths = [
  os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db'),
  os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'Tapowan Public School System', 'school.db'),
  os.path.join(os.path.expanduser('~'), 'Desktop', 'My Project', 'Slip & Receipt', 'All fixed', 'TapowanPublicSchool-fixed', 'server', 'school.db')
]

for p in paths:
    if os.path.exists(p):
        print("Found DB:", p)
        conn = sqlite3.connect(p)
        print("Tables:", conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall())
        conn.close()
