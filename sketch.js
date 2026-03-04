// Array to hold all particle objects
let particles = [];
// Number of particles to create
const numParticles = 2000;

// Noise scale and speed settings for controlling the flow field
const noiseScale = 0.01;
const noiseSpeed = 0.005;

// This function runs once when the sketch is first loaded
function setup() {
  // Get the target element to attach the canvas to
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('bg-canvas'); // Attach canvas to the body with id 'bg-canvas'

  // Create the particles
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }
  // Set the stroke color for the particles (white)
  stroke(255);
}

// This function runs in a continuous loop, drawing each frame
function draw() {
  // A black background with some transparency creates the trailing/fluid effect
  background(0, 25);

  // Update and display each particle
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].show();
  }
}

// This function is called whenever the browser window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Particle class definition
class Particle {
  constructor() {
    // Start with a random position
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0); // Initial velocity is zero
  }

  // Update particle's position based on the noise field
  update() {
    // Calculate the noise value based on position and time (frameCount)
    let n = noise(this.pos.x * noiseScale, this.pos.y * noiseScale, frameCount * noiseSpeed);
    // Map the noise value to an angle (0 to 2*PI)
    let angle = map(n, 0, 1, 0, TWO_PI);
    // Create a velocity vector from that angle
    this.vel = p5.Vector.fromAngle(angle);

    // Add the velocity to the position to move the particle
    this.pos.add(this.vel);
    
    // Handle screen edges (wrap around)
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  // Draw the particle as a tiny point
  show() {
    point(this.pos.x, this.pos.y);
  }
}
