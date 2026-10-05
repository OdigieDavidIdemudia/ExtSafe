import requests
from bs4 import BeautifulSoup
from openpyxl import Workbook
import os
import re
import urllib.parse
import tempfile

OUTPUT_FILE = os.path.join(tempfile.gettempdir(), "extension_results.xlsx")

def resolve_extension_id(query):
    query = query.strip()
    if re.match(r'^[a-z]{32}$', query):
        return query
    
    # Otherwise, it's a search term, hit Chrome Web Store
    search_url = f"https://chromewebstore.google.com/search/{urllib.parse.quote(query)}"
    try:
        res = requests.get(search_url, timeout=10)
        if res.status_code == 200:
            ids = re.findall(r'detail/[^/]+/([a-z]{32})', res.text)
            if ids:
                return ids[0] # Return the first matching ID
    except Exception:
        pass
    
    return query # Fallback to returning the original query if not found

def fetch_extension_info(ext_id_or_name):
    ext_id = resolve_extension_id(ext_id_or_name)
    url = f"https://extpose.com/ext/{ext_id}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return {"id": ext_id, "name": "Not Found", "desc": "", "risk": "Unknown", "url": url}
        soup = BeautifulSoup(response.text, "html.parser")
        # Name
        name_tag = soup.find("h1")
        name = name_tag.text.strip() if name_tag else "N/A"
        # Description
        desc_tag = soup.find("meta", {"name": "description"})
        desc = desc_tag["content"] if desc_tag else "N/A"
        # Basic risk scoring
        risk = "Low"
        keywords = ["adware", "malware", "suspicious", "tracking", "inject", "spy"]
        if any(k in desc.lower() for k in keywords):
            risk = "High"
        return {
            "id": ext_id,
            "name": name,
            "desc": desc,
            "risk": risk,
            "url": url
        }
    except Exception as e:
        return {"id": ext_id, "name": "Error", "desc": str(e), "risk": "Unknown", "url": url}

def export_to_excel(results):
    wb = Workbook()
    ws = wb.active
    ws.title = "Extension Intel"
    headers = ["Extension ID", "Name", "Description", "Risk", "Source URL"]
    ws.append(headers)
    for r in results:
        ws.append([r["id"], r["name"], r["desc"], r["risk"], r["url"]])
    wb.save(OUTPUT_FILE)
    return OUTPUT_FILE
