# Vibe-Coded Projects Hub

Simple static site for browsing your projects from one place.

## Features
- Search projects by title, description, and tags
- Filter by status (`active`, `paused`, `archived`)
- Filter by tags (generated from project data)
- Data-driven cards from `data/projects.json`
- Mobile-friendly responsive layout

## Project Structure
- `index.html` - page structure
- `styles.css` - visual styling and responsive layout
- `app.js` - data loading, filtering, rendering
- `data/projects.json` - project list data

## Add or Edit Projects
Update `data/projects.json` with objects in this shape:

```json
{
  "id": "unique-project-slug",
  "title": "Project Name",
  "description": "Short summary.",
  "url": "https://your-project-url.example",
  "tags": ["tag-one", "tag-two"],
  "status": "active"
}
```

`status` must be one of:
- `active`
- `paused`
- `archived`

## Local Preview
Because this app fetches JSON, use a local web server (not direct file open).

PowerShell example:

```powershell
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## Deploy to GitHub Pages
1. Push this folder to a GitHub repository.
2. In GitHub, open `Settings` -> `Pages`.
3. Set source to `Deploy from a branch`.
4. Select branch `main` and folder `/ (root)`.
5. Save and wait for deployment.
6. Open your published Pages URL.

## Notes
- If `data/projects.json` is invalid JSON, the app shows an error state.
- Cards still render even if a URL is unreachable; only browser navigation is affected.
