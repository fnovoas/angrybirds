class Bird {
    constructor(x, y, r, mass, img) {
      this.body = Bodies.circle(x, y, r, {
        restitution: 0.7,
        collisionFilter: { category: 2 }
      });
      this.img = img;
      Body.setMass(this.body, mass);
      World.add(world, this.body);
    }
  
    show() {
      push();
      imageMode(CENTER);
      translate(this.body.position.x, this.body.position.y);
      rotate(this.body.angle);
      image(this.img, 0, 0, 2 * this.body.circleRadius, 2 * this.body.circleRadius);
      pop();
    }
  }
  