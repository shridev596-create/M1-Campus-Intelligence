import sqlite3
conn = sqlite3.connect('campus_intelligence.db')
cur = conn.cursor()

# Wipe all complaint data, clusters and logs - fresh clean start
cur.execute("DELETE FROM complaint_logs")
cur.execute("DELETE FROM complaints")
cur.execute("DELETE FROM complaint_clusters")

conn.commit()

cur.execute("SELECT COUNT(*) FROM complaints")
print("Complaints remaining:", cur.fetchone()[0])
cur.execute("SELECT COUNT(*) FROM complaint_clusters")
print("Clusters remaining:", cur.fetchone()[0])
cur.execute("SELECT COUNT(*) FROM complaint_logs")
print("Logs remaining:", cur.fetchone()[0])

conn.close()
print("Database wiped clean. Ready for real student complaints only.")
