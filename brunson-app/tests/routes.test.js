const { JSDOM } = require("jsdom");
const supertest = require("supertest");
const app = require("../app");

jest.mock("../photos/photos.json", () => Array.from(Array(100).keys()).map(i => `Photo-${i}`));

const render = (response) => {
  const dom = new JSDOM(response.text);
  const result = {
    container: dom.window.document
  };
  // Object.keys(queries).forEach((queryName) => result[queryName] = (
  //   (...args) => queries[queryName](dom.window.document, ...args)
  // ));
  return result;
};

describe("Host: localhost", () => {
  const request = supertest.agent(app).host("localhost");

  it("/ redirects to /me", async () => {
    const res = await request.get("/");
    expect(res.statusType).toBe(3);
    expect(res.header.location).toBe("/me");
  });

  it("/me serves About", async () => {
    const res = await request.get("/me");
    expect(res.status).toBe(200);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  it("/dev serves Projects", async () => {
    const res = await request.get("/dev");
    expect(res.status).toBe(200);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  it("/photos serves Photos", async () => {
    const res = await request.get("/photos");
    expect(res.status).toBe(200);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  it("/me/ serves About", async () => {
    const res = await request.get("/me/");
    expect(res.status).toBe(200);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  it("/invalid serves 404", async () => {
    const res = await request.get("/invalid");
    expect(res.status).toBe(404);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });
});

describe("Host: brunson.me", () => {
  const request = supertest.agent(app).host("brunson.me");

  it("empty path serves About", async () => {
    const res = await request.get("");
    expect(res.status).toBe(200);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  it("/ serves About", async () => {
    const res = await request.get("");
    expect(res.status).toBe(200);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  it("/me serves 404", async () => {
    const res = await request.get("/me");
    expect(res.status).toBe(404);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });
});

describe("Host: brunson.dev", () => {
  const request = supertest.agent(app).host("brunson.dev");

  it("empty path serves Projects", async () => {
    const res = await request.get("");
    expect(res.status).toBe(200);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  it("/ serves Projects", async () => {
    const res = await request.get("");
    expect(res.status).toBe(200);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  it("/dev serves 404", async () => {
    const res = await request.get("/dev");
    expect(res.status).toBe(404);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });
});

describe("Host: brunson.photos", () => {
  const request = supertest.agent(app).host("brunson.photos");

  it("empty path serves Photos", async () => {
    const res = await request.get("");
    expect(res.status).toBe(200);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  it("/ serves Photos", async () => {
    const res = await request.get("");
    expect(res.status).toBe(200);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });

  it("/photos serves 404", async () => {
    const res = await request.get("/photos");
    expect(res.status).toBe(404);

    const { container } = render(res);
    expect(container.head).toMatchSnapshot();
    expect(container.body).toMatchSnapshot();
  });
});

describe("Host: anything", () => {
  const request = supertest.agent(app).host("anything");

  describe("Photos API", () => {
    it("/api/photos redirects to /api/photos/0", async () => {
      const res = await request.get("/api/photos");
      expect(res.statusType).toBe(3);
      expect(res.header.location).toBe("/api/photos/0");
    });

    it("/api/photos/ redirects to /api/photos/0", async () => {
      const res = await request.get("/api/photos/");
      expect(res.statusType).toBe(3);
      expect(res.header.location).toBe("/api/photos/0");
    });

    it("/api/photos/0 returns the most recent 50 photos", async () => {
      const res = await request.get("/api/photos/0");
      expect(res.status).toBe(200);
      const data = JSON.parse(res.text);
      expect(data.photos.length).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(data.photos[i]).toBe(`Photo-${99-i}`);
      }
      expect(data.hasNextPage).toBe(true);
    });

    it("/api/photos/0/ returns the first 50 results", async () => {
      const res = await request.get("/api/photos/0");
      expect(res.status).toBe(200);
      const data = JSON.parse(res.text);
      expect(data.photos.length).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(data.photos[i]).toBe(`Photo-${99-i}`);
      }
      expect(data.hasNextPage).toBe(true);
    });

    it("/api/photos/1 returns the next 50 results", async () => {
      const res = await request.get("/api/photos/1");
      expect(res.status).toBe(200);
      const data = JSON.parse(res.text);
      expect(data.photos.length).toBe(50);
      for (let i = 0; i < 50; i++) {
        expect(data.photos[i]).toBe(`Photo-${49-i}`);
      }
      expect(data.hasNextPage).toBe(false);
    });
  });

  it("/invalid serves 404", async () => {
    const res = await request.get("/invalid");
    expect(res.status).toBe(404);
  });
});