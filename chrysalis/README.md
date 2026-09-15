# CHRYSALIS — minimal retro demo

Use this at:

`https://humanhtml.com/chrysalis/`

## What changed

- white background
- subtle animated gradient haze
- much more minimal composition
- old-web / GeoCities-inspired link + GIF language
- all supplied GIFs included
- hero: **CHRYSALIS** with **DENVER DIY**
- Calendar
- Upcoming Events
- Photo Gallery
- Booking
- About
- responsive mobile layout

## Install

Replace the contents of your existing `humanhtml/chrysalis/` folder with:

```text
chrysalis/
├── index.html
├── styles.css
├── app.js
└── assets/
    ├── radioactive.gif
    ├── chain.gif
    ├── dancemore.gif
    ├── speakerleft.gif
    ├── speakerright.gif
    ├── skull.gif
    ├── techno.gif
    └── dancingsmiley.gif
```

No extra nested folder.

## Google Calendar

Open `app.js` and find:

```js
calendar: {
  useGoogleCalendar: false,
  calendarId: "YOUR_PUBLIC_CALENDAR_ID",
  apiKey: "YOUR_BROWSER_RESTRICTED_GOOGLE_API_KEY"
}
```

For your test:

1. Create a separate test calendar in Google Calendar.
2. Make that calendar public and allow public viewers to see event details.
3. Copy its Calendar ID from **Settings → Integrate calendar**.
4. In Google Cloud, enable **Google Calendar API**.
5. Create an API key.
6. Restrict the key to websites / HTTP referrers.
7. Allow `https://humanhtml.com/*`.
8. Restrict the key to Google Calendar API.
9. Put the ID + key in `app.js`.
10. Set `useGoogleCalendar: true`.

The same feed powers the monthly Calendar and Upcoming Events.

For an event flyer, put this in the Google Calendar event description:

```text
[flyer: https://example.com/flyer.jpg]
```

## Photo uploads

Best practical workflow for this static site: **Cloudinary**.

Staff only needs to:

```text
upload photo → tag "chrysalis-gallery" → done
```

To turn it on:

```js
photos: {
  source: "cloudinary",
  cloudName: "YOUR_REAL_CLOUD_NAME",
  tag: "chrysalis-gallery"
}
```

Cloudinary's public Resource List delivery must be allowed in its Security settings.

Do not put an API secret in the site.

If you want everything under Google later, Firebase Storage is a better image backend than Google Drive.

## Booking

The demo keeps your working Formspree endpoint and now submits with AJAX, so users remain on the Chrysalis page after clicking Send.

For final production:

- simplest: keep Formspree and move it to a Chrysalis-owned account / verified email
- Google-first alternative: Apps Script → Google Sheet → email notification
