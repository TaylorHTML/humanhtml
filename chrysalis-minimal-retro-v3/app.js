/* ==========================================================
   CHRYSALIS — SITE CONFIG
   ========================================================== */

const SITE_CONFIG = {
  calendar: {
    useGoogleCalendar: false,
    calendarId: "YOUR_PUBLIC_CALENDAR_ID",
    apiKey: "YOUR_BROWSER_RESTRICTED_GOOGLE_API_KEY",

    // Chrysalis sometimes has a daytime event and a nighttime event.
    maxPublicEventsPerDay: 2
  },

  photos: {
    source: "demo", // "demo" or "cloudinary"
    cloudName: "YOUR_CLOUDINARY_CLOUD_NAME",
    tag: "chrysalis-gallery"
  }
};

/* ==========================================================
   SAMPLE EVENTS
   Two sample events intentionally share one day so the
   two-events-per-day calendar behavior is visible in the demo.
   ========================================================== */

const SAMPLE_EVENTS = [
  {
    id: "sample-1",
    title: "DAY ART MARKET",
    start: isoForRelativeDate(3, 13, 0),
    end: isoForRelativeDate(3, 17, 0),
    description: "Demo daytime event.",
    flyer: ""
  },
  {
    id: "sample-2",
    title: "LOCAL SHOW // THREE BANDS",
    start: isoForRelativeDate(3, 20, 0),
    end: isoForRelativeDate(3, 23, 0),
    description: "Demo nighttime event on the same date.",
    flyer: ""
  },
  {
    id: "sample-3",
    title: "ART NIGHT",
    start: isoForRelativeDate(10, 18, 30),
    end: isoForRelativeDate(10, 21, 30),
    description: "Art, objects, sound, people.",
    flyer: ""
  },
  {
    id: "sample-4",
    title: "COMEDY / NOISE / ???",
    start: isoForRelativeDate(18, 19, 30),
    end: isoForRelativeDate(18, 22, 0),
    description: "Another demo event.",
    flyer: ""
  }
];

/* ==========================================================
   DEMO PHOTO DATA
   Cleaner placeholder art: no grey line lattice.
   ========================================================== */

const DEMO_PHOTOS = [
  makeDemoPhoto("SHOW NIGHT", 900, 1180, "#cbffbe", "#dfe6ff"),
  makeDemoPhoto("FRIENDS", 900, 720, "#f6d5ff", "#f8ffbd"),
  makeDemoPhoto("ART", 900, 1060, "#fff0a8", "#d9ffef"),
  makeDemoPhoto("LOUD ROOM", 900, 830, "#ffd9e5", "#d7e4ff"),
  makeDemoPhoto("AFTER", 900, 1240, "#dfffbd", "#fff3c7"),
  makeDemoPhoto("DENVER DIY", 900, 760, "#ccecff", "#f3d5ff")
];

/* ==========================================================
   ELEMENTS + STATE
   ========================================================== */

const calendarTitle = document.querySelector("#calendarTitle");
const calendarGrid = document.querySelector("#calendarGrid");
const eventsList = document.querySelector("#eventsList");
const preferredDate = document.querySelector("#preferredDate");

const eventDialog = document.querySelector("#eventDialog");
const closeEventDialog = document.querySelector("#closeEventDialog");
const dialogDate = document.querySelector("#dialogDate");
const dialogFlyer = document.querySelector("#dialogFlyer");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogMeta = document.querySelector("#dialogMeta");
const dialogDescription = document.querySelector("#dialogDescription");

const photoGallery = document.querySelector("#photoGallery");
const photoStatus = document.querySelector("#photoStatus");
const photoDialog = document.querySelector("#photoDialog");
const photoDialogImage = document.querySelector("#photoDialogImage");
const closePhotoDialog = document.querySelector("#closePhotoDialog");
const prevPhoto = document.querySelector("#prevPhoto");
const nextPhoto = document.querySelector("#nextPhoto");

const bookingForm = document.querySelector("#bookingForm");
const bookingSubmit = document.querySelector("#bookingSubmit");
const bookingStatus = document.querySelector("#bookingStatus");

let allEvents = [];
let galleryPhotos = [];
let currentMonth = startOfMonth(new Date());
let currentPhotoIndex = 0;

/* ==========================================================
   UI EVENTS
   ========================================================== */

document.querySelector("#year").textContent = new Date().getFullYear();

document.querySelector("#prevMonth").addEventListener("click", () => {
  currentMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    1
  );
  renderCalendar();
});

document.querySelector("#nextMonth").addEventListener("click", () => {
  currentMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    1
  );
  renderCalendar();
});

document.querySelector("#todayBtn").addEventListener("click", () => {
  currentMonth = startOfMonth(new Date());
  renderCalendar();
});

closeEventDialog.addEventListener("click", () => eventDialog.close());
closePhotoDialog.addEventListener("click", () => photoDialog.close());

eventDialog.addEventListener("click", event => {
  if (clickedOutsideDialog(event, eventDialog)) eventDialog.close();
});

photoDialog.addEventListener("click", event => {
  if (clickedOutsideDialog(event, photoDialog)) photoDialog.close();
});

prevPhoto.addEventListener("click", event => {
  event.stopPropagation();
  showPreviousPhoto();
});

nextPhoto.addEventListener("click", event => {
  event.stopPropagation();
  showNextPhoto();
});

document.addEventListener("keydown", event => {
  if (!photoDialog.open) return;
  if (event.key === "ArrowLeft") showPreviousPhoto();
  if (event.key === "ArrowRight") showNextPhoto();
});

bookingForm.addEventListener("submit", submitBookingForm);

init();

/* ==========================================================
   INIT
   ========================================================== */

async function init() {
  allEvents = await loadEvents();
  renderCalendar();
  renderUpcomingEvents();

  galleryPhotos = await loadPhotos();
  renderPhotos();
}

/* ==========================================================
   EVENTS / GOOGLE CALENDAR
   ========================================================== */

async function loadEvents() {
  if (!SITE_CONFIG.calendar.useGoogleCalendar) {
    return SAMPLE_EVENTS;
  }

  try {
    return await fetchGoogleCalendarEvents();
  } catch (error) {
    console.error("Google Calendar failed:", error);
    return SAMPLE_EVENTS;
  }
}

async function fetchGoogleCalendarEvents() {
  const { calendarId, apiKey } = SITE_CONFIG.calendar;

  if (
    !calendarId ||
    calendarId.includes("YOUR_") ||
    !apiKey ||
    apiKey.includes("YOUR_")
  ) {
    throw new Error("Google Calendar settings are incomplete.");
  }

  const now = new Date();
  const timeMin = new Date(now.getFullYear() - 1, 0, 1).toISOString();
  const timeMax = new Date(
    now.getFullYear() + 2,
    11,
    31,
    23,
    59,
    59
  ).toISOString();

  const params = new URLSearchParams({
    key: apiKey,
    singleEvents: "true",
    orderBy: "startTime",
    timeMin,
    timeMax
  });

  const url =
    "https://www.googleapis.com/calendar/v3/calendars/" +
    `${encodeURIComponent(calendarId)}/events?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Google Calendar returned ${response.status}`);
  }

  const data = await response.json();

  return (data.items || [])
    .filter(item => item.status !== "cancelled")
    .map(item => ({
      id: item.id,
      title: item.summary || "UNTITLED EVENT",
      start: item.start?.dateTime || item.start?.date,
      end: item.end?.dateTime || item.end?.date || "",
      description: cleanCalendarDescription(item.description || ""),
      flyer: extractFlyerUrl(item.description || "")
    }));
}

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const maxEvents = SITE_CONFIG.calendar.maxPublicEventsPerDay || 2;

  calendarTitle.textContent = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(currentMonth);

  calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayEvents = eventsOnDate(date)
      .sort((a, b) => parseEventDate(a.start) - parseEventDate(b.start));

    const inCurrentMonth = date.getMonth() === month;
    const isFuture = date >= stripTime(new Date());
    const slotsLeft = Math.max(0, maxEvents - dayEvents.length);

    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.setAttribute("role", "gridcell");

    if (!inCurrentMonth) cell.classList.add("outside-month");
    if (isSameDate(date, new Date())) cell.classList.add("is-today");
    if (dayEvents.length) cell.classList.add("has-event");
    if (dayEvents.length >= maxEvents) cell.classList.add("is-full");

    const eventButtons = dayEvents.slice(0, maxEvents).map(event => `
      <button
        class="calendar-event-chip"
        type="button"
        data-event-id="${escapeHtml(event.id)}"
      >
        ${escapeHtml(event.title)}
      </button>
    `).join("");

    let availability = "";

    if (inCurrentMonth && isFuture && slotsLeft > 0) {
      availability = `
        <button
          class="request-slot"
          type="button"
          data-request-date="${formatDateKey(date)}"
        >
          ${dayEvents.length === 0 ? "[open]" : "[request another slot]"}
        </button>
      `;
    } else if (inCurrentMonth && dayEvents.length >= maxEvents) {
      availability = `<span class="full-label">[full]</span>`;
    }

    cell.innerHTML = `
      <span class="day-number">${date.getDate()}</span>
      ${eventButtons}
      ${availability}
    `;

    cell.querySelectorAll("[data-event-id]").forEach(button => {
      button.addEventListener("click", () => {
        const event = allEvents.find(item => item.id === button.dataset.eventId);
        if (event) openEvent(event);
      });
    });

    const requestButton = cell.querySelector("[data-request-date]");
    if (requestButton) {
      requestButton.addEventListener("click", () => {
        preferredDate.value = requestButton.dataset.requestDate;

        document.querySelector("#booking").scrollIntoView({
          behavior: "smooth"
        });

        window.setTimeout(() => {
          preferredDate.focus({ preventScroll: true });
        }, 400);
      });
    }

    calendarGrid.appendChild(cell);
  }
}

function renderUpcomingEvents() {
  const now = stripTime(new Date());

  const upcoming = [...allEvents]
    .filter(event => parseEventDate(event.start) >= now)
    .sort((a, b) => parseEventDate(a.start) - parseEventDate(b.start))
    .slice(0, 10);

  if (!upcoming.length) {
    eventsList.innerHTML =
      `<p class="empty-state">&gt; no public events posted yet</p>`;
    return;
  }

  eventsList.innerHTML = upcoming.map(event => {
    const start = parseEventDate(event.start);

    return `
      <article class="event-row">
        <div class="event-date">
          ${new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          }).format(start)}
        </div>

        <button
          class="event-title"
          type="button"
          data-event-id="${escapeHtml(event.id)}"
        >
          ${escapeHtml(event.title)}
        </button>

        <div class="event-time">${formatTimeOrAllDay(event.start)}</div>
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
  const start = parseEventDate(event.start);
  const end = event.end ? parseEventDate(event.end) : null;

  dialogDate.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(start);

  dialogTitle.textContent = event.title;

  if (isAllDayValue(event.start)) {
    dialogMeta.textContent = "all day";
  } else if (end) {
    dialogMeta.textContent = `${formatTime(start)} — ${formatTime(end)}`;
  } else {
    dialogMeta.textContent = formatTime(start);
  }

  dialogDescription.textContent =
    event.description || "No additional information posted.";

  if (event.flyer) {
    dialogFlyer.src = event.flyer;
    dialogFlyer.alt = `Flyer for ${event.title}`;
    dialogFlyer.hidden = false;
  } else {
    dialogFlyer.src = "";
    dialogFlyer.alt = "";
    dialogFlyer.hidden = true;
  }

  eventDialog.showModal();
}

function eventsOnDate(date) {
  return allEvents.filter(event =>
    isSameDate(parseEventDate(event.start), date)
  );
}

/* ==========================================================
   PHOTOS / CLOUDINARY
   ========================================================== */

async function loadPhotos() {
  if (SITE_CONFIG.photos.source !== "cloudinary") {
    photoStatus.textContent =
      "demo gallery — connect Cloudinary when you're ready for real uploads.";
    return DEMO_PHOTOS;
  }

  try {
    const photos = await fetchCloudinaryPhotos();

    if (!photos.length) {
      photoStatus.textContent = "no gallery photos uploaded yet.";
      return [];
    }

    photoStatus.textContent = "";
    return photos;
  } catch (error) {
    console.error("Cloudinary failed:", error);
    photoStatus.textContent =
      "photo feed unavailable — showing demo images instead.";
    return DEMO_PHOTOS;
  }
}

async function fetchCloudinaryPhotos() {
  const { cloudName, tag } = SITE_CONFIG.photos;

  if (!cloudName || cloudName.includes("YOUR_")) {
    throw new Error("Cloudinary Cloud Name is missing.");
  }

  const url =
    `https://res.cloudinary.com/${encodeURIComponent(cloudName)}` +
    `/image/list/${encodeURIComponent(tag)}.json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Cloudinary returned ${response.status}`);
  }

  const data = await response.json();

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
}

function renderPhotos() {
  if (!galleryPhotos.length) {
    photoGallery.innerHTML =
      `<p class="empty-state">No photos posted yet.</p>`;
    return;
  }

  photoGallery.innerHTML = galleryPhotos.map(photo => `
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

  photoGallery.querySelectorAll("[data-photo-id]").forEach(button => {
    button.addEventListener("click", () => {
      const photo = galleryPhotos.find(
        item => item.id === button.dataset.photoId
      );

      if (photo) openPhoto(photo);
    });
  });
}

function openPhoto(photo) {
  const scrollBeforeOpen = window.scrollY;

  currentPhotoIndex = galleryPhotos.findIndex(item => item.id === photo.id);
  showPhotoAtIndex(currentPhotoIndex);
  photoDialog.showModal();

  // Some browsers move the document when a dialog receives focus.
  // Keep the page exactly where the user clicked the photo.
  requestAnimationFrame(() => {
    window.scrollTo({
      top: scrollBeforeOpen,
      left: 0,
      behavior: "auto"
    });
  });
}

function showPhotoAtIndex(index) {
  if (!galleryPhotos.length) return;

  currentPhotoIndex =
    (index + galleryPhotos.length) % galleryPhotos.length;

  const photo = galleryPhotos[currentPhotoIndex];
  photoDialogImage.src = photo.src;
  photoDialogImage.alt = photo.alt || "Chrysalis venue photo";
}

function showPreviousPhoto() {
  showPhotoAtIndex(currentPhotoIndex - 1);
}

function showNextPhoto() {
  showPhotoAtIndex(currentPhotoIndex + 1);
}

/* ==========================================================
   BOOKING / FORMSPREE
   ========================================================== */

async function submitBookingForm(event) {
  event.preventDefault();

  if (!bookingForm.reportValidity()) return;

  bookingSubmit.disabled = true;
  bookingSubmit.textContent = "SENDING...";
  bookingStatus.textContent = "";
  bookingStatus.className = "booking-status full";

  try {
    const response = await fetch(bookingForm.action, {
      method: "POST",
      body: new FormData(bookingForm),
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Booking form returned ${response.status}`);
    }

    bookingForm.reset();
    bookingStatus.textContent =
      "REQUEST RECEIVED. Chrysalis will follow up if the date / event is a fit.";
    bookingStatus.classList.add("success");
  } catch (error) {
    console.error(error);
    bookingStatus.textContent =
      "Something went wrong. Please try again or contact Chrysalis directly.";
    bookingStatus.classList.add("error");
  } finally {
    bookingSubmit.disabled = false;
    bookingSubmit.textContent = "SEND REQUEST";
  }
}

/* ==========================================================
   HELPERS
   ========================================================== */

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function stripTime(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseEventDate(value) {
  if (isAllDayValue(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(value);
}

function isAllDayValue(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatTimeOrAllDay(value) {
  if (isAllDayValue(value)) return "all day";
  return formatTime(parseEventDate(value));
}

function isoForRelativeDate(daysFromToday, hour, minute) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function extractFlyerUrl(description = "") {
  const match =
    description.match(/\[flyer:\s*(https?:\/\/[^\]\s]+)\s*\]/i);

  return match ? match[1] : "";
}

function cleanCalendarDescription(description = "") {
  return description
    .replace(/\[flyer:\s*(https?:\/\/[^\]\s]+)\s*\]/gi, "")
    .trim();
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

function clickedOutsideDialog(event, dialog) {
  const rect = dialog.getBoundingClientRect();

  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
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

      <circle
        cx="${width * .25}"
        cy="${height * .26}"
        r="${width * .22}"
        fill="#ffffff"
        opacity=".55"
        filter="url(#blur)"
      />

      <circle
        cx="${width * .75}"
        cy="${height * .63}"
        r="${width * .28}"
        fill="#ffffff"
        opacity=".34"
        filter="url(#blur)"
      />

      <text
        x="42"
        y="${height - 42}"
        fill="#111111"
        font-family="monospace"
        font-size="26"
      >${safe}</text>
    </svg>
  `;

  return {
    id: `demo-${safe.toLowerCase().replace(/\W+/g, "-")}`,
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    alt: `Demo placeholder for ${safe}`
  };
}
