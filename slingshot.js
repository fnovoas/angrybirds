class SlingShot {
  constructor(bird) {
    this.pointA = { x: 120, y: 375 }; // Punto fijo de la resortera
    this.maxStretch = 100; // Máxima distancia permitida (en píxeles)
    this.k = 3; // coeficiente de elasticidad de la resortera

    this.sling = Constraint.create({
      pointA: this.pointA,
      bodyB: bird.body,
      stiffness: 0.02,
      length: 0,
    });

    this.sling.bodyB.collisionFilter.category = 4;
    this.sling.bodyB.collisionFilter.mask = 6;
    
    World.add(world, this.sling);
  }

  // Método para limitar el estiramiento de la resortera
  restrictStretch() {
    // if (!this.sling.bodyB) return;

    // const birdPos = this.sling.bodyB.position; // Posición actual del pájaro
    // const distance = dist(birdPos.x, birdPos.y, this.pointA.x, this.pointA.y); // Distancia entre pájaro y punto fijo

    // if (distance > this.maxStretch) {
    //   const angle = atan2(birdPos.y - this.pointA.y, birdPos.x - this.pointA.x); // Ángulo de estiramiento

    //   // Calcular nueva posición en el límite máximo
    //   const limitedX = this.pointA.x + cos(angle) * this.maxStretch;
    //   const limitedY = this.pointA.y + sin(angle) * this.maxStretch;

    //   // Establecer nueva posición del pájaro
    //   Body.setPosition(this.sling.bodyB, { x: limitedX, y: limitedY });
    // }
  }

  // Método para calcular la trayectoria proyectada
  calculateTrajectory() {
    trajectoryPoints = []; // Reiniciar los puntos
    if (!this.sling.bodyB) return; // No calcular si no hay pájaro en la resortera

    const birdPos = this.sling.bodyB.position; // Posición actual del pájaro
    let distance = dist(birdPos.x, birdPos.y, this.pointA.x, this.pointA.y); // Distancia entre pájaro y punto fijo

    // Limitar la distancia al máximo permitido
    distance = Math.min(distance, this.maxStretch);

    const angle = atan2(birdPos.y - this.pointA.y, birdPos.x - this.pointA.x); // Ángulo hacia adelante
    const velocidadInicial = Math.sqrt(this.k * Math.sqrt((birdPos.x - this.pointA.x) ** 2 + (birdPos.y - this.pointA.y) ** 2) ** 2 / this.sling.bodyB.mass)

    if (distance > 30) { // Solo mostrar puntos si la tensión supera el 30% del máximo
      const separation = map(distance, 30, this.maxStretch, minSeparation, maxSeparation); // Escalar separación entre puntos

      for (let i = 0; i < maxTrajectoryPoints; i++) {
        const t = i * separation / 100; // Tiempo simulado para la trayectoria
        const x = this.pointA.x - cos(angle) * t * velocidadInicial; // Movimiento horizontal desde el pájaro
        const y = this.pointA.y - (sin(angle) * t * velocidadInicial) + (0.5 * 9.8 * t * t); // Movimiento vertical con gravedad hacia abajo

        trajectoryPoints.push({
          x,
          y,
          size: map(i, 0, maxTrajectoryPoints - 1, 10, 2), // Tamaño decreciente
        });
      }
    }
  }

  // Método para dibujar la resortera y su límite de estiramiento
  show() {
    this.restrictStretch(); // Limitar el estiramiento en tiempo real

    // Dibujar la imagen de la resortera
    imageMode(CENTER);
    image(slingshotImg, this.pointA.x - 20, this.pointA.y + 20, 50, 100);

    // Dibujar la línea de la resortera
    if (this.sling.bodyB) {
      stroke(67, 43, 24); // Color marrón oscuro
      strokeWeight(4);
      const { x, y } = this.sling.pointA;
      const { x: bx, y: by } = this.sling.bodyB.position;
      line(x, y, bx, by);
    }
  }

  // Método para soltar el pájaro de la resortera
  fly(mc) {
    if (
      this.sling.bodyB &&
      mc.mouse.button === -1 &&
      this.sling.bodyB.position.x > this.sling.pointA.x + 10
    ) {
      this.sling.bodyB.collisionFilter.category = 1;
      this.sling.bodyB.collisionFilter.mask = 4294967295;
      this.sling.bodyB = null;
    }
  }

  // Método para adjuntar un nuevo pájaro a la resortera
  attach(bird) {
    this.sling.bodyB = bird.body;
    this.sling.bodyB.collisionFilter.mask = 6;
    this.sling.bodyB.collisionFilter.category = 4;
  }

  // Método para verificar si hay un cuerpo sujeto a la resortera
  isAttached() {
    return this.sling.bodyB !== null; // Devuelve true si hay un cuerpo sujeto
  }
}
