# Jacob Brunson Personal Website

[![brunson-app CI](https://github.com/jacobbrunson/personal-website/actions/workflows/brunson-app-test.yml/badge.svg)](https://github.com/jacobbrunson/personal-website/actions/workflows/brunson-app-test.yml)

My personal website.

This project is hosted across 3 domains:
* https://brunson.me
* https://brunson.dev
* https://brunson.photos

# Local development

Everything you need is inside the `brunson-app` directory

`cd brunson-app`

You can start the local dev server by running:

`npm run dev`

which will start a dev server at http://localhost:3000

Note that in dev mode each domain has it's own subroute:
* https://brunson.me <-> http://localhost:3000/me
* https://brunson.dev <-> http://localhost:3000/dev
* https://brunson.photos <-> http://localhost:3000/photos

Run the test suite:

`npm test`

# Uploading photos

`cd photos`

Add photos to the `upload` directory (e.g. `brunson-app/photos/upload/CoolPic.jpeg`)

`sh upload.sh`

`photos.json` will be updated automatically, but you will still need to deploy the app.

See `brunson-app/photos/README.md` for more details.

# Adding new projects

`cd projects`

Edit `projects.json` manually and add media files to the `media/` directory (e.g. `brunson-app/projects/media/_thumbs/thing/pic.jpeg`)

`sh sync.sh`

Then you will need to deploy the app.

# Deploying app

`sh deploy.sh`

Note that this script clones the public Git repo. If you add new files that you're expecting to be deployed, you must push your changes.

This script assumes you're automatically authenticated to the server via SSH keys.

# Docker Containers

This application is based on two containers:

1. `brunson-app`
2. `brunson-proxy`

`brunson-app` is a Node application served on port 3000

`brunson-proxy` is a Caddy server which handles reverse-proxying for the 3 domains and also manages SSL certificates. This container has a special `caddy_data` volume which is important.

If you need to debug something with the containers, you can set them up: (run in repo root)

`docker-compose up`

`docker-compose up -d` (Background)

Or take them down:

`docker-compose down`
