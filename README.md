
  # Personal Website for Psychologist


  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start Vite development.

  Run `node server.js` to start Node develomment server.

  ### Production build

  Run `npm run build` to create the production build.

  Run `npm run preview` to serve the production build locally.

  ```
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
  
