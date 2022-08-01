let index = 0;
let isIntersecting = false;
const things = document.querySelectorAll(".thing");

const next = () => {
  if (index >= things.length) {
    return;
  }

  const thing = things[index];
  thing.querySelectorAll(".img").forEach(div => {
    const img = document.createElement("img");
    img.classList = div.classList;
    img.classList.remove("img");
    img.src = div.getAttribute("src");
    div.replaceWith(img);
  });
  thing.querySelectorAll(".video").forEach(div => {
    const video = document.createElement("video");
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.classList = div.classList;
    video.classList.remove("video");
    const children = div.children;
    for (let i = children.length - 1; i >= 0; i--) {
      video.prepend(children[i]);
    }
    div.replaceWith(video);
  });
  thing.style = "display: block;";
  index++;
};

const intersectionObserver = new IntersectionObserver(async (entries) => {
  isIntersecting = entries[0].isIntersecting;
  
  if (!isIntersecting) {
    return;
  }

  next();
  next();
  next();
}, {
  rootMargin: "400px",
  threshold: 0
});
intersectionObserver.observe(document.getElementById("sentinel"));
next();
next();
next();