# Cristopher PX Portfolio

Standalone React and Vite app containing the latest portfolio design, all six projects, original project text, images, and videos. No hosting service or backend is required to develop the app.

## Run locally

Use Node.js 22.12 or newer and npm. From this folder:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Changes to the source appear automatically while the development server is running.

## Edit the app

- `src/App.jsx` — homepage, navigation, contact details, and project cards.
- `src/projects.json` — all six project case studies, metadata, text, and media references.
- `src/ProjectDialog.jsx` — project page layout and video players.
- `src/styles.css` — main layout, typography, colors, and responsive styles.
- `src/motion.css` and `src/usePortfolioMotion.js` — shrinking header, parallax, and other animation.
- `src/project-dialog.css` — project page styles.
- `public/assets/` — images and fonts.
- `public/media/` — Fungi and Allianz videos. Intel's video uses its public Facebook embed.
- `index.html` — page title, description, and favicon.

The current accent is `#D73C69`. The email is emphasized with typography, without a colored highlight. Project wording is preserved from the original portfolio; keep it unchanged unless the owner requests edits.

## Check a production build

```sh
npm run build
npm run preview
```

The build produces static files in `dist/`. The preview command serves that build locally.

This is a client-rendered app with paths such as `/works/ai-accelerate`. A future host needs to serve `index.html` for app routes so shared links and page refreshes work. Asset URLs currently assume the app is served from the domain root. Hosting can be configured separately; this project contains no provider-specific configuration.

## Work through GitHub

Use this folder as the repository root. Include the source, `public/`, `index.html`, package files, Vite config, this README, and `.gitignore`. Keep `package-lock.json` so installs use the same dependency versions.

`node_modules/`, generated `dist/` files, logs, and local environment files are ignored. After editing locally, run `npm run build`, then commit and push through your usual GitHub workflow.
