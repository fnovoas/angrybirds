class Box {
  /**
   * Constructor para crear un objeto de tipo caja.
   * @param {number} x - Posición en el eje X.
   * @param {number} y - Posición en el eje Y.
   * @param {number} w - Ancho de la caja.
   * @param {number} h - Altura de la caja.
   * @param {object} img - Imagen para la textura de la caja.
   * @param {object} options - Opciones físicas para el cuerpo (opcional).
   */
  constructor(x, y, w, h, img, options = { restitution: 0.5, friction: 0.5}) {
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.w = w;
    this.h = h;
    this.img = img;
    World.add(world, this.body); // Añadir el cuerpo al mundo físico
  }

  //Método para mostrar la caja en el canvas.
  show() {
    const pos = this.body.position;
    const angle = this.body.angle;
    push();
    translate(pos.x, pos.y); // Mover al lugar donde está la caja
    rotate(angle);           // Rotar según el ángulo físico
    imageMode(CENTER);       // Configurar el modo de dibujo centrado
    image(this.img, 0, 0, this.w, this.h); // Dibujar la imagen

    /* // Contorno para depuración (quitar si no es necesario)
    noFill();
    stroke(255, 0, 0);       // Color del contorno: rojo
    rectMode(CENTER);        // Configurar el rectángulo centrado
    rect(0, 0, this.w, this.h); // Dibujar el contorno de la caja */
    pop();
  }
}
