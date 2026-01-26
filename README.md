
  # Personal Website for Psychologist


  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ### Admin password

  Create a `.env` file with `VITE_ADMIN_PASSWORD` (see `.env.example`) to set the admin password.

  ### Production build

  Run `npm run build` to create the production build.

  Run `npm run preview` to serve the production build locally.

  ## robots.txt и sitemap.xml (SPA)

  ### Куда положить файлы
  - Положите `robots.txt` и `sitemap.xml` в папку `public/` — Vite скопирует их в корень `dist/` при сборке.
  - В проде эти файлы должны лежать рядом с `index.html` в корне `dist/` (или в корне директории, которая отдается сервером).

  **Пример `public/robots.txt`:**
  ```
  User-agent: *
  Allow: /
  Sitemap: https://psychologist.example.com/sitemap.xml
  ```

  **Пример `public/sitemap.xml`:**
  ```
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://psychologist.example.com/</loc>
      <lastmod>2024-05-01</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
  </urlset>
  ```

  ### Nginx (исключаем SPA fallback для robots/sitemap)
  ```
  location = /robots.txt {
    default_type text/plain;
    try_files $uri =404;
  }

  location = /sitemap.xml {
    default_type application/xml;
    try_files $uri =404;
  }

  location / {
    try_files $uri /index.html;
  }
  ```

  ### Express (пример middleware/route)
  ```
  import express from 'express';
  import path from 'path';

  const app = express();
  const distDir = path.resolve('dist');

  app.get(['/robots.txt', '/sitemap.xml'], (req, res, next) => {
    const fileName = req.path.slice(1);
    const filePath = path.join(distDir, fileName);
    res.type(fileName.endsWith('.xml') ? 'application/xml' : 'text/plain');
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).send('Not found');
      }
    });
  });

  app.use(express.static(distDir));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
  ```

  ### Проверка
  ```
  curl -i http://localhost:3000/robots.txt
  curl -i http://localhost:3000/sitemap.xml
  ```
  В ответе должны быть `200 OK` и корректные `Content-Type`, а `index.html` не должен возвращаться для этих URL.

  ### Contact form email

  Configure SMTP credentials in `.env` (see `.env.example`):

  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_DOMAIN`
  - `SMTP_USER`, `SMTP_PASSWORD`
  - `CONTACT_TO`, `CONTACT_FROM`

  Run the API server:

  ```
  npm run server
  ```

  In development, keep both the Vite dev server and the API server running.

  ### Docker

  Build the image:
  ```
  docker build -t psychologist-site .
  ```

  Run the container:
  ```
  docker run --rm -p 8080:3000 --env-file .env psychologist-site
  ```

  The site will be available at http://localhost:8080.
  
