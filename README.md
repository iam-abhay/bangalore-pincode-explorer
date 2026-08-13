# Bangalore Pincode Explorer

A polished full-stack assignment project for exploring **Bangalore/Bengaluru PIN codes and area names**.

> Built as a focused 2–3 hour full-stack exercise, with a production-minded structure, API validation, responsive UI, Docker support, deployment configuration, and clear documentation.

## Live demo

After deployment, add the URL here:

- **Frontend:** `https://YOUR-FRONTEND-URL`
- **API:** `https://YOUR-API-URL`

## Repository

[https://github.com/iam-abhay/bangalore-pincode-explorer](https://github.com/iam-abhay/bangalore-pincode-explorer)

## Features

### User-facing
- Search by **6-digit PIN code**
- Search by **area/locality**
- Debounced area search
- Popular/sample searches
- Sort results by area or PIN
- Pagination
- Result count
- Copy PIN to clipboard
- Open location in Google Maps
- Recent searches stored locally
- Responsive desktop/mobile UI
- Loading, empty, and error states

### Backend
- Node.js + Express REST API
- Query validation
- CORS
- Health endpoint
- Pagination
- Search/sort controls
- Centralized error handling
- Static JSON data layer that can be replaced by PostgreSQL later

### Engineering
- Dockerfile for backend
- Docker Compose for local development
- Render deployment config
- Vercel frontend config
- Environment variables
- API documentation
- Automated smoke-test script
- No API key required for the demo

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Data | JSON seed dataset |
| Styling | CSS |
| Deployment | Vercel + Render |
| Containers | Docker + Docker Compose |

## Data source

The dataset is a curated Bangalore area/pincode dataset used for the assignment UI. The repository keeps the data local so the demo remains deterministic and does not depend on a third-party API.

For production postal verification, use the Department of Posts / Government of India data sources. India Post provides a pincode directory and a post-office locator. The Government Open Data platform also publishes the All India Pincode Directory.

Official references:
- https://www.indiapost.gov.in/rti/pincodelist
- https://www.indiapost.gov.in/locate-postoffice
- https://www.data.gov.in/resource/all-india-pincode-directory-till-last-month

## Project structure

```text
bangalore-pincode-explorer/
├── backend/
│   ├── data/
│   │   └── bangalore-pincodes.json
│   ├── src/
│   │   └── server.js
│   ├── tests/
│   │   └── smoke-test.mjs
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── docker-compose.yml
├── render.yaml
├── vercel.json
├── .gitignore
└── README.md
```

## Run locally

### Backend

```bash
cd backend
npm install
npm run dev
```

API:

`http://localhost:5000`

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

`http://localhost:5173`

## API

### Health

```http
GET /api/health
```

### Search

```http
GET /api/pincodes?pincode=560001
GET /api/pincodes?area=Koramangala
GET /api/pincodes?query=Whitefield
```

Optional parameters:

```text
page=1
limit=12
sort=area
order=asc
```

Example:

```http
GET /api/pincodes?area=park&page=1&limit=12&sort=area&order=asc
```

Response shape:

```json
{
  "count": 1,
  "page": 1,
  "limit": 12,
  "totalPages": 1,
  "data": [
    {
      "area": "Koramangala",
      "pincode": "560034",
      "latitude": 12.9317,
      "longitude": 77.6227,
      "district": "Bengaluru Urban",
      "state": "Karnataka"
    }
  ]
}
```

## Docker

Run the complete app with:

```bash
docker compose up --build
```

The backend is exposed on port `5000`.

## Deployment

### Backend — Render

1. Push the repository to GitHub.
2. Create a new Web Service on Render.
3. Use the repository.
4. Set root directory to `backend`.
5. Build command:

```bash
npm install
```

6. Start command:

```bash
npm start
```

7. Add:

```text
NODE_ENV=production
```

The included `render.yaml` can also be used as a starting point.

### Frontend — Vercel

1. Import the GitHub repository.
2. Set root directory to `frontend`.
3. Build command:

```bash
npm run build
```

4. Output directory:

```text
dist
```

5. Add:

```text
VITE_API_URL=https://YOUR-RENDER-API-URL/api
```

6. Deploy.

The included `vercel.json` handles SPA fallback routing.

## Testing

Run the backend:

```bash
cd backend
npm install
npm start
```

Then in another terminal:

```bash
node tests/smoke-test.mjs
```

The smoke test checks:
- health endpoint
- PIN search
- area search
- invalid PIN validation

## Design decisions

### Why JSON instead of PostgreSQL?

The assignment explicitly targets a 2–3 hour implementation. A JSON data layer keeps the project easy to run and review while preserving a clean REST API boundary. Moving to PostgreSQL only requires replacing the repository/data access layer.

### Why server-side search?

Search and pagination are handled by the backend so the API demonstrates real full-stack behavior rather than simply shipping the entire dataset to the browser.

### Why Google Maps links instead of an embedded map?

An embedded map normally requires an API key or a mapping SDK. A Maps search link provides useful location context without adding credentials or deployment complexity.

## Future improvements

- PostgreSQL + Prisma
- Admin data management
- Official monthly dataset ingestion
- Full India search
- Authentication
- Rate limiting
- API caching
- OpenAPI/Swagger documentation
- Automated CI/CD
- MapLibre/Leaflet map view
- Test suite with Vitest/Supertest

## Assignment submission checklist

- [ ] GitHub repository is public
- [ ] README is present
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] PIN search works
- [ ] Area search works
- [ ] Invalid input is handled
- [ ] Empty state is handled
- [ ] Mobile layout checked
- [ ] Production API URL added to Vercel
- [ ] Live frontend URL added to README
- [ ] Live API URL added to README
