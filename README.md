
  # Personal Website for Psychologist


  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ### Admin password

  Create a `.env` file with `VITE_ADMIN_PASSWORD` (see `.env.example`) to set the admin password.

  ### Production build

  Run `npm run build` to create the production build.

  Run `npm run preview` to serve the production build locally.

  ### Docker

  Build the image:
  ```
  docker build -t psychologist-site .
  ```

  Run the container:
  ```
  docker run --rm -p 8080:80 psychologist-site
  ```

  The site will be available at http://localhost:8080.
  
