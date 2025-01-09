class Pig {
  // Configuración global para los tipos de cerdos
  static pigAttributes = {
    small: { r: 20, score: 100, health: 2 },
    medium: { r: 25, score: 200, health: 4 },
    large: { r: 30, score: 300, health: 8 },
    helmet: { r: 30, score: 400, health: 10 },
    mustache: { r: 35, score: 500, health: 12 },
    king: { r: 40, score: 1000, health: 14 }
  };

  constructor(x, y, type = "small", img) {
    const attributes = Pig.pigAttributes[type];

    if (!attributes) {
      throw new Error(`Unknown pig type: ${type}`);
    }

    this.body = Bodies.circle(x, y, attributes.r, {
      restitution: 0.5,
      friction: 0.5,
    });

    this.r = attributes.r;
    this.type = type;
    this.img = img;
    this.score = attributes.score;
    this.health = attributes.health;
    this.maxHealth = attributes.health;
    this.isDefeated = false;

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
    console.log(`Pig removed from world: ${this.body.id}`);
  }  

  checkCollisionImpact(pair) {
    const impactForce = pair.collision.impulse;
    console.log(`Impact force on pig ${this.type}: ${impactForce}`);
    if (impactForce > 0.1) {
      const damage = Math.max(1, Math.floor(impactForce * 10)); // Daño mínimo de 1
      this.takeDamage(damage);
      console.log(
        `Pig ${this.type} took ${damage} damage! Remaining health: ${this.health}`
      );
    }
  }

  display() {
    if (!this.isDefeated) {
      // Dibujar el cerdo
      push();
      translate(this.body.position.x, this.body.position.y);
      rotate(this.body.angle);
      imageMode(CENTER);
      image(this.img, 0, 0, 2 * this.r, 2 * this.r);
      pop();

      // Dibujar la barra de vida
      this.showHealthBar();
    }
  }

  showHealthBar() {
    const pos = this.body.position;
    const barWidth = 10; // Ancho de la barra
    const barHeight = 50; // Altura máxima de la barra
  
    // Calcular proporciones
    const healthRatio = Math.max(this.health / this.maxHealth, 0);
    const remainingHeight = barHeight * healthRatio;
  
    // Dibujar la parte azul (vida perdida)
    push();
    fill(80, 140, 160); // Azul
    noStroke();
    rectMode(CORNER);
    rect(
      pos.x + this.r + 5,
      pos.y - barHeight / 2,
      barWidth,
      barHeight
    );
  
    // Dibujar la parte verde (vida restante) desde la parte inferior hacia arriba
    fill(80, 232, 80); // Verde
    rect(
      pos.x + this.r + 5,
      pos.y + barHeight / 2 - remainingHeight, // Ajustar la posición inicial
      barWidth,
      remainingHeight
    );
    pop();
  }  
}