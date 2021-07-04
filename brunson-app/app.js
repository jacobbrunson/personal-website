const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");

// App config
const PAGE_SIZE = 50;
const photos = require("./photos/photos.json").reverse();
const projects = require("./projects/projects.json");

// App setup
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.disable('x-powered-by');

// Template routes
const routes = [];

const isLocal = (req) => req.hostname === "localhost";

const makeAbsolutePath = (req) => (p) => isLocal(req) ? `http://localhost:3000/${p}` : `https://brunson.${p}/`;

const makeRoute = (extension, title, locals) => {
  const handler = (req, res) => {
    const resolvedLocals = typeof locals === "function" ? locals(req) : locals;
    const absolutePath = makeAbsolutePath(req);
    res.render(extension, { title, extension, absolutePath, ...resolvedLocals });
  };

  routes.push({
    extension,
    handler
  })

  app.get(`/${extension}/`, (req, res, next) => {
    if (isLocal(req)) {
      handler(req, res);
      return;
    }
    next();
  })
};

app.get("/", (req, res, next) => {
  for (const { extension, handler } of routes) {
    if (req.hostname.endsWith(extension)) {
      handler(req, res, next);
      return;
    }
  }
  if (isLocal(req)) {
    res.redirect("/me");
    return;
  }
  next();
});

makeRoute("me", "About");
makeRoute("dev", "Projects", { projects });
makeRoute("photos", "Photos", ({ query }) => ({ allowDownload: query.download !== undefined }));

// API routes
app.get("/api/photos", (_, res) => res.redirect("/api/photos/0"));
app.get("/api/photos/:page", (req, res) => {
  const page = parseInt(req.params.page);

  const startIndex = page * PAGE_SIZE;
  const endIndex = (page + 1) * PAGE_SIZE;
  const hasNextPage = endIndex < photos.length;

  res.send({
    photos: photos.slice(startIndex, endIndex),
    hasNextPage,
  });
});

// 404 error handler
app.use((_, __, next) => {
  next(createError(404));
});

// General error handler
app.use(function(err, req, res, _) {
  const extension = "error";
  const error = req.app.get("env") === "development" ? err : undefined;
  const status = err.status || 500;
  const absolutePath = makeAbsolutePath(req);
  res.status(status);
  res.render(extension, { extension, absolutePath: (e) => e === extension ? status : absolutePath(e), error, status, title: status });
});

module.exports = app;
