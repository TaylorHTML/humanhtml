const SITE_CONFIG = window.CHRYSALIS_CONFIG;

const galleryGrid = document.querySelector("#galleryGrid");
const galleryStatus = document.querySelector("#galleryStatus");
const galleryDialog = document.querySelector("#galleryDialog");
const galleryDialogImage = document.querySelector("#galleryDialogImage");
const galleryClose = document.querySelector("#galleryClose");
const galleryPrev = document.querySelector("#galleryPrev");
const galleryNext = document.querySelector("#galleryNext");

let galleryPhotos = [];
let currentPhotoIndex = 0;

document.querySelector("#year").textContent = new Date().getFullYear();

galleryClose.addEventListener("click", () => galleryDialog.close());
galleryPrev.addEventListener("click", event => {
  event.stopPropagation();
  showPhotoAtIndex(currentPhotoIndex - 1);
});
galleryNext.addEventListener("click", event => {
  event.stopPropagation();
  showPhotoAtIndex(currentPhotoIndex + 1);
});

galleryDialog.addEventListener("click", event => {
  const rect = galleryDialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (outside) galleryDialog.close();
});

document.addEventListener("keydown", event => {
  if (!galleryDialog.open) return;
  if (event.key === "ArrowLeft") showPhotoAtIndex(currentPhotoIndex - 1);
  if (event.key === "ArrowRight") showPhotoAtIndex(currentPhotoIndex + 1);
});

initGallery();

async function initGallery() {
  galleryPhotos = await loadPhotos();
  renderGallery();
}

async function loadPhotos() {
  if (SITE_CONFIG.photos.source !== "cloudinary") {
    galleryStatus.textContent =
      "demo gallery — connect Cloudinary when you're ready for real uploads.";

    return [
      makeDemoPhoto("SHOW NIGHT", 900, 1180, "#cbffbe", "#dfe6ff"),
      makeDemoPhoto("FRIENDS", 900, 720, "#f6d5ff", "#f8ffbd"),
      makeDemoPhoto("ART", 900, 1060, "#fff0a8", "#d9ffef"),
      makeDemoPhoto("LOUD ROOM", 900, 830, "#ffd9e5", "#d7e4ff"),
      makeDemoPhoto("AFTER", 900, 1240, "#dfffbd", "#fff3c7"),
      makeDemoPhoto("DENVER DIY", 900, 760, "#ccecff", "#f3d5ff"),
      makeDemoPhoto("SHOW TWO", 900, 980, "#f8d2bf", "#d6f0ff"),
      makeDemoPhoto("NIGHT TWO", 900, 1280, "#d9ffd0", "#edd8ff"),
      makeDemoPhoto("ROOM", 900, 800, "#fff6b9", "#ffddeb")
    ];
  }

  try {
    const { cloudName, tag } = SITE_CONFIG.photos;

    const url =
      `https://res.cloudinary.com/${encodeURIComponent(cloudName)}` +
      `/image/list/${encodeURIComponent(tag)}.json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Cloudinary returned ${response.status}`);
    }

    const data = await response.json();
    galleryStatus.textContent = "";

    return (data.resources || [])
      .sort((a, b) => (b.version || 0) - (a.version || 0))
      .map(resource => {
        const publicId = String(resource.public_id)
          .split("/")
          .map(encodeURIComponent)
          .join("/");

        const version = resource.version
          ? `v${resource.version}/`
          : "";

        return {
          id: resource.public_id,
          src:
            `https://res.cloudinary.com/${encodeURIComponent(cloudName)}` +
            `/image/upload/f_auto,q_auto:good,c_limit,w_1800/` +
            `${version}${publicId}.${resource.format}`,
          alt: resource.context?.custom?.alt || "Chrysalis venue photo"
        };
      });
  } catch (error) {
    console.error(error);
    galleryStatus.textContent =
      "photo feed unavailable. try again in a minute.";
    return [];
  }
}

function renderGallery() {
  if (!galleryPhotos.length) {
    galleryGrid.innerHTML = `<p class="empty-state">No photos posted yet.</p>`;
    return;
  }

  galleryGrid.innerHTML = galleryPhotos.map(photo => `
    <button
      class="photo-card"
      type="button"
      data-photo-id="${escapeHtml(photo.id)}"
      aria-label="Open venue photo"
    >
      <img
        src="${photo.src}"
        alt="${escapeHtml(photo.alt || "Chrysalis venue photo")}"
        loading="lazy"
      >
    </button>
  `).join("");

  galleryGrid.querySelectorAll("[data-photo-id]").forEach(button => {
    button.addEventListener("click", () => {
      const photo = galleryPhotos.find(
        item => item.id === button.dataset.photoId
      );

      if (!photo) return;

      currentPhotoIndex = galleryPhotos.findIndex(
        item => item.id === photo.id
      );

      showPhotoAtIndex(currentPhotoIndex);
      galleryDialog.showModal();
    });
  });
}

function showPhotoAtIndex(index) {
  if (!galleryPhotos.length) return;

  currentPhotoIndex =
    (index + galleryPhotos.length) % galleryPhotos.length;

  const photo = galleryPhotos[currentPhotoIndex];
  galleryDialogImage.src = photo.src;
  galleryDialogImage.alt = photo.alt || "Chrysalis venue photo";
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

function makeDemoPhoto(label, width, height, colorA, colorB) {
  const safe = String(label).replace(/[<>&"]/g, "");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorA}"/>
          <stop offset="100%" stop-color="${colorB}"/>
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="45"/>
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="${width * .25}" cy="${height * .26}" r="${width * .22}"
        fill="#fff" opacity=".55" filter="url(#blur)"/>
      <circle cx="${width * .75}" cy="${height * .63}" r="${width * .28}"
        fill="#fff" opacity=".34" filter="url(#blur)"/>
      <text x="42" y="${height - 42}" fill="#111"
        font-family="monospace" font-size="26">${safe}</text>
    </svg>
  `;

  return {
    id: `demo-${safe.toLowerCase().replace(/\W+/g, "-")}`,
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    alt: `Demo placeholder for ${safe}`
  };
}
