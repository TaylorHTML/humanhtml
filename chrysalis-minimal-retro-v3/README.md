# CHRYSALIS v3 — layout / interaction fixes

Fixed:
- hero title + GIF banner are locked to the center and can no longer be pushed sideways by the marquee
- photo lightbox is viewport-fixed and opening a photo preserves scroll position
- removed the tiny hanging booking-form border caused by the empty status row
- SEND REQUEST text now has an explicit dark color on mobile/Safari
- SEND REQUEST is pale green by default

# CHRYSALIS v2

Changes in this revision:

- frosted, semi-transparent fixed header
- vague hero links removed
- moving GIF marquee now lives directly under `DENVER DIY`
- all newly supplied GIFs are in the hero marquee
- the old `dance more` gallery GIF moved into that marquee
- calendar supports two public events on one date
- if a day has one event, the remaining slot can still be requested
- if a day has two events, it displays `[full]`
- individual event titles inside the calendar are clickable
- photo gallery is exactly 3 masonry columns on desktop, 2 on tablet, 1 on mobile
- demo gallery placeholders were redesigned without the grey line pattern
- removed Expected Attendance
- removed Production / Equipment Needs

## Replace the current Chrysalis folder

Use these files directly inside:

```text
humanhtml/
└── chrysalis/
    ├── index.html
    ├── styles.css
    ├── app.js
    └── assets/
```

Do not create another nested `chrysalis-minimal-retro-v2` folder.

## Google Calendar

The connection code is still in `app.js`.

Set:

```js
useGoogleCalendar: true
```

and add your test Calendar ID + browser-restricted Calendar API key.

The calendar UI is configured with:

```js
maxPublicEventsPerDay: 2
```

This does not prevent Google Calendar from containing more than two events; it controls how Chrysalis presents public booking capacity.

## Photos

Cloudinary support is unchanged.

When ready:

```js
photos: {
  source: "cloudinary",
  cloudName: "YOUR_REAL_CLOUD_NAME",
  tag: "chrysalis-gallery"
}
```

The venue can then upload and tag photos without editing GitHub.
