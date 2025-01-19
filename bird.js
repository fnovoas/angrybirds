class Bird {
  birdTypes = {
    'red': { r: 20, mass: 2, img: birdImg[0]},
    'stella': { r: 20, mass: 2, img: birdImg[1]},
    'blues' : { r:15, mass: 2, img: birdImg[2]},
    'chuck' : { r:20, mass: 2, img: birdImg[3]},
  }

  constructor(x, y, type = "red") {
    const attributes = this.birdTypes[type];
    this.body = Bodies.circle(x, y, attributes.r, {
      restitution: 0.7,
      collisionFilter: { category: 2 },
      mass: attributes.mass,
    });
    this.type = type;
    this.clones = [];
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
    for (let clone of this.clones){
      clone.show()
    }
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
  bluesPowerUp(){
    if (this.singleActivation) return
    const bird1 = new Bird(this.x, this.y, this.type);
    const bird2 = new Bird(this.x, this.y, this.type);
    World.remove(world,bird1.body)
    World.remove(world,bird2.body)
    // cpiar bien el body
    let newBody = Object.assign({}, this.body); // clone the body with depth 1
    delete newBody.id; // prevent multiple objects with same ID
    delete newBody.parent; // prevent attempt to remove object from parent it's not in
    delete newBody.parts; // delete infinate recursion when trying to "clone" the body
    delete newBody.axis; // prevent weird normal calculations from shared axis
    delete newBody.bounds; // prevent random collisions from shared bounds
    bird1.body = Matter.Body.create(newBody);
    bird2.body = Matter.Body.create(newBody);
    bird1.body.angle = this.body.angle + PI/4;
    // hacerlos pajaros más chiquitos
    Body.scale(bird1.body, 0.8, 0.8); 
    Body.scale(bird2.body, 0.8, 0.8); 
    Body.scale(this.body, 0.8, 0.8); 
    this.clones.push(bird1);
    bird2.body.angle = this.body.angle - PI/4;
    this.clones.push(bird2);

    World.add(world,bird1.body)
    World.add(world,bird2.body)
    this.singleActivation = true;
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
        case 'chuck': //Red for now will have the same power up as chuck
          this.chuckPowerUp();
          break;
        case 'blues': //Red for now will have the same power up as chuck
          this.bluesPowerUp();
          break;
        default:
          break;
      }
    }
  }

  removeBird(){
    World.remove(world, this.body);
    if (this.clones.length > 0){
      for (let clone of this.clones){
        World.remove(world, clone.body);
      }
    }
  }
}

