class Pig {
  // Configuración global para los tipos de cerdos
  static pigAttributes = {
    small: { r: 20, score: 100, hardness: 4},
    medium: { r: 25, score: 200, hardness: 5},
    large: { r: 30, score: 300, hardness: 6},
    helmet: { r: 30, score: 400, hardness: 7},
    mustache: { r: 35, score: 500, hardness: 8},
    king: { r: 40, score: 1000, hardness: 9},
  };

  constructor(x, y, type = "small", img) {
    const attributes = Pig.pigAttributes[type];

    if (!attributes) {
      throw new Error(`Unknown pig type: ${type}`);
    }

    this.body = Bodies.circle(x, y, attributes.r, {
      restitution: 0.5,
      friction: 0.5,
      mass: Math.sqrt(attributes.hardness)
    });

    this.r = attributes.r;
    this.type = type;
    this.img = img;
    this.score = attributes.score;
    this.health = attributes.hardness ** 2;
    this.maxHealth = attributes.hardness ** 2;
    this.isDefeated = false;

    World.add(world, this.body);
  }

  takeDamage(momentum) {
    this.health -= momentum; // Reducir la salud según la fuerza del impacto
    if (this.health <= 0) {
      this.defeated();
    }
  }

  defeated() {
    // puede que se pueda elimnar del array de cerdos de una vez
    console.log(`Pig defeated! Score: ${this.score}`);
    console.log(`Pig removed from world: ${this.body.id}`);
    this.isDefeated = true;
    World.remove(world, this.body);
    pigs = pigs.filter((pig) => pig.body !== this.body); // Eliminar de la lista de cerdo
  }  
 
  // TODO: No existe la propiedad pair.collision.impulse, se debe corregir.
  checkCollisionImpact(pair) {
    /*
    if (pair.bodyA !== ground.body && pair.bodyB !== ground.body) {
      const isBoxCollision = boxes.some(box => pair.bodyA === box.body || pair.bodyB === box.body);
      if (!isBoxCollision) {
      console.log("Cerdo fué tocado");
      }
    }
    if (pair.bodyA === bird.body || pair.bodyB === bird.body) {     
      console.log("Bird hit the pig!, bird was: ", pair.bodyA === bird.body ? "bodyA" : "bodyB");
    }
    */
    
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