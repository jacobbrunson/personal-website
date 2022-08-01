const { waitFor, fireEvent } = require("@testing-library/dom");
const { appAgentWithHost, render } = require("./test-utils");

const request = appAgentWithHost("localhost");

test("should mark the Photos link as current", async () => {
  const { getByRole } = await render(request.get("/photos"));
  expect(getByRole("link", { name: "photos" })).toHaveClass("current");
});

const fakeFetch = jest.fn((url) => {
  return Promise.resolve({
    json: () => Promise.resolve({
      "/api/photos/0": {
        photos: ["Foo_800x600_Bar"],
        hasNextPage: true
      },
      "/api/photos/1": {
        photos: ["Bar_600x800_Baz"],
        hasNextPage: false
      },
    }[url])
  });
});

test("IntersectionObserver-based pagination", async () => {
  const { container, simulateIntersection } = await render(
    request.get("/photos"),
    { injectScript: "public/js/photos.js" }
  );
  container.window.fetch = fakeFetch;

  const gallery = container.getElementById("gallery");

  expect(fakeFetch).not.toHaveBeenCalled();
  expect(gallery.children).toHaveLength(0);

  await simulateIntersection();
  expect(fakeFetch).toHaveBeenLastCalledWith("/api/photos/0");
  await waitFor(() => expect(gallery.children).toHaveLength(1));

  await simulateIntersection();
  expect(fakeFetch).toHaveBeenLastCalledWith("/api/photos/1");
  await waitFor(() => expect(gallery.children).toHaveLength(2));

  await simulateIntersection();
  expect(fakeFetch).toHaveBeenCalledTimes(2);

  const images = gallery.querySelectorAll("img");
  expect(images).toHaveLength(2);
  expect(images[0]).toHaveAttribute("src", "https://cdn.brunson.dev/thumbs/Foo_800x600_Bar");
  expect(images[1]).toHaveAttribute("src", "https://cdn.brunson.dev/thumbs/Bar_600x800_Baz");
});

test.only.each([
  [300, ["200x200", "150x200"], ["171x200", "128x200"]],
  [300, ["400x400"], ["300x200"]],
  [300, [], []],
  [300, ["800x200"], ["300x200"]],
  [300, ["300x200", "300x300", "400x300", "100x100", "100x200", "100x200", "150x200"], []],
  [300, ["200x75", "100x50", "300x175"], []],
  // todo add some other dimensions
])("flows images in gallery width %i from %j to %j", async (galleryWidth, input, expected) => {
  const { container } = await render(
    request.get("/photos"),
    { injectScript: "public/js/photos.js" }
  );
  
  const gallery = container.getElementById("gallery");
  Object.defineProperty(gallery, "clientWidth", {
    value: galleryWidth,
    writable: false
  });

  input.forEach((d) => {
    const img = container.createElement("img");
    img.src = `X_${d}_X`;
    gallery.appendChild(img);
  });
  
  fireEvent.resize(container.window);

  const newDimensions = Array.from(gallery.querySelectorAll("img")).map((img) => `${img.width}x${img.height}`);

  expect(newDimensions).toStrictEqual(expected);
});

test("lightbox", async () => {
  const { container, simulateIntersection } = await render(
    request.get("/photos"),
    { injectScript: "public/js/photos.js" }
  );
  container.window.fetch = fakeFetch;

  const gallery = container.getElementById("gallery");

  await simulateIntersection();
  await waitFor(() => expect(gallery.children).toHaveLength(1));

  const lightbox = container.getElementById("lightbox");
  expect(lightbox).not.toBeVisible();

  fireEvent.click(gallery.children[0]);

  expect(lightbox).toBeVisible();
  expect(container.getElementById("lightbox-img")).toHaveStyle("background-image: url(https://cdn.brunson.dev/Foo_800x600_Bar)");
  expect(container.getElementById("download")).toBeNull();
});

test("lightbox download", async () => {
  const { container, simulateIntersection } = await render(
    request.get("/photos").query({ download: "test" }),
    { injectScript: "public/js/photos.js" }
  );
  container.window.fetch = fakeFetch;

  const gallery = container.getElementById("gallery");

  await simulateIntersection();
  await waitFor(() => expect(gallery.children).toHaveLength(1));

  const lightbox = container.getElementById("lightbox");
  expect(lightbox).not.toBeVisible();

  fireEvent.click(gallery.children[0]);

  expect(lightbox).toBeVisible();
  expect(container.getElementById("download")).not.toBeNull();
});

test("lightbox closes with click", async () => {

});

test("lightbox closes with esc", async () => {

});