import sqlite3
conn = sqlite3.connect('campus_intelligence.db')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cur.fetchall()
print('Tables:', tables)
conn.close()
