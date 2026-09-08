/*
  VENUE-TEST-01
  Internet 1.0 styled Chrysalis venue prototype.

  This demo uses sample data by default.

  GOOGLE CALENDAR:
  - Create a PUBLIC calendar containing only public-facing event information.
  - Set USE_GOOGLE_CALENDAR to true.
  - Add the public calendar ID and a browser-restricted Google API key.

  FORMSPREE:
  - Replace YOUR_FORM_ID in index.html with the ID from your form endpoint.
*/

const USE_GOOGLE_CALENDAR = false;


/*
  PHOTO ARCHIVE

  Right now this uses demo images generated in the browser so the gallery works
  immediately without needing image files.

  Later, each `src` can be replaced by a Cloudinary URL. We can also replace
  this sample array entirely with photos fetched from a managed image service.
*/
const SAMPLE_PHOTOS = [
  {
    id: "photo-1",
    src: makeDemoPhoto("SHOW NIGHT", "#ff4fd8", "#050505"),
    alt: "Demo placeholder for a live show photo",
    caption: "SHOW NIGHT",
    date: "PHOTO ARCHIVE"
  },
  {
    id: "photo-2",
    src: makeDemoPhoto("LOCAL ART", "#43f7ff", "#050505"),
    alt: "Demo placeholder for a local art event photo",
    caption: "LOCAL ART",
    date: "PHOTO ARCHIVE"
  },
  {
    id: "photo-3",
    src: makeDemoPhoto("LOUD ROOM", "#d7ff00", "#050505"),
    alt: "Demo placeholder for a packed venue photo",
    caption: "LOUD ROOM",
    date: "PHOTO ARCHIVE"
  },
  {
    id: "photo-4",
    src: makeDemoPhoto("BACKSTAGE", "#f3f1df", "#050505"),
    alt: "Demo placeholder for a backstage photo",
    caption: "BACKSTAGE",
    date: "PHOTO ARCHIVE"
  },
  {
    id: "photo-5",
    src: makeDemoPhoto("FRIENDS", "#ff3d2e", "#050505"),
    alt: "Demo placeholder for a community event photo",
    caption: "FRIENDS + CHAOS",
    date: "PHOTO ARCHIVE"
  },
  {
    id: "photo-6",
    src: makeDemoPhoto("CHRYSALIS", "#b8b8ad", "#050505"),
    alt: "Demo placeholder for a Chrysalis venue photo",
    caption: "CHRYSALIS",
    date: "PHOTO ARCHIVE"
  }
];


const GOOGLE_CALENDAR_ID = "YOUR_PUBLIC_CALENDAR_ID";
const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";

const today = new Date();

const SAMPLE_EVENTS = [
  {
    id: "sample-1",
    title: "NOISE NIGHT",
    start: isoForRelativeDate(3, 20, 0),
    end: isoForRelativeDate(3, 23, 0),
    description: "Three local acts. Doors at 7:30 PM.",
    flyer: makeDemoFlyer("NOISE NIGHT", "#ff4fd8", "#050505")
  },
  {
    id: "sample-2",
    title: "COMMUNITY ART SHOW",
    start: isoForRelativeDate(10, 18, 0),
    end: isoForRelativeDate(10, 21, 0),
    description: "Local art, strange objects, snacks, friends.",
    flyer: makeDemoFlyer("ART SHOW", "#43f7ff", "#050505")
  },
  {
    id: "sample-3",
    title: "COMEDY NIGHT",
    start: isoForRelativeDate(18, 19, 30),
    end: isoForRelativeDate(18, 22, 0),
    description: "Local stand-up showcase.",
    flyer: makeDemoFlyer("COMEDY", "#d7ff00", "#050505")
  }
];

let currentMonth = startOfMonth(new Date());
let allEvents = [];

const calendarTitle = document.querySelector("#calendarTitle");
const calendarGrid = document.querySelector("#calendarGrid");
const eventsList = document.querySelector("#eventsList");
const preferredDate = document.querySelector("#preferredDate");

const photoGallery = document.querySelector("#photoGallery");
const photoDialog = document.querySelector("#photoDialog");
const photoDialogImage = document.querySelector("#photoDialogImage");
const prevPhoto = document.querySelector("#prevPhoto");
const nextPhoto = document.querySelector("#nextPhoto");
let currentPhotoIndex = 0;

const eventDialog = document.querySelector("#eventDialog");
const dialogDate = document.querySelector("#dialogDate");
const dialogFlyer = document.querySelector("#dialogFlyer");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogMeta = document.querySelector("#dialogMeta");
const dialogDescription = document.querySelector("#dialogDescription");

document.querySelector("#year").textContent = new Date().getFullYear();

function updateClock() {
  const now = new Date();
  document.querySelector("#clock").textContent =
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

updateClock();
setInterval(updateClock, 30000);

document.querySelector("#prevMonth").addEventListener("click", () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  render();
});

document.querySelector("#nextMonth").addEventListener("click", () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  render();
});

document.querySelector("#todayBtn").addEventListener("click", () => {
  currentMonth = startOfMonth(new Date());
  render();
});

document.querySelector("#closeDialog").addEventListener("click", () => {
  eventDialog.close();
});



document.querySelector("#closePhotoDialog").addEventListener("click", () => {
  photoDialog.close();
});

photoDialog.addEventListener("click", (event) => {
  const rect = photoDialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (outside) photoDialog.close();
});

prevPhoto.addEventListener("click", showPreviousPhoto);
nextPhoto.addEventListener("click", showNextPhoto);

document.addEventListener("keydown", (event) => {
  if (!photoDialog.open) return;

  if (event.key === "ArrowLeft") {
    showPreviousPhoto();
  }

  if (event.key === "ArrowRight") {
    showNextPhoto();
  }
});


eventDialog.addEventListener("click", (event) => {
  const rect = eventDialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (outside) eventDialog.close();
});

init();

async function init() {
  try {
    allEvents = USE_GOOGLE_CALENDAR
      ? await fetchGoogleCalendarEvents()
      : SAMPLE_EVENTS;

    render();
    renderPhotos();
  } catch (error) {
    console.error(error);
    calendarGrid.innerHTML =
      `<p style="grid-column:1/-1;padding:1rem;color:#d7ff00;">!!! COULD NOT LOAD EVENTS !!!</p>`;
  }
}

function render() {
  renderCalendar();
  renderEventsList();
}

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  calendarTitle.textContent = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(currentMonth).toUpperCase();

  calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayEvents = eventsOnDate(date);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.setAttribute("role", "gridcell");

    if (date.getMonth() !== month) {
      button.classList.add("outside-month");
    }

    if (isSameDate(date, new Date())) {
      button.classList.add("is-today");
    }

    if (dayEvents.length) {
      button.classList.add("has-event");
    }

    button.innerHTML = `
      <span class="day-number">${date.getDate()}</span>
      ${dayEvents.slice(0, 2).map(event =>
        `<span class="day-event">${escapeHtml(event.title)}</span>`
      ).join("")}
      ${dayEvents.length === 0 && date >= stripTime(new Date())
        ? `<span class="open-label">[OPEN]</span>`
        : ""}
    `;

    button.setAttribute(
      "aria-label",
      `${new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(date)}${
        dayEvents.length
          ? `, ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}`
          : ", open to requests"
      }`
    );

    button.addEventListener("click", () => {
      if (dayEvents.length) {
        openEvent(dayEvents[0]);
      } else if (date >= stripTime(new Date())) {
        preferredDate.value = formatDateKey(date);
        document.querySelector("#book").scrollIntoView({ behavior: "smooth" });
        preferredDate.focus({ preventScroll: true });
      }
    });

    calendarGrid.appendChild(button);
  }
}

function renderEventsList() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthEvents = allEvents
    .filter(event => {
      const date = new Date(event.start);
      return date.getFullYear() === year && date.getMonth() === month;
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  if (!monthEvents.length) {
    eventsList.innerHTML = `<p>&gt;&gt; no public events posted for this month yet</p>`;
    return;
  }

  eventsList.innerHTML = monthEvents.map(event => {
    const start = new Date(event.start);
    const hasFlyer = Boolean(event.flyer);

    return `
      <article class="event-row ${hasFlyer ? "with-flyer" : ""}">
        ${hasFlyer
          ? `<button
              class="event-flyer-button"
              type="button"
              data-event-id="${event.id}"
              aria-label="Open ${escapeHtml(event.title)} event details"
            >
              <img
                class="event-list-flyer"
                src="${event.flyer}"
                alt="Flyer for ${escapeHtml(event.title)}"
                loading="lazy"
              >
            </button>`
          : ""}

        <div class="event-date">
          ${new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric"
          }).format(start).toUpperCase()}
        </div>

        <button class="event-title" type="button" data-event-id="${event.id}">
          ${escapeHtml(event.title)}
        </button>

        <div class="event-time">
          ${new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit"
          }).format(start)}
        </div>
      </article>
    `;
  }).join("");

  eventsList.querySelectorAll("[data-event-id]").forEach(button => {
    button.addEventListener("click", () => {
      const event = allEvents.find(item => item.id === button.dataset.eventId);
      if (event) openEvent(event);
    });
  });
}

function openEvent(event) {
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;

  dialogDate.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(start).toUpperCase();

  if (event.flyer) {
    dialogFlyer.src = event.flyer;
    dialogFlyer.alt = `Flyer for ${event.title}`;
    dialogFlyer.hidden = false;
  } else {
    dialogFlyer.src = "";
    dialogFlyer.alt = "";
    dialogFlyer.hidden = true;
  }

  dialogTitle.textContent = event.title;

  dialogMeta.textContent = end
    ? `${formatTime(start)} - ${formatTime(end)}`
    : formatTime(start);

  dialogDescription.textContent = event.description || "";
  eventDialog.showModal();
}

function eventsOnDate(date) {
  return allEvents.filter(event => isSameDate(new Date(event.start), date));
}

async function fetchGoogleCalendarEvents() {
  const now = new Date();
  const timeMin = new Date(now.getFullYear() - 1, 0, 1).toISOString();
  const timeMax = new Date(now.getFullYear() + 2, 11, 31, 23, 59, 59).toISOString();

  const params = new URLSearchParams({
    key: GOOGLE_API_KEY,
    singleEvents: "true",
    orderBy: "startTime",
    timeMin,
    timeMax
  });

  const url =
    `https://www.googleapis.com/calendar/v3/calendars/` +
    `${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Google Calendar returned ${response.status}`);
  }

  const data = await response.json();

  return (data.items || []).map(item => ({
    id: item.id,
    title: item.summary || "UNTITLED EVENT",
    start: item.start?.dateTime || item.start?.date,
    end: item.end?.dateTime || item.end?.date,
    description: item.description || "",
    flyer: extractFlyerUrl(item.description || "")
  }));
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function isoForRelativeDate(daysFromToday, hour, minute) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}


function renderPhotos() {
  if (!photoGallery) return;

  photoGallery.innerHTML = SAMPLE_PHOTOS.map(photo => `
    <button
      class="photo-card"
      type="button"
      data-photo-id="${photo.id}"
      aria-label="Open photo: ${escapeHtml(photo.caption)}"
    >
      <img src="${photo.src}" alt="${escapeHtml(photo.alt)}" loading="lazy">
    </button>
  `).join("");

  photoGallery.querySelectorAll("[data-photo-id]").forEach(button => {
    button.addEventListener("click", () => {
      const photo = SAMPLE_PHOTOS.find(item => item.id === button.dataset.photoId);
      if (photo) openPhoto(photo);
    });
  });
}

function openPhoto(photo) {
  currentPhotoIndex = SAMPLE_PHOTOS.findIndex(item => item.id === photo.id);
  showPhotoAtIndex(currentPhotoIndex);
  photoDialog.showModal();
}

function showPhotoAtIndex(index) {
  const total = SAMPLE_PHOTOS.length;
  currentPhotoIndex = (index + total) % total;

  const photo = SAMPLE_PHOTOS[currentPhotoIndex];
  photoDialogImage.src = photo.src;
  photoDialogImage.alt = photo.alt || "Venue photo";
}

function showPreviousPhoto() {
  showPhotoAtIndex(currentPhotoIndex - 1);
}

function showNextPhoto() {
  showPhotoAtIndex(currentPhotoIndex + 1);
}

function makeDemoPhoto(label, foreground, background) {
  const safeLabel = String(label).replace(/[<>&"]/g, "");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="675" viewBox="0 0 900 675">
      <rect width="900" height="675" fill="${background}"/>
      <g opacity=".18" stroke="${foreground}" stroke-width="2">
        ${Array.from({length: 22}, (_, i) =>
          `<line x1="${i * 45}" y1="0" x2="${900 - i * 25}" y2="675"/>`
        ).join("")}
      </g>
      <rect x="45" y="45" width="810" height="585" fill="none" stroke="${foreground}" stroke-width="8"/>
      <text x="450" y="315" text-anchor="middle" fill="${foreground}"
        font-family="monospace" font-size="74" font-weight="bold">${safeLabel}</text>
      <text x="450" y="385" text-anchor="middle" fill="${foreground}"
        font-family="monospace" font-size="28">PHOTO GOES HERE</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}


function extractFlyerUrl(description = "") {
  const match = description.match(/\[flyer:\s*(https?:\/\/[^\]\s]+)\s*\]/i);
  return match ? match[1] : "";
}

function makeDemoFlyer(title, foreground, background) {
  const safeTitle = String(title).replace(/[<>&"]/g, "");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <rect width="900" height="1200" fill="${background}"/>
      <rect x="48" y="48" width="804" height="1104" fill="none" stroke="${foreground}" stroke-width="10"/>
      <g opacity=".18" stroke="${foreground}" stroke-width="3">
        ${Array.from({length: 20}, (_, i) =>
          `<line x1="${i * 50}" y1="0" x2="${900 - i * 22}" y2="1200"/>`
        ).join("")}
      </g>
      <text x="450" y="485" text-anchor="middle" fill="${foreground}"
        font-family="monospace" font-size="76" font-weight="bold">${safeTitle}</text>
      <text x="450" y="575" text-anchor="middle" fill="${foreground}"
        font-family="monospace" font-size="31">LIVE AT CHRYSALIS</text>
      <text x="450" y="1040" text-anchor="middle" fill="${foreground}"
        font-family="monospace" font-size="25">DEMO FLYER</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}


/* ------------------------------------------------------------
   CHRYSALIS / HUMANHTML VISUAL LAYER
------------------------------------------------------------ */

const chrysalisRoot = document.documentElement;
const pointerReadout = document.querySelector("#pointerReadout");
const viewportReadout = document.querySelector("#viewportReadout");

function formatSigned(value) {
  const rounded = Math.round(value);
  return `${rounded >= 0 ? "+" : ""}${String(rounded).padStart(3, "0")}`;
}

function updateViewportReadout() {
  if (!viewportReadout) return;
  viewportReadout.textContent =
    `${String(window.innerWidth).padStart(4, "0")} × ${String(window.innerHeight).padStart(4, "0")}`;
}

window.addEventListener("pointermove", (event) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const x = ((event.clientX - cx) / cx) * 100;
  const y = ((event.clientY - cy) / cy) * 100;

  chrysalisRoot.style.setProperty("--mx", x.toFixed(2));
  chrysalisRoot.style.setProperty("--my", y.toFixed(2));

  if (pointerReadout) {
    pointerReadout.textContent = `x:${formatSigned(x)} y:${formatSigned(y)}`;
  }
});

window.addEventListener("resize", updateViewportReadout);
updateViewportReadout();
