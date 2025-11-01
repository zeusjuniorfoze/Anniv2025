# Birthday Bot (Junior Edition)

Petit bot d'anniversaire avec un mini chat (frontend) et une API Flask (backend) connectée à Firebase Realtime Database.

## Prérequis
- Python 3.10+
- Un projet Firebase et une clé de compte de service (JSON)

## Configuration
- Place la clé de service (JSON) hors du dépôt si possible.
- Variables d'environnement utiles:
  - `GOOGLE_APPLICATION_CREDENTIALS`: chemin du JSON (par défaut `backend/config/serviceAccountKey.json`)
  - `FIREBASE_DATABASE_URL`: URL RTDB
  - `CELEBRANT`: nom du/de la célébré(e) (par défaut `Junior`)
  - `FLASK_DEBUG`: `1` pour debug, `0` sinon

## Installation backend
```
cd backend
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
# ou
pip install flask firebase-admin
```

## Lancer l'API
```
cd backend
set GOOGLE_APPLICATION_CREDENTIALS=config\serviceAccountKey.json  # Windows
set FIREBASE_DATABASE_URL=https://xxx-default-rtdb.firebaseio.com
set CELEBRANT=Junior
python app.py
```

## Utiliser le frontend
- Ouvre `frontend/index.html` dans le navigateur.
- Optionnel: ajoute `?celebrant=Nom` à l'URL, ex: `index.html?celebrant=Junior`.
- Tape d'abord ton prénom, puis réponds au quiz ou essaye `aide`, `anecdote`, `bougies`, `musique`, `carte`, `rejouer`.

## Sécurité / bonnes pratiques
- Ne commite pas `backend/config/serviceAccountKey.json` (déjà ignoré par `.gitignore`).
- Ne commite pas l'environnement virtuel (`backend/venv/`).
- En prod, désactive le debug (`FLASK_DEBUG=0`).

```
Arborescence:
backend/
  app.py
  requirements.txt
frontend/
  index.html
  js/main.js
  css/style.css
```

