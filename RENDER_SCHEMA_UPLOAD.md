# Render PostgreSQL Schema Upload - Manual Instructions

## Option 1: Use Render's Web Query Tool (Easiest)

1. Go to https://dashboard.render.com
2. Click on your PostgreSQL database: `aluminidb_9z47`
3. Scroll down to "Query Editor" or "Web Query Tool"
4. Copy the entire schema from [database_schema_postgres.sql](../database/database_schema_postgres.sql)
5. Paste it into the query editor
6. Click "Run" or "Execute"
7. Wait for completion ✅

## Option 2: Use psql Command Line

```bash
# From your terminal (requires psql installed)
psql postgresql://aluminidb_9z47_user:25SmqZ6xAzaA3WmXqAnNshUsZeiTn0KZ@dpg-d5h1rdmr433s73bf3e30-a.singapore-postgres.render.com/aluminidb_9z47 < database/database_schema_postgres.sql
```

## Option 3: Wait for Database to Fully Start, Then Use Python Script

The database might still be initializing. Wait 5-10 minutes and run:

```powershell
cd D:\ProjectsGit\v3\AluminiV2\backend
python upload_schema.py
```

## Verify Schema is Created

Once uploaded, run this command to verify tables:

```powershell
python -c "
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()
cur.execute('SELECT table_name FROM information_schema.tables WHERE table_schema=\"public\" ORDER BY table_name')
print('\\n✅ Tables created:')
for (table,) in cur.fetchall():
    print(f'  • {table}')
cur.close()
conn.close()
"
```

---

**Current Status:**
- ✅ Connection string configured correctly
- ⏳ Database might still be provisioning (can take 5-10 mins on free tier)
- 📝 Schema SQL file ready at: `database/database_schema_postgres.sql`

**Next Step:**
Use **Option 1** (Web Query Tool) for fastest results!
