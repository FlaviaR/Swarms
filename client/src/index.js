//https://eater.net/boids

const width = 750;
const height = 750;

const boidVisualRange = 50;
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

function distanceBetweenBoids(boid1, boid2) {
  return Math.sqrt(Math.pow(boid1.x - boid2.x, 2) + Math.pow(boid1.y - boid2.y, 2))
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

function flyTowardsOtherBoids(givenBoid) {
  let turningFactor = 0.01
  let numOfBoids = 0;
  let centerOfMassX = 0;
  let centerOfMassY = 0;

  for (let boid of boids) {
    if (distanceBetweenBoids(givenBoid, boid) <= boidVisualRange) {
      centerOfMassX += boid.x;
      centerOfMassY += boid.y;
      numOfBoids++;
    }
  }

  if (numOfBoids > 0) {
    givenBoid.dx += (centerOfMassX/numOfBoids - givenBoid.x) * turningFactor;
    givenBoid.dy += (centerOfMassY/numOfBoids - givenBoid.y) * turningFactor;
  }

}

// Main animation loop
// Problem with set interval occurs if the 
// number of instructions arent completed before the next loop
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
      flyTowardsOtherBoids(boid);
      drawBoid(ctx, boid);

      boid.x += boid.dx;
      boid.y += boid.dy;
    }

    // if (interval > 1000) clearInterval(timer); // stop animation

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