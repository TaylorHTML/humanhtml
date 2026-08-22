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

/* =====================================
   ANIMATED HUMANHTML FAVICON
===================================== */

const favicon = document.getElementById("favicon");

const faviconCanvas = document.createElement("canvas");
faviconCanvas.width = 64;
faviconCanvas.height = 64;

const faviconCtx = faviconCanvas.getContext("2d");

const cubeVertices = [
  [-1, -1, -1],
  [ 1, -1, -1],
  [ 1,  1, -1],
  [-1,  1, -1],

  [-1, -1,  1],
  [ 1, -1,  1],
  [ 1,  1,  1],
  [-1,  1,  1]
];

const cubeEdges = [
  [0,1],
  [1,2],
  [2,3],
  [3,0],

  [4,5],
  [5,6],
  [6,7],
  [7,4],

  [0,4],
  [1,5],
  [2,6],
  [3,7]
];

let faviconRotation = 0;


function rotateCubePoint(point, angleX, angleY) {

  let [x, y, z] = point;


  /* rotate around Y */

  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);

  const xY =
    x * cosY -
    z * sinY;

  const zY =
    x * sinY +
    z * cosY;


  x = xY;
  z = zY;


  /* rotate around X */

  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);

  const yX =
    y * cosX -
    z * sinX;

  const zX =
    y * sinX +
    z * cosX;


  return [
    x,
    yX,
    zX
  ];
}


function projectCubePoint(point) {

  const [x, y, z] = point;

  const distance = 4;

  const scale =
    18 / (distance - z);


  return [
    32 + x * scale,
    32 + y * scale
  ];
}


function drawFaviconCube() {

  faviconCtx.clearRect(
    0,
    0,
    64,
    64
  );


  const transformed =
    cubeVertices.map((point) => {

      const rotated =
        rotateCubePoint(
          point,
          faviconRotation * 0.65,
          faviconRotation
        );

      return projectCubePoint(rotated);

    });


  faviconCtx.strokeStyle =
    "#0033ff";

  faviconCtx.lineWidth =
    3;

  faviconCtx.lineCap =
    "round";

  faviconCtx.lineJoin =
    "round";


  cubeEdges.forEach(([start, end]) => {

    faviconCtx.beginPath();

    faviconCtx.moveTo(
      transformed[start][0],
      transformed[start][1]
    );

    faviconCtx.lineTo(
      transformed[end][0],
      transformed[end][1]
    );

    faviconCtx.stroke();

  });


  favicon.href =
    faviconCanvas.toDataURL("image/png");


  faviconRotation +=
    0.045;


  requestAnimationFrame(
    drawFaviconCube
  );

}


drawFaviconCube();