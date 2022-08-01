const { appAgentWithHost, render } = require("./test-utils");

jest.mock("../photos/photos.json", () => Array.from(Array(100).keys()).map(i => `Photo-${i}`));

describe("Host: localhost", () => {
  const request = appAgentWithHost("localhost");

  test("/ redirects to /me", async () => {
    const { response } = await render(request.get("/"));
    expect(response.statusType).toBe(3);
    expect(response.header.location).toBe("/me");
  });

  test("/me serves About", async () => {
    const { response, container } = await render(request.get("/me"));
    expect(response.status).toBe(200);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  test("/dev serves Projects", async () => {
    const { response, container } = await render(request.get("/dev"));
    expect(response.status).toBe(200);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  test("/photos serves Photos", async () => {
    const { response, container } = await render(request.get("/photos"));
    expect(response.status).toBe(200);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  test("/me/ serves About", async () => {
    const { response, container } = await render(request.get("/me/"));
    expect(response.status).toBe(200);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  test("/invalid serves 404", async () => {
    const { response, container } = await render(request.get("/invalid"));
    expect(response.status).toBe(404);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });
});

describe("Host: brunson.me", () => {
  const request = appAgentWithHost("brunson.me");

  test("empty path serves About", async () => {
    const { response, container } = await render(request.get(""));
    expect(response.status).toBe(200);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  test("/ serves About", async () => {
    const { response, container } = await render(request.get(""));
    expect(response.status).toBe(200);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  test("/me serves 404", async () => {
    const { response, container } = await render(request.get("/me"));
    expect(response.status).toBe(404);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });
});

describe("Host: brunson.dev", () => {
  const request = appAgentWithHost("brunson.dev");

  test("empty path serves Projects", async () => {
    const { response, container } = await render(request.get(""));
    expect(response.status).toBe(200);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  test("/ serves Projects", async () => {
    const { response, container } = await render(request.get(""));
    expect(response.status).toBe(200);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  test("/dev serves 404", async () => {
    const { response, container } = await render(request.get("/dev"));
    expect(response.status).toBe(404);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });
});

describe("Host: brunson.photos", () => {
  const request = appAgentWithHost("brunson.photos");

  test("empty path serves Photos", async () => {
    const { response, container } = await render(request.get(""));
    expect(response.status).toBe(200);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  test("/ serves Photos", async () => {
    const { response, container } = await render(request.get(""));
    expect(response.status).toBe(200);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  test("/photos serves 404", async () => {
    const { response, container } = await render(request.get("/photos"));
    expect(response.status).toBe(404);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });
});

describe("Host: anything", () => {
  const request = appAgentWithHost("anything");

  describe("Photos API", () => {
    test("/api/photos redirects to /api/photos/0", async () => {
      const { response } = await render(request.get("/api/photos"));
      expect(response.statusType).toBe(3);
      expect(response.header.location).toBe("/api/photos/0");
    });

    test("/api/photos/ redirects to /api/photos/0", async () => {
      const { response } = await render(request.get("/api/photos/"));
      expect(response.statusType).toBe(3);
      expect(response.header.location).toBe("/api/photos/0");
    });

    test("/api/photos/0 returns the most recent 50 photos", async () => {
      const { response } = await render(request.get("/api/photos/0"));
      expect(response.status).toBe(200);
      const data = JSON.parse(response.text);
      expect(data.photos.length).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(data.photos[i]).toBe(`Photo-${99-i}`);
      }
      expect(data.hasNextPage).toBe(true);
    });

    test("/api/photos/0/ returns the first 50 results", async () => {
      const { response } = await render(request.get("/api/photos/0"));
      expect(response.status).toBe(200);
      const data = JSON.parse(response.text);
      expect(data.photos.length).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(data.photos[i]).toBe(`Photo-${99-i}`);
      }
      expect(data.hasNextPage).toBe(true);
    });

    test("/api/photos/1 returns the next 50 results", async () => {
      const { response } = await render(request.get("/api/photos/1"));
      expect(response.status).toBe(200);
      const data = JSON.parse(response.text);
      expect(data.photos.length).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(data.photos[i]).toBe(`Photo-${49-i}`);
      }
      expect(data.hasNextPage).toBe(false);
    });
  });

  test("/invalid serves 404", async () => {
    const { response } = await render(request.get("/invalid"));
    expect(response.status).toBe(404);
  });
});