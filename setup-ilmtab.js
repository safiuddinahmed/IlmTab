// setup-ayahtab.js
import fs from 'fs';
import path from 'path';

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  } else {
    console.log(`Directory exists: ${dirPath}`);
  }
}

function writeFileIfNotExist(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created file: ${filePath}`);
  } else {
    console.log(`File exists: ${filePath}`);
  }
}

function main() {
  const root = process.cwd();

  // Directories
  const dirs = [
    'client/public',
    'client/src/components',
    'server/routes',
  ];

  dirs.forEach(dir => ensureDir(path.join(root, dir)));

  // Files to create (path => content)
  const files = {
    // client/public/manifest.json
    'client/public/manifest.json': `{
  "manifest_version": 3,
  "name": "AyahTab",
  "version": "0.1.0",
  "description": "New tab Quran ayah extension",
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "permissions": [
    "storage"
  ],
  "icons": {
    "48": "icon48.png",
    "128": "icon128.png"
  }
}
`,

    // client/public/index.html
    'client/public/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AyahTab</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`,

    // client/src/App.jsx
    'client/src/App.jsx': `import AyahDisplay from './components/AyahDisplay';

export default function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h1>Welcome to AyahTab</h1>
      <AyahDisplay />
    </div>
  );
}
`,

    // client/src/components/AyahDisplay.jsx
    'client/src/components/AyahDisplay.jsx': `import { useState, useEffect } from 'react';

export default function AyahDisplay() {
  const [ayah, setAyah] = useState("وَاللَّهُ خَيْرُ الْرَّازِقِينَ (Surah Ad-Duha, 93:3)");

  // Placeholder: you can replace this with API calls or dynamic data later

  return (
    <div style={{ marginTop: 20, fontSize: '1.2rem' }}>
      <p>{ayah}</p>
    </div>
  );
}
`,

    // client/src/main.jsx
    'client/src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
`,

    // client/package.json
    'client/package.json': `{
  "name": "ayahtab-client",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.0.0"
  }
}
`,

    // client/vite.config.js
    'client/vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});
`,

    // server/index.js
    'server/index.js': `import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,

    // server/routes/health.js
    'server/routes/health.js': `import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'AyahTab backend is running' });
});

export default router;
`,

    // server/package.json
    'server/package.json': `{
  "name": "ayahtab-server",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
`,

    // README.md
    'README.md': `# AyahTab

AyahTab is a browser extension that displays a new Quran ayah every new tab.

## Setup

### Backend

\`\`\`bash
cd server
npm install
npm run dev
\`\`\`

### Frontend

\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

---

Load the \`client/dist\` folder as an unpacked extension in Chrome.

---

Happy coding!
`
  };

  Object.entries(files).forEach(([filePath, content]) => {
    writeFileIfNotExist(path.join(root, filePath), content);
  });
}

main();
