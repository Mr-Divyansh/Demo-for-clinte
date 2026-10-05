# Design references

Source material the static demo was built from. **Nothing in this folder ships
or runs** — the demo has no build step and no framework.

## `admin-dashboard-mockup.tsx`

The original React + Tailwind + Recharts admin dashboard mockup, kept as the
design source of truth for `admin.html`.

It is **not** compiled, bundled or linked. The static demo reimplements the same
layout in plain HTML/CSS/JS against `css/admin/admin.css`, and every KPI, order,
product and alert is hardcoded mock data in `js/admin/admin-data.js`.

Keep this file only as a visual reference. If the admin grows into a real React
app later, this becomes the starting point — at which point it needs `react`,
`lucide-react` and `recharts` in `package.json`, none of which exist today.
