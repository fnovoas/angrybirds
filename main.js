const {
  Engine, World, Bodies, Body, Constraint, Mouse, MouseConstraint
}
= Matter;

let engine, world, ground, bird, slingShot, boxes = [], mc, birdImg = [], boxImg, groundImg, bgImg, pigImg, pigs = [], currentLevel = 0;
function preload() {
  birdImg = [
    loadImage("sprites/red.png"),
    loadImage("sprites/stella.png")
  ];
  boxImg = loadImage("sprites/box.png");
  groundImg = loadImage("sprites/ground.png");
  bgImg = loadImage("sprites/fondo.png");
  pigImg = [
    loadImage("sprites/pig1.png"), // Small Pig = bola 1
    loadImage("sprites/pig2.png"), // Medium Pig = bola 2
    loadImage("sprites/pig3.png"), // Large Pig = bola 3
    loadImage("sprites/pig4.png"), // Helmet Pig = bola 8
    loadImage("sprites/pig5.png"), // Mustache Pig = bola 12
    loadImage("sprites/pig6.png")  // King Pig = bola 15
  ];
  slingshotImg = loadImage("sprites/slingshot.png");
  levelData = loadJSON("config.json"); // Cargar el archivo JSON
}

function setup() {
  const canvas = createCanvas(984, 480);
  engine = Engine.create();
  world = engine.world;

  const mouse = Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();

  mc = MouseConstraint.create(engine, {
  mouse:
    mouse,
    collisionFilter:
    {
    mask:
      2
    }
  }
  );
  World.add(world, mc);

  ground = new Ground(width / 2, height - 10, width, 20, groundImg);

  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 4; i++) {
      const box = new Box(400 + j * 60, height - 40 * (i + 1), 40, 40, boxImg);
      boxes.push(box);
    }
  }
  noSmooth();
  bird = new Bird(120, 375, 20, 2, birdImg[0]);
  slingShot = new SlingShot(bird);
  loadLevel(0); // Cargar el primer nivel del archivo JSON

  // Añadir cerdos de diferentes tipos con la imagen específica
  pigs.push(new Pig(450, 400, 20, "small", pigImg[0]));    // pig1.png
  pigs.push(new Pig(550, 380, 25, "medium", pigImg[1]));   // pig2.png
  pigs.push(new Pig(600, 360, 30, "large", pigImg[2]));    // pig3.png
  pigs.push(new Pig(650, 340, 30, "helmet", pigImg[3]));   // pig4.png
  pigs.push(new Pig(700, 320, 35, "mustache", pigImg[4])); // pig5.png
  pigs.push(new Pig(750, 300, 40, "king", pigImg[5]));     // pig6.png
  // Detectar colisiones
  Matter.Events.on(engine, "collisionStart", (event) => {
    for (const pair of event.pairs) {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      // Comprobar si un cerdo está involucrado en la colisión
      for (const pig of pigs) {
        if (bodyA === pig.body || bodyB === pig.body) {
          pig.checkCollisionImpact(pair);
        }
      }
    }
  }
  );
  const walls = [
    Bodies.rectangle(width / 2, -10, width, 20, {
  isStatic:
    true
  }
  ), // Techo
    Bodies.rectangle(-10, height / 2, 20, height, {
  isStatic:
    true
  }
  ), // Pared izquierda
    Bodies.rectangle(width + 10, height / 2, 20, height, {
  isStatic:
    true
  }
  ) // Pared derecha
  ];
  World.add(world, walls);
}

function draw() {
  // Limpia el canvas con un fondo blanco
  background(255);

  // Ajustar la imagen de fondo para cubrir todo el canvas correctamente
  let canvasAspectRatio = width / height;
  let imageAspectRatio = bgImg.width / bgImg.height;

  if (imageAspectRatio > canvasAspectRatio) {
    // Imagen más ancha que el canvas, ajusta por altura
    let imgHeight = height;
    let imgWidth = imgHeight * imageAspectRatio;
    image(bgImg, (width - imgWidth) / 2, 0, imgWidth, imgHeight);
  } else {
    // Imagen más alta que el canvas, ajusta por ancho
    let imgWidth = width;
    let imgHeight = imgWidth / imageAspectRatio;
    image(bgImg, 0, (height - imgHeight) / 2, imgWidth, imgHeight);
  }

  Engine.update(engine);
  slingShot.fly(mc);
  ground.show();

  // Asegurar que todas las cajas se dibujen
  for (const box of boxes) {
    box.show();
  }

  slingShot.show();
  bird.show();

  for (const pig of pigs) {
    pig.display();
  }
  for (const pig of pigs) {
    if (!pig.isDefeated) {
      const d = dist(
        pig.body.position.x, pig.body.position.y,
        bird.body.position.x, bird.body.position.y
        );
      if (d < pig.r + bird.body.circleRadius) {
        pig.takeDamage();
      }
    }
  }
  checkLevelCompletion(); // Revisar si todos los cerdos están derrotados
}

function keyPressed() {
  if (key == ' ') {
    World.remove(world, bird.body);
    const index = floor(random(0, birdImg.length));
    bird = new Bird(120, 375, 20, 2, birdImg[index]);
    slingShot.attach(bird);
  }
}

function loadLevel(levelIndex) {
  const level = levelData.levels[levelIndex];

  // Eliminar todos los cuerpos actuales
  for (const box of boxes) World.remove(world, box.body);
  for (const pig of pigs) World.remove(world, pig.body);
  boxes = [];
  pigs = [];

  // Añadir las cajas
  for (const box of level.boxes) {
    boxes.push(new Box(box.x, box.y, box.w, box.h, boxImg));
  }
console.log(`Cajas cargadas:
  $ {
    boxes.length
  }
  `);

  // Añadir los cerdos
  for (const pig of level.pigs) {
    const pigTypeIndex = ["small", "medium", "large", "helmet", "mustache", "king"].indexOf(pig.type);
    pigs.push(new Pig(pig.x, pig.y, pig.r, pig.type, pigImg[pigTypeIndex], pig.score));
  }
}

function nextLevel() {
  currentLevel++;
  if (currentLevel < levelData.levels.length) {
    loadLevel(currentLevel);
    bird = new Bird(120, 375, 20, 2, birdImg[0]);
    slingShot.attach(bird);
    console.log(`Nivel $ {
      currentLevel + 1
    }
    cargado`);
  } else {
    console.log("¡Victoria!");
    noLoop(); // Detener el juego
  }
}

function checkLevelCompletion() {
  const allDefeated = pigs.every(pig => pig.isDefeated);
  if (allDefeated) {
    nextLevel();
  }
}
