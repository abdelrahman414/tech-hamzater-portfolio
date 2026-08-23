# Deployment

This is a static website. The production entry file is `index.html` in the project root.

## GitHub

From inside this folder:

```bash
git init
git add .
git commit -m "Initial portfolio website"
```

Create an empty repository on GitHub, then connect it:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Vercel

1. Open Vercel.
2. Import the GitHub repository.
3. Framework Preset: `Other`.
4. Build Command: leave empty.
5. Output Directory: leave empty or use `.`.
6. Deploy.

## Local Preview

```bash
python3 -m http.server 5173
```

Open `http://127.0.0.1:5173/`.
