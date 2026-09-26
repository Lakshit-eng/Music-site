# Spellze — Music Producer Portfolio & CMS

A full MERN-stack website for Spellze, a music producer / mixing & mastering
engineer. Public site to browse and play music, plus a password-protected
`/admin` panel to manage the song catalog.

**Stack:** React (Vite) + Node.js/Express + MongoDB + JWT auth + local file
uploads (swappable for Cloudinary/S3 later).

---

## 1. Requirements

- [Node.js](https://nodejs.org/) v18 or newer (v20+ recommended)
- npm (comes with Node)
- A MongoDB database — either:
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally, or
  - A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (easiest if you don't want to install anything)

---

## 2. Project structure

```
spellze/
├── client/                # React frontend (Vite)
│   └── src/
│       ├── components/    # Reusable UI pieces (Navbar, SongCard, AudioPlayer...)
│       ├── pages/         # One file per route/page (Home, Produced, AdminDashboard...)
│       ├── services/      # api.js — the ONLY place that talks to the backend
│       ├── context/       # AuthContext (admin login state), AudioContext (single-play audio)
│       └── styles/        # Plain CSS, one file per component/page
│
└── server/                # Express backend
    ├── models/            # MongoDB schemas (Song.js, Admin.js)
    ├── routes/            # Express route definitions (URLs -> controller functions)
    ├── controllers/       # Request/response handling
    ├── services/          # Database queries (songService.js) and file storage (fileService.js)
    ├── middleware/         # auth.js (JWT check), upload.js (multer), errorHandler.js
    ├── seed/              # createAdmin.js - script to create your first admin login
    └── uploads/           # Uploaded audio files and posters are stored here
```

**Where things live:**
- Frontend code → `client/src`
- Backend code → `server`
- Database model → `server/models/Song.js` and `server/models/Admin.js`
- API routes → `server/routes`
- Admin-only logic → `server/middleware/auth.js` (backend) and `client/src/pages/AdminDashboard.jsx` + `AdminLogin.jsx` (frontend)
- Styling → `client/src/styles`

---

## 3. Installing dependencies

Open a terminal in the project root, then install each half separately:

```bash
cd server
npm install

cd ../client
npm install
```

---

## 4. Creating a MongoDB database

**Option A — MongoDB Atlas (no local install needed):**
1. Create a free cluster at https://www.mongodb.com/atlas
2. Create a database user (username + password)
3. Under "Network Access", allow your current IP (or `0.0.0.0/0` for easy local dev)
4. Click "Connect" → "Drivers" and copy the connection string, e.g.
   `mongodb+srv://myuser:mypassword@cluster0.xxxx.mongodb.net/spellze`

**Option B — Local MongoDB:**
1. Install and start MongoDB Community Server
2. Your connection string is simply: `mongodb://127.0.0.1:27017/spellze`

You don't need to manually create collections — Mongoose creates them
automatically the first time you save data.

---

## 5. Creating your `.env` files

**Backend** — copy the example and fill it in:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```
MONGODB_URI=your-connection-string-here
JWT_SECRET=some-long-random-string
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

Generate a random `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**Frontend** — only needed for production deploys; local dev works without it
(Vite proxies API calls automatically). If you want it anyway:

```bash
cd client
cp .env.example .env
```

---

## 6. Starting the backend

```bash
cd server
npm run dev
```

You should see `MongoDB connected` and `Spellze API running on http://localhost:5000`.

---

## 7. Starting the frontend

In a **second terminal**:

```bash
cd client
npm run dev
```

Open http://localhost:5173 — you should see the Spellze homepage.

---

## 8. Creating your first admin user

The admin panel has no public sign-up (for security). Create your login
from the terminal instead:

```bash
cd server
node seed/createAdmin.js youremail@example.com yourStrongPassword
```

You'll see a confirmation once it's created.

---

## 9. Logging into admin

Go to **http://localhost:5173/admin/login** and log in with the email/password
you just created. You'll land on the admin dashboard at `/admin`.

---

## 10. Adding songs

In the admin dashboard:
1. Choose the **Produced** or **Mixed & Mastered** tab
2. Click **+ Add Song**
3. Fill in title, artist, description (optional)
4. Choose an audio file and, optionally, a poster image
5. Check **Published** if you want it visible on the public site right away
6. Check **Featured** if you want it to appear in "Top Tracks" on the home page
7. Click **Add Song**

## 11. Uploading audio/posters

Uploads happen right inside the Add/Edit Song form. Files are saved to
`server/uploads/audio` and `server/uploads/posters`. When editing a song,
leave the file inputs empty to keep the existing files, or choose a new
file to replace them (the old file is only deleted after the new one
uploads successfully, so you never end up with a broken record).

## 12. Publishing songs

A song only appears on the public site if **Published** is checked. You can
toggle this any time from the admin table by clicking the "Draft/Published"
pill next to a song — no need to open the edit form.

## 13. Selecting featured songs

Click the "Featured / Not Featured" pill in the admin table for any
published song. Featured + published songs appear in the "Top Tracks"
section on the home page, in the order set by step 14.

## 14. Reordering songs

Use the **↑ / ↓** buttons in the admin table's "Order" column. This swaps
the song's position with its neighbor and saves immediately to MongoDB —
order is never just a frontend trick, so it stays consistent everywhere.

## 15. How pagination works

The **Produced** and **Mixed & Mastered** pages never load the whole
catalog at once. The frontend calls:

```
GET /api/songs?category=produced&page=1&limit=8
```

The backend returns only that page's songs plus `currentPage` / `totalPages`,
and the **Previous / Next** buttons just change the `page` value and refetch.
This means the site stays fast even with hundreds of songs.

## 16. How the frontend talks to the backend

Every API call in the frontend goes through **one file**:
`client/src/services/api.js`. No component calls `fetch`/`axios` directly.
In development, Vite's dev server proxies `/api/*` and `/uploads/*`
requests to `http://localhost:5000` (see `client/vite.config.js`), so you
never have to worry about CORS locally.

---

## 17. How to deploy

A simple approach:

1. **Backend**: Deploy the `server` folder to a Node host (Render, Railway,
   Fly.io, a VPS, etc). Set the same environment variables as your local
   `.env` (use your production MongoDB URI and a fresh `JWT_SECRET`). Make
   sure `CLIENT_URL` matches your deployed frontend's URL.
2. **Frontend**: Run `npm run build` inside `client` — this produces a
   `client/dist` folder of static files. Deploy that folder to any static
   host (Vercel, Netlify, Cloudflare Pages, or your backend server itself
   via `express.static`). Set `VITE_API_URL` (in `client/.env` before
   building) to your backend's public URL.
3. Make sure your backend's `uploads` folder persists between deploys —
   most simple hosts wipe the filesystem on redeploy, which is exactly why
   step 19 below explains how to move to Cloudinary/S3 for production.

## 18. Connecting a custom domain (e.g. spellze.in)

1. Point your domain's DNS to wherever you deployed the frontend
   (most static hosts give you a CNAME or A record to add).
2. If your backend is on a different host, use a subdomain like
   `api.spellze.in` for it, and update `CLIENT_URL` (backend) and
   `VITE_API_URL` (frontend) to match.
3. Most hosts (Vercel, Netlify, Render, etc.) issue free HTTPS certificates
   automatically once the domain is connected.

## 19. Moving file storage from local uploads to Cloudinary/S3

Right now, uploaded files are handled in exactly **one file**:
`server/services/fileService.js`. It has two functions:

- `getPublicUrlForUploadedFile(file)` — turns an uploaded file into a URL
- `deleteFileByUrl(url)` — deletes a file given its URL

When you're ready to move to Cloudinary or S3:
1. Install the relevant SDK (e.g. `cloudinary` or `@aws-sdk/client-s3`)
2. Rewrite the two functions above to upload/delete from that service
   instead of the local disk
3. You may also want to change `server/middleware/upload.js` to use
   `multer.memoryStorage()` instead of `diskStorage` so files go straight
   to memory before being forwarded to the cloud service

Because every other file (controllers, frontend) only ever deals with a
plain URL string, **nothing else in the app needs to change**.

---

## Adding new fields later (bpm, slug, price, credits, releaseDate, etc.)

The `Song` model (`server/models/Song.js`) has a comment explaining this,
but in short: add the field to the schema, then to the admin `SongForm.jsx`
component, then display it wherever you want it shown. The rest of the
app already passes song objects around generically, so this doesn't
require a rewrite.

---

## API reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Log in, returns a JWT |
| GET | `/api/auth/me` | Admin | Check current session |
| GET | `/api/songs?category=&page=&limit=` | — | Paginated published songs |
| GET | `/api/songs/featured?limit=` | — | Published + featured songs |
| GET | `/api/songs/:id` | — | A single published song |
| GET | `/api/songs/admin/all?category=` | Admin | All songs (incl. drafts) |
| POST | `/api/songs` | Admin | Create a song (multipart form) |
| PUT | `/api/songs/:id` | Admin | Update a song (multipart form) |
| DELETE | `/api/songs/:id` | Admin | Delete a song |
| PATCH | `/api/songs/:id/featured` | Admin | Toggle featured |
| PATCH | `/api/songs/:id/published` | Admin | Toggle published |
| PATCH | `/api/songs/:id/position` | Admin | `{ direction: "up" \| "down" }` |

---

## Troubleshooting

- **"Missing MONGODB_URI" on server start** → you haven't created `server/.env` yet (step 5).
- **Frontend shows network errors** → make sure the backend (`npm run dev` in `server`) is running on port 5000.
- **Can't log into `/admin`** → make sure you ran the `createAdmin.js` script (step 8) and are using the exact email/password you created.
- **Uploaded audio/poster doesn't show** → check that `server/uploads` exists and is writable, and that the backend is actually running (files are served from `http://localhost:5000/uploads/...`, proxied through Vite in dev).
