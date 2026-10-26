# HallFinder Web

Next.js 14 (App Router) + Tailwind frontend: student, teacher and admin apps, indoor floor maps, live turn-by-turn directions, light and dark mode, English and French.

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000  (start the API first, see the backend repo)
```

## Environment variables
| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL of the deployed API, no trailing slash |
| `NEXT_PUBLIC_SCHOOL_NAME` | School name shown in the interface |
| `NEXT_PUBLIC_DEMO_MODE` | `true` starts at a simulated Monday 10:01 so every feature has data. Set `false` for real time. |

## Deploy on Netlify or Vercel
Import the repo, set `NEXT_PUBLIC_API_URL`, build command `npm run build`. On Netlify the Next.js runtime is detected automatically. Then add the site URL to `CLIENT_ORIGIN` on the backend.

## Notes
- All illustrations are inline SVG, so there are no image files and no external image requests.
- "You are here" comes from door QR codes (`/l/<HALL_CODE>`) or a chosen start. Admins can print QR sheets from the Console. "Simulate walking" on the navigation screen demonstrates live guidance without hardware.
