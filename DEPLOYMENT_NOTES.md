# Deployment Notes

## Port Binding & Startup
- The server binds to `0.0.0.0` and the port specified by the `PORT` environment variable.
- **Heavy Operations:** ML model loading (sklearn, sentence-transformers, faiss) has been moved to **lazy loading**. These libraries are only imported and initialized when the specific endpoints requiring them are hit (e.g., generating embeddings or training models). This ensures the server starts up instantly (< 5 seconds) and passes health checks.
- **Root Endpoint:** `GET /api/` (or `GET /` depending on router prefix) is lightweight and serves as a health check.

## Wake-up Bot
A GitHub Actions workflow has been added at `.github/workflows/wakeup.yml`.
- **Purpose:** Pings the server every 10 minutes to prevent the free tier from sleeping.
- **Configuration:** You MUST update the URL in `.github/workflows/wakeup.yml` to your actual deployed URL (currently set to `https://alumunity-v3.onrender.com/api/` as a placeholder).

## Verification
- **AI Setup:** Run `python verify_ai_setup.py` to confirm dependencies.
- **Skill Graph:** Run `python backend/scripts/build_skill_graph_ai.py` to populate initial data (runs in light mode by default).

## Deploy Command
The `Procfile` uses:
```bash
web: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
```
This is the correct command for Render/Railway/Heroku.
