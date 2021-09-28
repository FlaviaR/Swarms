// Boids is an artificial life program, developed by Craig Reynolds in 1986, 
// which simulates the flocking behaviour of birds.
// Boids follow three main rules: 
// separation: steer to avoid crowding local flockmates
// alignment: steer towards the average heading of local flockmates
// cohesion: steer to move towards the average position (center of mass) of local flockmates
// https://en.wikipedia.org/wiki/Boids
// Basis - https://eater.net/boids

// To do ->
// make boids avoid obstacles
// color code boids based on what theyre currently doing
// allow boids to "perch" when tired
// add a predator

const width = screen.width;
const height = 750;

const boidVisualRange = 75;
let numBoids = 100;
let numOfCliques = 1;
let cliqueColors = [];
let coherenceFactor = 0.01;
let separationFactor = 0.01;
let alignmentFactor = 0.01;

var boids = [];
var obstacles = [];
const addPredatorButton = document.getElementById("addPredator");
const clearPredatorsButton = document.getElementById("clearPredators");

const coherenceSlider = document.getElementById("coherenceSlider");
const coherenceFactorAmount = document.getElementById("coherenceFactorAmount");

const separationSlider = document.getElementById("separationSlider");
const separationFactorAmount = document.getElementById("separationFactorAmount");

const alignmentSlider = document.getElementById("alignmentSlider");
const alignmentFactorAmount = document.getElementById("alignmentFactorAmount");

const cliqueSlider = document.getElementById("cliqueSlider");
const cliqueAmountSpan = document.getElementById("cliqueAmountSpan");

const numOfBoidsSlider = document.getElementById("numOfBoidsSlider");
const numOfBoidsSpan = document.getElementById("numOfBoidsSpan");

const canvasDOM = document.getElementById("boids");


function createCliqueColors() {
  cliqueColors = [];
  for (var i = 0; i < numOfCliques; i++) {
    cliqueColors.push(getColorCode());
  }
}

function getColorCode() {
  var makeColorCode = '0123456789ABCDEF';
  var code = '#';
  for (var count = 0; count < 6; count++) {
    code = code + makeColorCode[Math.floor(Math.random() * 16)];
  }
  return code;
}

function updateBoidCliqueColors() {
  for (var i = 0; i < numBoids; i += 1) {
    boid = boids[i];
    boid.clique = i % numOfCliques;
    boid.cliqueColor = cliqueColors[i % numOfCliques];
  }
}

function initBoids() {
  boids = [];
  for (var i = 0; i < numBoids; i += 1) {
    boids[boids.length] = {
      x: Math.random() * width,
      y: Math.random() * height,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      isPrey: true,
      clique: i % numOfCliques,
      cliqueColor: cliqueColors[i % numOfCliques],
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
  const margin = 130;
  const turnFactor = 1;

  // Keep turning the boid until it 
  // is no longer close to the margin
  if (boid.x < margin) {
    boid.dx += turnFactor;
  }
  if (boid.x > (width - margin)) {
    boid.dx -= turnFactor
  }
  if (boid.y < margin) {
    boid.dy += turnFactor;
  }
  if (boid.y > (height - margin)) {
    boid.dy -= turnFactor;
  }
}

function getCenterOfMass(givenBoid, listOfBoids) {
  let numOfBoids = 0;
  let centerOfMassX = 0;
  let centerOfMassY = 0;

  for (let boid of listOfBoids) {
    if (distanceBetweenBoids(givenBoid, boid) <= boidVisualRange && (givenBoid.clique === boid.clique)) {
      centerOfMassX += boid.x;
      centerOfMassY += boid.y;
      numOfBoids++;
    }
  }

  if (numOfBoids > 0) {
    return [centerOfMassX / numOfBoids, centerOfMassY / numOfBoids]
  } return null
}

// cohesion: steer to move towards the average position (center of mass) of local flockmates
function maintainCohesion(givenBoid) {
  let turningFactor = coherenceFactor;
  let centerOfMass = getCenterOfMass(givenBoid, boids);

  if (centerOfMass != null) {
    givenBoid.dx += (centerOfMass[0] - givenBoid.x) * turningFactor;
    givenBoid.dy += (centerOfMass[1] - givenBoid.y) * turningFactor;
  }
}

function getVisibleBoids(givenBoid) {
  let visibleBoids = [];
  for (let boid of boids) {
    if (distanceBetweenBoids(givenBoid, boid) <= boidVisualRange) {
      visibleBoids.push(boid);
    }
  }
  return visibleBoids;
}

// alignment: steer towards the average heading of local flockmates
function maintainAlignment(givenBoid) {
  let turningFactor = alignmentFactor;
  let numOfBoids = 0;
  let velocityX = 0;
  let velocityY = 0;

  for (let boid of boids) {
    if (distanceBetweenBoids(givenBoid, boid) <= boidVisualRange && (givenBoid.clique === boid.clique)) {
      velocityX += boid.dx;
      velocityY += boid.dy;
      numOfBoids++;
    }
  }

  if (numOfBoids > 0) {
    givenBoid.dx += (velocityX / numOfBoids - givenBoid.dx) * turningFactor;
    givenBoid.dy += (velocityY / numOfBoids - givenBoid.dy) * turningFactor;
  }
}

// separation: steer to avoid crowding local flockmates
function maintainSeparation(givenBoid) {
  let distanceFactor = 50;
  let avoidanceFactor = separationFactor;
  let positionX = 0;
  let positionY = 0;

  for (let boid of boids) {
    if (distanceBetweenBoids(givenBoid, boid) <= distanceFactor && (givenBoid.clique === boid.clique)) {
      positionX += (givenBoid.x - boid.x);
      positionY += (givenBoid.y - boid.y);
    }
  }

  givenBoid.dx += positionX * avoidanceFactor;
  givenBoid.dy += positionY * avoidanceFactor;
}

function maintainAverageVelocity(givenBoid) {
  let numOfNeighbors = 0;
  let avgDx = 0;
  let avgDy = 0;
  let velocityAdjustment = 0.05;

  for (let boid of boids) {
    if (distanceBetweenBoids(givenBoid, boid) < boidVisualRange && (givenBoid.clique === boid.clique)) {
      avgDx += boid.dx;
      avgDy += boid.dy;
      numOfNeighbors++;
    }
  }

  if (numOfNeighbors > 0) {
    givenBoid.dx += (avgDx / numOfNeighbors - givenBoid.dx) * velocityAdjustment;
    givenBoid.dy += (avgDy / numOfNeighbors - givenBoid.dy) * velocityAdjustment;
  }
}

function limitSpeed(givenBoid) {
  let speedLimit = 10;
  // To calculate the speed you need the magnitude (or length) of the velocity vector
  // https://www.fisicalab.com/en/section/forces-decomposition
  // velocity -> speed with direction
  let speed = Math.sqrt(Math.pow(givenBoid.dx, 2) + Math.pow(givenBoid.dy, 2));

  if (speed > speedLimit) {
    givenBoid.dx = (givenBoid.dx / speed) * speedLimit;
    givenBoid.dy = (givenBoid.dx / speed) * speedLimit;
  }
}

function addPredatorToScene() {
  var selBoid = boids[0];
  while (!selBoid.isPrey) {
    selBoid = boids[Math.floor(Math.random() * boids.length)];
  }
  selBoid.isPrey = false;

}

function clearPredatorsFromScene() {
  for (let boid of boids) {
    boid.isPrey = true;
  }
}

function avoidObstacle(givenBoid) {
  let velocityAdjustment = 0.05;
  let distanceFactor = 30;

  let distanceFromObstacle = 0

  for (let obstacle of obstacles) {
    distanceFromObstacle = getDistanceFromPoint2Circle(givenBoid.x, givenBoid.y, obstacle.x, obstacle.y, obstacle.radius)
    // subtracting values traps it inside of the circle
    if (distanceFromObstacle <= distanceFactor) {
      givenBoid.dx += (givenBoid.x - obstacle.x) * velocityAdjustment;
      givenBoid.dy += (givenBoid.y - obstacle.y) * velocityAdjustment;
      // moveX += givenBoid.x - boid.x;
      // moveY += givenBoid.y - boid.y;
    }
  }

}

function avoidPredator(givenBoid) {
  let velocityAdjustment = 0.2;
  let distanceFactor = 50;

  if (givenBoid.isPrey) {
    for (let boid of boids) {
      if (!boid.isPrey && distanceBetweenBoids(givenBoid, boid) <= distanceFactor) {
        givenBoid.dx -= (boid.x - givenBoid.x) * velocityAdjustment;
        givenBoid.dy -= (boid.y - givenBoid.y) * velocityAdjustment;
        // moveX += givenBoid.x - boid.x;
        // moveY += givenBoid.y - boid.y;
      }
    }
  }
}

// Predator moves towards the clossest prey that is straying from the flock
function attackPrey(givenBoid) {
  let velocityAdjustment = 0.5;
  let visibleBoids = getVisibleBoids(givenBoid);

  if (!givenBoid.isPrey) { // predator

    if (visibleBoids.length > 0) {
      let targetList = [];


      for (let target of visibleBoids) {
        targetList.push([target, distanceBetweenBoids(target, givenBoid)])
      }

      targetList.sort(function (a, b) {
        return a[1] - b[1];
      });

      let clossestBoid = targetList[0][0];

      givenBoid.dx += ((clossestBoid.x - givenBoid.x) * velocityAdjustment);
      givenBoid.dy += ((clossestBoid.y - givenBoid.y) * velocityAdjustment);
    } else {
      goToCenterOfScreen(givenBoid);
    }
  }
}

// Go towards the center of mass
function goToCenterOfMass(givenBoid) {
  let centerX = 0;
  let centerY = 0;
  let numOfNeighbors = 0;
  let velocityAdjustment = 0.005;

  for (let boid of boids) {
    if (distanceBetweenBoids(givenBoid, boid) < boidVisualRange) {
      centerX += boid.x;
      centerY += boid.y;
      numOfNeighbors++
    }
  }

  if (numOfNeighbors > 0) {
    centerX = centerX / numOfNeighbors;
    centerY = centerY / numOfNeighbors;

    givenBoid.dx += (centerX - givenBoid.x) * velocityAdjustment;
    givenBoid.dy += (centerY - givenBoid.y) * velocityAdjustment;

  }
}

function getDistanceFromPoint2Circle(x, y, h, k, r) {
  return Math.abs(Math.sqrt(Math.pow((x - h), 2) + Math.pow((y - k), 2)) - r)
}

function getCursorPosition(event) {
  const rect = canvasDOM.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return [x, y]
}

canvasDOM.addEventListener('mousedown', function (e) {
  //addObstacle(e)
  addObstacle(e)
})

function drawObstacles(ctx) {
  for (let obstacle of obstacles) {
    ctx.beginPath();
    ctx.arc(obstacle.x, obstacle.y, 50, 0, 2 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FF0000'
    ctx.stroke();
  }
}

function addObstacle(e) {
  let cursorPos = getCursorPosition(e)
  obstacles.push({ x: cursorPos[0], y: cursorPos[1], radius: 100 })
  console.log(obstacles[obstacles.length - 1])
}

function goToCenterOfScreen(givenBoid) {
  let velocityAdjustment = 0.2
  givenBoid.dx += ((width / 2) - givenBoid.x) * velocityAdjustment;
  givenBoid.dy += ((height / 2) - givenBoid.y) * velocityAdjustment;
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
      keepBoidsWithinBounds(boid);
      maintainCohesion(boid);
      maintainAlignment(boid);
      maintainSeparation(boid);
      maintainAverageVelocity(boid);
      limitSpeed(boid);
      goToCenterOfMass(boid);
      avoidPredator(boid);
      avoidObstacle(boid);
      drawObstacles(ctx);
      attackPrey(boid);
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

  if (boid.isPrey) {
    ctx.fillStyle = boid.cliqueColor;
  } else {
    ctx.fillStyle = "#ED371F";
  }

  let preySize = 15;
  let predatorSize = 35;
  ctx.beginPath();
  ctx.moveTo(boid.x, boid.y);
  if (boid.isPrey) {
    ctx.lineTo(boid.x - preySize, boid.y + 5);
    ctx.lineTo(boid.x - preySize, boid.y - 5);
  } else {
    ctx.lineTo(boid.x - predatorSize, boid.y + 10);
    ctx.lineTo(boid.x - predatorSize, boid.y - 10);
  }

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
  createCliqueColors();
  initBoids();
  animationLoop();
  canvasDOM.width = width;
}



addPredatorButton.addEventListener('click', addPredatorToScene, false)
coherenceSlider.oninput = function () {
  coherenceFactor = coherenceSlider.value;
  coherenceFactorAmount.innerHTML = coherenceFactor;
  console.log(coherenceFactor)
}

clearPredatorsButton.addEventListener('click', clearPredatorsFromScene, false)


separationSlider.oninput = function () {
  separationFactor = separationSlider.value;
  separationFactorAmount.innerHTML = separationFactor;
  console.log(separationFactor)
}

alignmentSlider.oninput = function () {
  alignmentFactor = alignmentSlider.value;
  alignmentFactorAmount.innerHTML = alignmentFactor;
  console.log(alignmentFactor)
}

numOfBoidsSlider.oninput = function () {
  numBoids = numOfBoidsSlider.value;
  numOfBoidsSpan.innerHTML = numBoids;
  initBoids();
  console.log(numBoids)
}

cliqueSlider.oninput = function () {
  numOfCliques = cliqueSlider.value;
  cliqueAmountSpan.innerHTML = numOfCliques;
  createCliqueColors();
  updateBoidCliqueColors();
}

init();