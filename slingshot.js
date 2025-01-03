class SlingShot {
  constructor(bird) {
  this.pointA = { x:
  120, y:
    375
  }; // Punto fijo de la resortera
  this.maxStretch = 100; // Máxima distancia permitida (en píxeles)

  this.sling = Constraint.create( {
  pointA:
    this.pointA,
    bodyB:
    bird.body,
    stiffness:
    0.05,
    length:
    5,
  }
  );
  World.add(world, this.sling);
}

restrictStretch() {
  if (!this.sling.bodyB) return;

  const birdPos = this.sling.bodyB.position; // Posición actual del pájaro
  const distance = dist(birdPos.x, birdPos.y, this.pointA.x, this.pointA.y); // Distancia entre pájaro y punto fijo

  if (distance > this.maxStretch) {
    const angle = atan2(birdPos.y - this.pointA.y, birdPos.x - this.pointA.x); // Ángulo de estiramiento

    // Calcular nueva posición en el límite máximo
    const limitedX = this.pointA.x + cos(angle) * this.maxStretch;
    const limitedY = this.pointA.y + sin(angle) * this.maxStretch;

    // Establecer nueva posición del pájaro
    Body.setPosition(this.sling.bodyB, {
    x:
    limitedX, y:
      limitedY
    }
    );
  }
}

calculateTrajectory() {
  trajectoryPoints = []; // Reiniciar los puntos
  if (!this.sling.bodyB) return; // No calcular si no hay pájaro en la resortera

  const birdPos = this.sling.bodyB.position; // Posición actual del pájaro
  let distance = dist(birdPos.x, birdPos.y, this.pointA.x, this.pointA.y); // Distancia entre pájaro y punto fijo

  // Limitar la distancia al máximo permitido
  distance = Math.min(distance, this.maxStretch);

  const angle = -atan2(birdPos.y - this.pointA.y, birdPos.x - this.pointA.x); // Ángulo hacia adelante

  if (distance > 30) { // Solo mostrar puntos si la tensión supera el 30% del máximo
    const separation = map(distance, 30, this.maxStretch, minSeparation, maxSeparation); // Escalar separación entre puntos

    for (let i = 0; i < maxTrajectoryPoints; i++) {
      const t = i * separation / 100; // Tiempo simulado para la trayectoria
      const x = birdPos.x - cos(angle) * t * 200; // Movimiento horizontal desde el pájaro
      const y = birdPos.y + sin(angle) * t * 200 + 0.5 * 9.8 * t * t * 200; // Movimiento vertical con gravedad hacia abajo

      trajectoryPoints.push({
        x,
        y,
        size: map(i, 0, maxTrajectoryPoints - 1, 10, 2), // Tamaño decreciente
      });
    }
  }
}

show() {
  // Llamar a `restrictStretch` para limitar el estiramiento en tiempo real
  this.restrictStretch();

  // Dibujar la imagen de la resortera
  imageMode(CENTER);
  image(slingshotImg, this.pointA.x - 20, this.pointA.y + 20, 50, 100);

  // Dibujar la línea de la resortera
  if (this.sling.bodyB) {
    stroke(67, 43, 24); // Color marrón oscuro
    strokeWeight(4);
    const {
      x, y
    }
    = this.sling.pointA;
    const {
    x:
    bx, y:
      by
    }
    = this.sling.bodyB.position;
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
