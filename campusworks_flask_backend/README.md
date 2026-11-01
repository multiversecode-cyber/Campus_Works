# CampusWorks Flask API — backend starter

This starter adds a Flask REST API and SQLite persistence alongside the existing React/Vite frontend.

## Setup (PowerShell)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
python seed.py
python run.py
```

If script activation is blocked, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that PowerShell session and activate again.

Check `http://127.0.0.1:5000/health`.

## Demo account

- Email: `demo.faculty@campusworks.local`
- Password: `DemoPassword123!`

For local development only. Change it before any shared deployment. The seed data is explicitly demo data; it does not create fake student applications.

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/users/me`
- `GET /api/opportunities` (optional query: `search`, `type`, `location`)
- `GET /api/opportunities/<id>`
- `POST /api/opportunities` (faculty/club)
- `PATCH /api/opportunities/<id>` (owner/admin)
- `DELETE /api/opportunities/<id>` (owner/admin)
- `POST /api/opportunities/<id>/apply` (student)
- `GET /api/applications/me` (student)
- `GET /api/opportunities/<id>/applications` (owner/admin)
- `PATCH /api/applications/<id>` (owner/admin)
- `GET /api/notifications`
- `PATCH /api/notifications/<id>/read`
- `GET /api/admin/summary` (admin)
- `GET /api/admin/users` (admin)
- `GET /api/admin/opportunities` (admin)

Authenticated requests need `Authorization: Bearer <accessToken>`.

## Integration status

This backend is not yet connected to the React UI. The frontend currently imports arrays from `src/data.js`, and login/register only changes local React state. The next milestone is adding a frontend API client and updating React components to call these endpoints.

## Security and limitations

Passwords are hashed; protected endpoints use JWT authentication, role checks and ownership checks. Public registration cannot create admin accounts. Before production, use strong secrets, HTTPS, database migrations, rate limiting, audit logging, and production-grade secret management. Hard-coded dashboard totals and sample applicant cards in the current frontend remain static until those components are integrated.
