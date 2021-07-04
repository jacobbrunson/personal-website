const aspectRatio = (img) => {
  if (img.complete) {
    return img.naturalWidth / img.naturalHeight;
  }
  // Images are assumed to be named with the following format:
  // XXXX_WidthxHeight_XXXX
  // This allows us to size and place the images before they have loaded
  const dimensions = img.src.split("_")[1].split("x");
  return dimensions[0] / dimensions[1];
}

let hasNextPage = true;
let currentPage = 0;
let isIntersecting = false;

const nextPage = async () => {
  await fetchPhotoNames(currentPage);
  imageFlow(gallery);
  currentPage++;
};

const intersectionObserver = new IntersectionObserver(async (entries) => {
  isIntersecting = entries[0].isIntersecting;

  if (!hasNextPage || !isIntersecting) {
    return;
  }

  nextPage();

  setTimeout(() => {
    if (isIntersecting) {
      nextPage();
    }
  }, 500);
}, {
  rootMargin: "400px",
  threshold: 0
});
intersectionObserver.observe(document.getElementById("sentinel"));

const rowHeight = 200;

const IMAGES_URL = "https://cdn.brunson.dev";

const fetchPhotoNames = async (pageIndex) => {
  const PHOTOS_API = "/api/photos";
  const response = await (await fetch(`${PHOTOS_API}/${pageIndex}`)).json();
  const gallery = document.getElementById("gallery");
  hasNextPage = response.hasNextPage;
  response.photos.forEach(name => {
    const img = new Image();
    img.src = `${IMAGES_URL}/thumbs/${name}`;
    gallery.appendChild(img);
  });
};

const imageFlow = (gallery) => {
  const images = gallery.querySelectorAll("img");
  const rowWidth = gallery.clientWidth;
  let imgRow = [];
  let remainingWidth = rowWidth;
  
  for (const img of images) {
    if (!img) continue;

    const desiredWidth = aspectRatio(img) * rowHeight;

    let didSqueeze = false;
    if (desiredWidth > remainingWidth) {

      if (desiredWidth < 2 * remainingWidth) {
        imgRow.push(img);
        remainingWidth -= desiredWidth;
        didSqueeze = true;
      }

      imgRow.forEach(pendingImg => {
        const actualWidth = aspectRatio(pendingImg) * rowHeight * rowWidth / (rowWidth - remainingWidth);
        pendingImg.width = actualWidth;
        pendingImg.height = rowHeight;
      });
      
      imgRow = [];
      remainingWidth = rowWidth;
    }

    if (!didSqueeze) {
      imgRow.push(img);
      remainingWidth -= desiredWidth;
    }
  }
};

window.addEventListener("resize", () => imageFlow(document.getElementById("gallery")));

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

document.getElementById("gallery").addEventListener("click", (e) => {
  if (e.target.nodeName === "IMG") {
    const fullSizeSrc = e.target.src.replace("/thumbs", "");
    lightboxImg.style.backgroundImage = `url("${fullSizeSrc}")`;
    lightbox.style.display = "flex";
  }
});

const closeLightbox = () => {
  lightbox.style.display = "none";
};

lightbox.addEventListener("click", (e) => {
    closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    closeLightbox();
  }
});