const { appAgentWithHost, render } = require("./test-utils");

jest.mock("../projects/projects.json", () => ([
  {
    title: "Fake Project",
    year: 2050,
    paragraphs: [
      "Hello world"
    ],
    media: [
      {
        type: "img",
        size: "big",
        source: "foo.jpeg"
      },
      {
        type: "video",
        size: "small",
        sources: [
          "bar.webm",
          "bar.mp4"
        ]
      }
    ],
  },
  {
    title: "Another Project",
    year: 2030,
    paragraphs: [
      "Lorem ipsum"
    ],
    media: [
      {
        type: "img",
        size: "small",
        source: "http://example.com/baz.jpeg"
      }
    ],
    links: [
      {
        title: "Test Link",
        href: "https://brunson.me"
      }
    ]
  },
  {
    title: "A Project Without Media",
    year: 2025,
    paragraphs: [
      "Getting lazy",
      "A little less lazy now"
    ],
    links: [
      {
        title: "Another Link",
        href: "http://www.example.com"
      }
    ]
  },
  {
    title: "One more project",
    year: 2023,
    paragraphs: ["Nothing really"],
    media: [
      {
        type: "img",
        size: "large",
        source: "nothing.jpeg"
      }
    ]
  }
]));

const request = appAgentWithHost("localhost");

test("should mark the Projects link as current", async () => {
  const { getByRole } = await render(request.get("/dev"));
  expect(getByRole("link", { name: "projects" })).toHaveClass("current");
});

test("should render 3 projects", async () => {
  const { getByRole } = await render(request.get("/dev"));
  getByRole("heading", { name: "Fake Project (2050)" });
  getByRole("heading", { name: "Another Project (2030)" });
  getByRole("heading", { name: "A Project Without Media (2025)" });
});

test("small media should have the small class", async () => {
  const { container } = await render(request.get("/dev"));
  expect(container.querySelector("div[src='https://cdn.brunson.dev/projects/media/_thumbs/foo.jpeg']")).toHaveClass("img big");
});

test("big media should have the big class", async () => {
  const { container } = await render(request.get("/dev"));
  expect(container.querySelector("div[src='https://cdn.brunson.dev/projects/media/_thumbs/foo.jpeg']")).toHaveClass("img big");
});

test("absolute media should be served from the actual url", async () => {
  const { container } = await render(request.get("/dev"));
  expect(container.querySelector("div[src='http://example.com/baz.jpeg']")).toHaveClass("img small");
});

test("if there is only small media then the media should also have a small class to be single row", async () => {
  const { container } = await render(request.get("/dev"));
  expect(container.querySelector("div[src='http://example.com/baz.jpeg']").parentElement).toHaveClass("media small");
});

test("should render links", async () => {
  const { getByRole } = await render(request.get("/dev"));
  expect(getByRole("link", { name: "Test Link" })).toHaveAttribute("href", "https://brunson.me");
  expect(getByRole("link", { name: "Another Link" })).toHaveAttribute("target", "_blank");
});

describe("Lazy loading", () => {
  test("should initially load the first 3 things", async () => {
    const { container } = await render(
      request.get("/dev"),
      { injectScript: "public/js/projects.js" }
    );
    expect(container.querySelectorAll(".media img")).toHaveLength(2);
    expect(container.querySelectorAll(".media video")).toHaveLength(1);
    expect(container.querySelectorAll("div.img")).toHaveLength(1); // One thing with one image still hasn't been loaded
  });

  test("should load the next batch of items when the sentinel intersects the viewport", async () => {
    const { container, simulateIntersection } = await render(
      request.get("/dev"),
      { injectScript: "public/js/projects.js" }
    );
    await simulateIntersection();
    expect(container.querySelectorAll("div.img")).toHaveLength(0);
    expect(container.querySelectorAll(".media img")).toHaveLength(3);
  });
});
