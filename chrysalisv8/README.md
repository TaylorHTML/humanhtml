# CHRYSALIS v8

Latest changes:
- radioactive GIF now sits ABOVE “welcome to the website of”
- GIF banner moves LEFT by default
- hover reverses the banner RIGHT
- on touch/mobile, tapping toggles LEFT / RIGHT
- mobile chain spacers show one centered chain only

# CHRYSALIS v6

GIF-banner behavior fix:
- banner no longer uses a CSS transform animation on the entire GIF strip
- it now scrolls with `scrollLeft` via requestAnimationFrame, which is more reliable for animated GIF repainting in Safari/iOS
- banner GIFs are marked eager/high-priority
- hovering the banner reverses direction instead of pausing
- on touch devices, tapping the banner flips direction

# CHRYSALIS v5

Styling cleanup:
- tightened hero spacing so the mobile homepage no longer has the huge blank gap before Calendar
- mobile section descriptions align with the section title, not the green section number
- removed section divider rules above the chain GIF spacers
- photo preview copy is now `A few snapshots from the archive.`
- removed the `demo gallery — connect Cloudinary...` text from index + gallery
- moved the booking skull GIF into the animated banner
- removed the booking-side skull block entirely
- added the radioactive GIF centered above `CHRYSALIS`

Backend configuration is unchanged.


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
