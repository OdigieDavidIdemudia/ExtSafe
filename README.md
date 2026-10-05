# 🛡️ ExtSafe — Browser Extension Safety Auditor

A web platform for auditing browser extensions: scrape extension metadata/risk
signals, review results, and export findings to Excel.

🔗 **Deployed on:** Vercel

---

## 🏗️ Structure

```
ExtSafe/
├── api/                # FastAPI serverless backend
│   ├── main.py         # /analyze-style endpoints, CORS
│   └── services/
│       └── scraper.py  # Extension info fetcher + Excel export
├── src/                # React + TypeScript (Vite) frontend
├── public/             # Static assets
└── Design/             # Product & deployment standards (JSON)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, Pydantic |
| Frontend | React, TypeScript, Vite |
| Export | openpyxl / Excel |
| Hosting | Vercel (serverless API) |

---

## 🚀 Getting Started

```bash
# Backend (requires: fastapi, uvicorn, requests, beautifulsoup4, openpyxl)
pip install fastapi uvicorn requests beautifulsoup4 openpyxl
cd api && uvicorn main:app --reload

# Frontend
npm install
npm run dev
```

---

## 📡 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/check` | Fetch extension info for a list of extensions |
| POST | `/api/export` | Export analysis results to Excel |

---

## 📄 License

Proprietary — internal use.
