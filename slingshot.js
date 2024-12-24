class SlingShot {
  constructor(bird) {
    this.pointA = { x: 120, y: 375 }; // Punto fijo de la resortera
    this.sling = Constraint.create({
      pointA: this.pointA,
      bodyB: bird.body,
      stiffness: 0.05,
      length: 5
    });
    World.add(world, this.sling);
  }

  show() {
    // Dibujar la imagen de la resortera
    imageMode(CENTER);
    image(slingshotImg, this.pointA.x - 20, this.pointA.y + 20, 50, 100);

    // Dibujar la línea de la resortera
    if (this.sling.bodyB) {
      stroke(67,43,24); // Color marrón oscuro
      strokeWeight(4);
      const { x, y } = this.sling.pointA;
      const { x: bx, y: by } = this.sling.bodyB.position;
      line(x, y, bx, by);
    }
  }

  fly(mc) {
    if (this.sling.bodyB && mc.mouse.button === -1 && this.sling.bodyB.position.x > this.sling.pointA.x + 10) {
      this.sling.bodyB.collisionFilter.category = 1;
      this.sling.bodyB = null;
    }
  }

  attach(bird) {
    this.sling.bodyB = bird.body;
  }
}
