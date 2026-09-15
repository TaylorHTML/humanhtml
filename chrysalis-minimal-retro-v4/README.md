# CHRYSALIS v4

This revision adds the gallery architecture + latest art-direction changes.

## Changed
- removed the two border lines around the animated GIF banner
- added the peace + Earth GIFs to the banner
- chain GIFs now act as visual breaks between page sections
- removed `BOOK SOMETHING WEIRD`
- fixed mobile CHRYSALIS title clipping by reducing/locking the mobile hero type
- index page no longer renders the entire archive
- index page has a 3-photo preview carousel + `VIEW FULL GALLERY`
- new `gallery.html` page contains the complete masonry archive
- gallery is 3 columns desktop, 2 tablet, 1 mobile
- `config.js` is shared by index + gallery so Cloudinary only needs to be configured once

## Folder
Replace the contents of `humanhtml/chrysalis/` with this build:

```text
chrysalis/
├── index.html
├── gallery.html
├── styles.css
├── config.js
├── app.js
├── gallery.js
└── assets/
```

## Cloudinary
When ready, edit only `config.js`:

```js
photos: {
  source: "cloudinary",
  cloudName: "YOUR_REAL_CLOUD_NAME",
  tag: "chrysalis-gallery"
}
```

Both the index carousel and the full gallery page will then use the same Cloudinary feed.
