class Box {
  /**
   * Constructor para crear un objeto de tipo caja.
   * @param {number} x - Posición en el eje X.
   * @param {number} y - Posición en el eje Y.
   * @param {number} w - Ancho de la caja.
   * @param {number} h - Altura de la caja.
   * @param {object} img - Imagen para la textura de la caja.
   * @param {number} hardness - Nivel de dureza del bloque (opcional, 1 por defecto).
   * @param {object} options - Opciones físicas para el cuerpo (opcional).
   */
constructor(x, y, w, h, img, hardness = 1, options = {
  restitution: 0,
  friction: 0.5,
  mass: Math.sqrt(hardness),
}
) {
  this.body = Bodies.rectangle(x, y, w, h, options);
  this.w = w;
  this.h = h;
  this.img = img;
  this.health = hardness ** 2; // La salud del bloque depende de su dureza
  World.add(world, this.body);
}

// Método para mostrar la caja en el canvas.
show() {
  const pos = this.body.position;
  const angle = this.body.angle;
  push();
  translate(pos.x, pos.y);
  rotate(angle);
  imageMode(CENTER);
  image(this.img, 0, 0, this.w, this.h);
  pop();
}

// Método para reducir la salud en función del impacto.
takeDamage(momentum) {
  this.health -= momentum; // Reducir la salud según la fuerza del impacto
  if (this.health <= 0) {
    World.remove(world, this.body); // Eliminar del mundo físico si la salud llega a 0
    boxes = boxes.filter((box) => box.body !== this.body); // Eliminar de la lista de bloques
  }
}
}
