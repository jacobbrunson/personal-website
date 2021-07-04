const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const PAGE_SIZE = 50;
const photos = require("./photos/photos.json").reverse();

const projects = require("./projects/projects.json");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const routes = [];

const makeAbsolutePath = (req) => (p) => req.hostname === "localhost" ? `http://localhost:3000/${p}` : `https://brunson.${p}/`;

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
    if (req.hostname === "localhost") {
      handler(req, res);
    }
  })
};

app.get("/", (req, res, next) => {
  for (const { extension, handler } of routes) {
    if (req.hostname.endsWith(extension)) {
      handler(req, res, next);
      return;
    }
  }
  if (req.hostname === "localhost") {
    res.redirect("/me");
  }
});


makeRoute("me", "About");
makeRoute("dev", "Projects", { projects });
makeRoute("photos", "Photos", ({ query }) => ({ allowDownload: query.download !== undefined }));

app.get("/api/photos", (_, res) => res.redirect("/api/photos/0"));
app.get("/api/photos/:page", (req, res) => {
  const page = parseInt(req.params.page);

  const startIndex = page * PAGE_SIZE;
  const endIndex = (page + 1) * PAGE_SIZE;
  console.log(page, startIndex, endIndex);
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
app.use(function(err, req, res, next) {
  const extension = "error";
  const error = req.app.get("env") === "development" ? err : undefined;
  const status = err.status || 500;
  const absolutePath = makeAbsolutePath(req);
  res.status(status);
  res.render(extension, { extension, absolutePath: (e) => e === extension ? status : absolutePath(e), error, status });
});

module.exports = app;
