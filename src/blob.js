// ===============================
// INITIAL SETUP
// ===============================

const wrapper = document.querySelector('.blob-wrapper');
const blobElements = [
  document.querySelector('.blob-1'),
  document.querySelector('.blob-2'),
  document.querySelector('.blob-3')
];

// Blob movement configuration
const blobs = [
  { el: blobElements[0], ampX: 15, ampY: 12, speed: 0.0014 },
  { el: blobElements[1], ampX: 12, ampY: 15, speed: 0.0011 },
  { el: blobElements[2], ampX: 14, ampY: 10, speed: 0.0013 }
];

// Wrapper position
let wrapperX = 0;
let wrapperY = 0;

// // Dragging state
// let isDragging = false;
// let offsetX = 0;
// let offsetY = 0;

// Blob follower positions
let followers = [
  { x: wrapperX, y: wrapperY, speed: 0.25 }, // fast
  { x: wrapperX, y: wrapperY, speed: 0.15 }, // medium
  { x: wrapperX, y: wrapperY, speed: 0.08 }  // slow
];

let start = null;


// ===============================
// DRAG EVENTS
// ===============================

// // Start dragging
// wrapper.addEventListener('mousedown', (e) => {
//   isDragging = true;
//   offsetX = e.clientX - wrapperX;
//   offsetY = e.clientY - wrapperY;
//   wrapper.style.cursor = 'grabbing';
// });

// // Stop dragging
// document.addEventListener('mouseup', () => {
//   isDragging = false;
//   wrapper.style.cursor = 'grab';
// });

// // Drag movement
// document.addEventListener('mousemove', (e) => {
//   if (!isDragging) return;

//   wrapperX = e.clientX - offsetX;
//   wrapperY = e.clientY - offsetY;

//   wrapper.style.transform = `translate(${wrapperX}px, ${wrapperY}px)`;
// });


// ===============================
// ANIMATION LOOP
// ===============================

function animate(timestamp) {
  if (!start) start = timestamp;
  const t = timestamp - start;

  blobs.forEach((b, i) => {
    // FOLLOW WRAPPER POSITION
    followers[i].x += (wrapperX - followers[i].x) * followers[i].speed;
    followers[i].y += (wrapperY - followers[i].y) * followers[i].speed;

    // ORIGINAL MOVEMENT (subtle pulsing)
    const x =
      followers[i].x +
      Math.sin(t * b.speed + i * 0.5) * b.ampX;

    const y =
      followers[i].y +
      Math.cos(t * b.speed * 1.1 + i * 0.5) * b.ampY;

    const scale =
      1 + Math.sin(t * b.speed * 1.4 + i) * 0.05;

    const hueShift = (Math.sin(t * b.speed * 0.5 + i) * 20);

    b.el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    b.el.style.filter = `hue-rotate(${hueShift}deg)`;
  });

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
