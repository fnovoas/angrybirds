const {
  Engine, World, Bodies, Body, Constraint, Mouse, MouseConstraint
}
= Matter;

let engine, world, ground, bird, slingShot, boxes = [], mc, birdImg = [], boxImg, groundImg, bgImg, pigImg, pigs = [], currentLevel = 0;
let iceImg, rockImg;
let trajectoryPoints = []; // Almacena los puntos blancos de la trayectoria
const maxTrajectoryPoints = 6; // Número máximo de puntos visibles
const minSeparation = 3; // Separación mínima entre puntos
const maxSeparation = 10; // Separación máxima entre puntos
let gameOver = false; // Bandera para evitar múltiples llamadas

function preload() {
  birdImg = [
    loadImage("sprites/red.png"),
    loadImage("sprites/stella.png")
  ];
  boxImg = loadImage("sprites/box.png");
  iceImg = loadImage("sprites/ice.png"); // Bloque de hielo
  rockImg = loadImage("sprites/rock.png"); // Bloque de piedra
  groundImg = loadImage("sprites/ground.png");
  bgImg = loadImage("sprites/fondo.png");
  pigImg = [
    loadImage("sprites/pig1.png"),
    loadImage("sprites/pig2.png"),
    loadImage("sprites/pig3.png"),
    loadImage("sprites/pig4.png"),
    loadImage("sprites/pig5.png"),
    loadImage("sprites/pig6.png")
  ];
  slingshotImg = loadImage("sprites/slingshot.png");
  levelData = loadJSON("config.json", () => { // Cargar configuración de niveles
    console.log("Archivo config.json cargado");
  }, () => {
    console.error("Error al cargar config.json");
  });
}

function validateLevelData(level) {
  if (!level.boxes || !Array.isArray(level.boxes) || !level.pigs || !Array.isArray(level.pigs)) {
    console.error("Nivel inválido en config.json");
    return false;
  }
  return true;
}

function setup() {
  const canvas = createCanvas(984, 480);
  userStartAudio(); // Activar AudioContext tras interacción del usuario
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
  ground = new Ground(width / 2, height - 10, width, 20, groundImg); // Crear el suelo
  // Crear bloques de diferentes tipos
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < 4; i++) {
      if (i % 3 === 0) {
        boxes.push(new Box(400 + j * 60, height - 40 * (i + 1), 40, 40, iceImg, 1)); // Hielo
      } else if (i % 3 === 1) {
        boxes.push(new Box(400 + j * 60, height - 40 * (i + 1), 40, 40, boxImg, 2)); // Madera
      } else {
        boxes.push(new Box(400 + j * 60, height - 40 * (i + 1), 40, 40, rockImg, 3)); // Piedra
      }
    }
  }
  noSmooth();
  bird = new Bird(120, 375, 20, 2, birdImg[0]);
  slingShot = new SlingShot(bird);
  if (levelData && levelData.levels && levelData.levels.length > 0) {
    loadLevel(0); // Cargar el primer nivel del archivo JSON
  } else {
    console.error("No se encontraron niveles en config.json");
  } 
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

    // Comprobar si un bloque está involucrado en la colisión
    for (const box of boxes) {
      if (bodyA === box.body || bodyB === box.body) {
        // Obtener la velocidad relativa del impacto
        const velocity = Math.max(
          Math.abs(bodyA.velocity.x - bodyB.velocity.x),
          Math.abs(bodyA.velocity.y - bodyB.velocity.y)
        );
        box.takeDamage(velocity * 50); // Reducir salud según la fuerza del impacto
      }
    }
  }
});
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

  //RESIZE background image
  image(bgImg, bgImg.width , bgImg.height, width, height+50);
  Engine.update(engine);
  slingShot.fly(mc);
  ground.show();

  // Asegurar que todas las cajas se dibujen
  for (const box of boxes) {
    box.show();
  }

  // Dibujar los puntos de trayectoria
  slingShot.calculateTrajectory(); // Actualizar los puntos
  for (const point of trajectoryPoints) {
    push();
    fill(255);
    stroke(0);
    strokeWeight(1);
    ellipse(point.x, point.y, point.size); // Dibujar un círculo por punto
    pop();
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
  if (key === 'r') {
    console.log("Reiniciando nivel...");
    loadLevel(currentLevel);
  }
}

function loadLevel(levelIndex) {
  console.log(`Cargando nivel ${levelIndex}`);
  // Verificar que el índice sea válido
  if (!levelData.levels || levelIndex < 0 || levelIndex >= levelData.levels.length) {
    console.error(`Nivel inválido: ${levelIndex}`);
    return; // Salir de la función si el nivel no existe
  }
  const level = levelData.levels[levelIndex];

  // Eliminar todos los cuerpos actuales
  for (const box of boxes) World.remove(world, box.body);
  for (const pig of pigs) World.remove(world, pig.body);
  boxes = [];
  pigs = [];

  // Añadir las cajas
  for (const box of level.boxes) {
    let img, hardness;

    // Asignar imagen y dureza según el tipo
    switch (box.type) {
      case "ice":
        img = iceImg;
        hardness = 10;
        break;
      case "rock":
        img = rockImg;
        hardness = 20;
        break;
      case "box":
      default:
        img = boxImg;
        hardness = 15;
        break;
    }

    // Crear la caja con las propiedades específicas
    boxes.push(new Box(box.x, box.y, box.w, box.h, img, hardness));
  }
  console.log(`Cajas cargadas: ${boxes.length}`);

  // Añadir los cerdos
  for (const pig of level.pigs) {
    const pigTypeIndex = ["small", "medium", "large", "helmet", "mustache", "king"].indexOf(pig.type);
    if (pigTypeIndex >= 0 && pigTypeIndex < pigImg.length) {
      pigs.push(new Pig(pig.x, pig.y, pig.type, pigImg[pigTypeIndex]));
    } else {
      console.error(`Tipo de cerdo inválido: ${pig.type}`);
    }
  }
  console.log(`Cajas cargadas: ${boxes.length}`);
  }

  function nextLevel() {
    // Verificar si el juego ya terminó
    if (gameOver) return; // Evitar múltiples llamadas si la bandera ya está activa
    console.log("Pasando al siguiente nivel");
    
    // Incrementar el índice del nivel actual
    currentLevel++;
  
    // Comprobar si se ha alcanzado el último nivel
    if (currentLevel >= levelData.levels.length) {
      console.log("¡Victoria! Has completado todos los niveles."); // Mensaje final de victoria
      gameOver = true; // Marcar el juego como terminado
      noLoop(); // Detener la ejecución del juego
      return; // Salir de la función
    }
  
    // Si aún hay niveles disponibles, cargar el siguiente nivel
    console.log(`Cargando nivel ${currentLevel}`);
    loadLevel(currentLevel); // Cargar la configuración del nuevo nivel
  
    // Reiniciar el pájaro y la resortera para el nuevo nivel
    bird = new Bird(120, 375, 20, 2, birdImg[0]); // Crear un nuevo pájaro
    slingShot.attach(bird); // Reconectar el pájaro a la resortera
  }  

  function checkLevelCompletion() {
    if (currentLevel >= levelData.levels.length) return; // Salir si ya no hay más niveles
    const allDefeated = pigs.every(pig => pig.isDefeated);
    if (allDefeated) {
      console.log("Todos los cerdos están derrotados");
      console.log("Nivel completado");
      nextLevel();
    }
  }  