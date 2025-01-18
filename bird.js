class Bird {
  birdTypes = {
    'red': { r: 20, mass: 2, img: birdImg[0]},
    'stella': { r: 20, mass: 2, img: birdImg[1]},
  }

  constructor(x, y, type = "red") {
    const attributes = this.birdTypes[type];
    this.body = Bodies.circle(x, y, attributes.r, {
      restitution: 0.7,
      collisionFilter: { category: 2 },
      mass: attributes.mass,
    });
    this.type = type;
    this.img = attributes.img;
    World.add(world, this.body);
    this.powerUpActivated = false;

    // Power up for Stella
    this.maxRadius = this.body.circleRadius * 2;

    // Power up for Chuck
    this.singleActivation = false;
    this.hasHit = false;
  }
  
  takeDamage(momentum) {
    // bird does not take damage
  }
  
  show() {
    push();
    imageMode(CENTER);
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);
    image(this.img, 0, 0, 2 * this.body.circleRadius, 2 * this.body.circleRadius);
    pop();
  }
  
  activatePowerUp() {
    if (!slingShot.isAttached()){
      console.log(Bird.birdTypes)
      this.powerUpActivated = true;
      console.log("Power up activated");
    }
  }

  stellaPowerUp() {
    if (this.body.circleRadius < this.maxRadius) {
      Body.scale(this.body, 2, 2); // Adjust the scale factor as needed
    }
  }

  chuckPowerUp() {
    // Chuck power up, we ensure that this executes only once
    if (this.singleActivation) {
      return;
    }
 
    // Chuck power up increases velocity and negates gravity until it hits something
    // We apply a force in the direction of the current velocity
    const forceMagnitude = 0.12;
    const velocity = this.body.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    // Intenté sin normalizar la velocidad y no funcionó como esperaba
    const normalizedVelocity = {
      x: velocity.x / speed,
      y: velocity.y / speed
    };
    const force = {
      x: normalizedVelocity.x * forceMagnitude,
      y: normalizedVelocity.y * forceMagnitude
    };
    Body.applyForce(this.body, this.body.position, force);

    // now we negate gravity
    this.body.gravityScale = 0;

    this.singleActivation = true;
  }

  update() {
    if (this.powerUpActivated) {
      switch (this.type) {
        case 'stella':
          this.stellaPowerUp();
          break;
        case 'red': //Red for now will have the same power up as chuck
          this.chuckPowerUp();
          break;
        default:
          break;
      }
    }
  }
}

