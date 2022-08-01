const { JSDOM } = require("jsdom");
const { queries } = require("@testing-library/dom");
const supertest = require("supertest");
const fs = require("fs");

const app = require("../app");

const appAgentWithHost = (host) => supertest.agent(app).host(host);

const render = async (responsePromise, { injectScript = undefined } = {}) => {
  const response = await responsePromise;
  const dom = new JSDOM(response.text, { runScripts: injectScript ? "outside-only" : undefined });
  let intersectionObserverCallback;
  if (injectScript) {
    dom.window.IntersectionObserver = class {
      constructor(callback) {
        intersectionObserverCallback = callback;
      }
      observe() {}
    };
    const scriptSource = fs.readFileSync(injectScript, "utf-8");
    dom.window.eval(scriptSource);
  }
  dom.window.document.window = dom.window;
  const result = {
    container: dom.window.document,
    response,
    simulateIntersection: async () => await intersectionObserverCallback([{ isIntersecting: true }])
  };
  Object.keys(queries).forEach((queryName) => result[queryName] = (
    (...args) => queries[queryName](dom.window.document, ...args)
  ));
  return result;
};

module.exports = { appAgentWithHost, render };