const { appAgentWithHost, render } = require("./test-utils");

const request = appAgentWithHost("localhost");

test("should mark the About link as current", async () => {
  const { getByRole } = await render(request.get("/me"));
  expect(getByRole("link", { name: "about" })).toHaveClass("current");
});

test("should have a heading", async () => {
  const { getByRole } = await render(request.get("/me"));
  getByRole("heading", { name: "Hi, I'm Jacob." });
});