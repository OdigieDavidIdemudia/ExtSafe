from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import sys

# Ensure Vercel serverless can find the services folder
sys.path.append(os.path.dirname(__file__))
from services.scraper import fetch_extension_info, export_to_excel

app = FastAPI(title="ExtSafe API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExtensionRequest(BaseModel):
    extensions: List[str]

from fastapi.responses import FileResponse

@app.post("/api/check")
def check_extensions(request: ExtensionRequest):
    results = []
    for ext_id in request.extensions:
        if ext_id.strip():
            info = fetch_extension_info(ext_id.strip())
            results.append(info)
    
    return {"status": "success", "data": results}

class ExportRequest(BaseModel):
    results: List[dict]

@app.post("/api/export")
def export_results(request: ExportRequest):
    filepath = export_to_excel(request.results)
    return FileResponse(filepath, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename="extension_results.xlsx")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
