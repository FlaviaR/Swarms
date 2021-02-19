let width = 150;
let height = 150;

const numBoids = 1;

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

  // Main animation loop
function animationLoop() {
    // Update each boid
    // for (let boid of boids) {
    //   // Update the velocities according to each rule
    //   flyTowardsCenter(boid);
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
    const ctx = document.getElementById("boids").getContext("2d");
    ctx.clearRect(0, 0, width, height);
    for (let boid of boids) {
      drawBoid(ctx, boid);
    }
  
    // Schedule the next frame
    window.requestAnimationFrame(animationLoop);
  }

  function drawBoid(ctx, boid) {
    const angle = Math.atan2(boid.dy, boid.dx);
    ctx.translate(boid.x, boid.y);
    ctx.rotate(angle);
    ctx.translate(-boid.x, -boid.y);
    ctx.fillStyle = "#558cf4";
    ctx.beginPath();
    ctx.moveTo(boid.x, boid.y);
    ctx.lineTo(boid.x - 15, boid.y + 5);
    ctx.lineTo(boid.x - 15, boid.y - 5);
    ctx.lineTo(boid.x, boid.y);
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  window.onload = () => {
    // Make sure the canvas always fills the whole window
    window.addEventListener("resize", sizeCanvas, false);
    sizeCanvas();
  
    // Randomly distribute the boids to start
    initBoids();
  
    // Schedule the main animation loop
    window.requestAnimationFrame(animationLoop);
  };