class Pig {
  constructor(x, y, r, type = "small", img, score = 100) {
    this.body = Bodies.circle(x, y, r, {
      restitution: 0.5,
      friction: 0.5
    });
    this.r = r;
    this.type = type;
    this.img = img;
    this.score = score;
    this.isDefeated = false;

    // Configuración según el tipo
    switch (type) {
      case "small":
        this.health = 1;
        this.score = 100;
        break;
      case "medium":
        this.health = 2;
        this.score = 200;
        break;
      case "large":
        this.health = 3;
        this.score = 300;
        break;
      case "helmet":
        this.health = 4;
        this.score = 400;
        break;
      case "mustache":
        this.health = 5;
        this.score = 500;
        break;
      case "king":
        this.health = 6;
        this.score = 1000;
        break;
      default:
        this.health = 1;
        this.score = 100;
    }

    World.add(world, this.body);
  }

  takeDamage(damage = 1) {
    this.health -= damage;
    if (this.health <= 0) {
      this.defeated();
    }
  }

  defeated() {
    World.remove(world, this.body);
    this.isDefeated = true;
    console.log(`Pig defeated! Score: ${this.score}`);
  }

  checkCollisionImpact(pair) {
    // Calcula el daño basado en la fuerza de colisión
    const impactForce = pair.collision.impulse;
    if (impactForce > 0.1) { // Umbral mínimo para que se considere daño
      const damage = Math.floor(impactForce * 10); // Escala el daño
      this.takeDamage(damage);
      console.log(`Pig ${this.type} took ${damage} damage! Remaining health: ${this.health}`);
    }
  }

  display() {
    if (!this.isDefeated) {
      push();
      translate(this.body.position.x, this.body.position.y);
      rotate(this.body.angle);
      imageMode(CENTER);
      image(this.img, 0, 0, 2 * this.r, 2 * this.r);
      pop();
    }
  }

  checkStatus() {
    return this.health > 0;
  }
}
