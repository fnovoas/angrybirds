class Ground {
  /**
   * Constructor para crear un suelo.
   * @param {number} x - Posición en el eje X.
   * @param {number} y - Posición en el eje Y.
   * @param {number} w - Ancho del suelo.
   * @param {number} h - Altura del suelo.
   * @param {object} img - Imagen para la textura del suelo.
   */
  constructor(x, y, w, h, img) {
    const options = {
      isStatic: true, // Define el cuerpo como estático
      collisionFilter: {
        category: 2,
      },
    };
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.w = w;
    this.h = h;
    this.img = img;
    World.add(world, this.body);
  }

  takeDamage(momentum) {
    // El suelo no recibe daño
  }

  // Método para mostrar el suelo en el canvas.
  show() {
    const pos = this.body.position;
    push();
    translate(pos.x, pos.y);
    imageMode(CENTER);
    image(this.img, 0, 0, this.w, this.h);
    pop();
  }
}
