const coords = document.getElementById("coords");
const viewport = document.getElementById("viewport");
const lastModified = document.getElementById("lastModified");
const cubeWrapper = document.getElementById("cubeWrapper");
const objectStage = document.getElementById("objectStage");
const objectReadout = document.getElementById("objectReadout");
const pageGlow = document.getElementById("pageGlow");


function paddedSigned(value) {
  const rounded = Math.round(value);
  const sign = rounded >= 0 ? "+" : "-";

  return `${sign}${String(Math.abs(rounded)).padStart(3, "0")}`;
}


function updateViewport() {
  if (!viewport) return;

  viewport.textContent =
    `${String(window.innerWidth).padStart(4, "0")} × ` +
    `${String(window.innerHeight).padStart(4, "0")}`;
}


function updateModified() {
  if (!lastModified) return;

  const parsed = new Date(document.lastModified);

  if (Number.isNaN(parsed.getTime())) {
    lastModified.textContent = "modified --.--.----";
    return;
  }

  const month =
    String(parsed.getMonth() + 1).padStart(2, "0");

  const day =
    String(parsed.getDate()).padStart(2, "0");

  const year =
    parsed.getFullYear();

  lastModified.textContent =
    `modified ${month}.${day}.${year}`;
}


/* POINTER MOVEMENT */

window.addEventListener("pointermove", (event) => {

  const x = event.clientX;
  const y = event.clientY;


  /* coordinates in footer */

  if (coords) {
    coords.textContent =
      `x:${String(Math.round(x)).padStart(3, "0")} ` +
      `y:${String(Math.round(y)).padStart(3, "0")}`;
  }


  /* ethereal cursor glow */

  if (pageGlow) {
    pageGlow.style.left = `${x}px`;
    pageGlow.style.top = `${y}px`;
  }


  /* cube reacts to pointer */

  if (
    objectStage &&
    cubeWrapper &&
    window.innerWidth > 680
  ) {

    const rect =
      objectStage.getBoundingClientRect();

    const normalizedX =
      (x - rect.left) / rect.width - 0.5;

    const normalizedY =
      (y - rect.top) / rect.height - 0.5;


    const tiltX =
      normalizedY * -14;

    const tiltY =
      normalizedX * 18;


    cubeWrapper.style.transform =
      `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;


    if (objectReadout) {

      objectReadout.textContent =
        `x:${paddedSigned(tiltY)} ` +
        `y:${paddedSigned(tiltX)}`;

    }

  }

});


/* RESET CUBE WHEN POINTER LEAVES */

if (
  objectStage &&
  cubeWrapper
) {

  objectStage.addEventListener(
    "pointerleave",
    () => {

      cubeWrapper.style.transform =
        "rotateX(0deg) rotateY(0deg)";


      if (objectReadout) {

        objectReadout.textContent =
          "x:+000 y:+000";

      }

    }
  );

}


/* INITIALIZE */

updateViewport();
updateModified();


window.addEventListener(
  "resize",
  updateViewport
);