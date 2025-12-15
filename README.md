## Frontend (Chrome Extension)

1. Open Chrome and go to:


2. Enable **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select the frontend folder that contains `manifest.json`.
5. The extension will load immediately.

---

## Backend (Django)

1. Install dependencies:
```bash
pip install -r requirements.txt
python3.11 -m venv venv
source venv/bin/activate
python manage.py runserver
