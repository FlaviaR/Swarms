//https://eater.net/boids

let width = 750;
let height = 750;

const numBoids = 10;

var boids = [];

function initBoids() {
  for (var i = 0; i < numBoids; i += 1) {
    boids[boids.length] = {
      x: Math.random() * width,
      y: Math.random() * height,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      history: [],
    };
  }
}

function keepBoidsWithinBounds(boid) {
  // margin from the edge of the canvas
  // keep width updated
  const margin = 100;
  const turnFactor = 1;

  // Keep turning the boid until it 
  // is no longer close to the margin
  if (boid.x < margin) {
    boid.dx += turnFactor;
  }
  if (boid.x > width - margin) {
    boid.dx -= turnFactor
  }
  if (boid.y < margin) {
    boid.dy += turnFactor;
  }
  if (boid.y > height - margin) {
    boid.dy -= turnFactor;
  }
}

function flyTowardsOtherBoids(boid) {
  boid.x += 1;
  boid.y += 1;
}

// Main animation loop
function animationLoop() {
  let start = Date.now();
  const ctx = document.getElementById("boids").getContext("2d");

  let timer = setInterval(function () {
    let interval = Date.now() - start;
    ctx.clearRect(0, 0, width, height);

    for (let boid of boids) {
      // Update the velocities according to each rule
      //flyTowardsOtherBoids(boid);
      keepBoidsWithinBounds(boid);
      drawBoid(ctx, boid);

      boid.x += boid.dx;
      boid.y += boid.dy;
    }

    //if (interval > 1000) clearInterval(timer); // stop animation

  }, 1000 / 60);

  // Update each boid
  // for (let boid of boids) {
  //   // Update the velocities according to each rule
  //   avoidOthers(boid);
  //   matchVelocity(boid);
  //   limitSpeed(boid);
  //   keepWithinBounds(boid);

  //   // Update the position based on the current velocity
  //   boid.x += boid.dx;
  //   boid.y += boid.dy;
  //   boid.history.push([boid.x, boid.y])
  //   boid.history = boid.history.slice(-50);
  // }

  // Clear the canvas and redraw all the boids in their current positions



  // Schedule the next frame
  //window.requestAnimationFrame(animationLoop);
}

function drawBoid(ctx, boid) {
  const angle = Math.atan2(boid.dy, boid.dx);
  // Object centered rotation
  // Move object to origin, rotate, move back
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);
  ctx.translate(-boid.x, -boid.y);

  ctx.fillStyle = "#1FD5ED";

  ctx.beginPath();
  ctx.moveTo(boid.x, boid.y);
  ctx.lineTo(boid.x - 15, boid.y + 5);
  ctx.lineTo(boid.x - 15, boid.y - 5);
  ctx.lineTo(boid.x, boid.y);
  ctx.fill();

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

//   window.onload = () => {
//       console.log("hey")
//     // Make sure the canvas always fills the whole window
//     window.addEventListener("resize", sizeCanvas, false);
//     sizeCanvas();

//     // Randomly distribute the boids to start

//     // Schedule the main animation loop
//     window.requestAnimationFrame(animationLoop);
//   };

function init() {
  initBoids();
  animationLoop()
}

init();