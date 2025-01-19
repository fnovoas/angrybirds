const {
  Engine, World, Bodies, Body, Constraint, Mouse, MouseConstraint
}
= Matter;

let engine, world, ground, bird, slingShot, boxes = [], mc, birdImg = [], boxImg, groundImg, bgImg, pigImg, pigs = [], currentLevel = 0;
let iceImg, rockImg;
let trajectoryPoints = []; // Almacena los puntos blancos de la trayectoria
const maxTrajectoryPoints = 15; // Número máximo de puntos visibles
const minSeparation = 10; // Separación mínima entre puntos
const maxSeparation = 15; // Separación máxima entre puntos
let gameOver = false; // Bandera para evitar múltiples llamadas
let birdsQueue = []; // Manejar los pájaros disponibles y su orden
let lastTouchTime;
let birdSpeedRecord100 = []; // Almacena los ultimos 100 tiempos de vuelo de los pájaros
const movementThreshold = 0.1;
let momentumThreshold = 7;

function preload() {
  birdImg = [
    loadImage("sprites/red.png"),
    loadImage("sprites/stella.png"),
    loadImage("sprites/blues.png"),
    loadImage("sprites/chuck.png")
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
  lastTouchTime = null;
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
    category:
      4,
    mask:
      4
    }
  }
  );
  World.add(world, mc);
  ground = new Ground(width / 2, height - 10, width, 20, groundImg); // Crear el suelo
  
  noSmooth();
  bird = new Bird(120, 375, "red");
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

    // Calcular momento
    const momentumBodyA = {
      x: bodyA.velocity.x * (isFinite(bodyA.mass) ? bodyA.mass : 0),
      y: bodyA.velocity.y * (isFinite(bodyA.mass) ? bodyA.mass : 0)
    };
    const momentumBodyB = {
      x: bodyB.velocity.x * (isFinite(bodyB.mass) ? bodyB.mass : 0),
      y: bodyB.velocity.y * (isFinite(bodyB.mass) ? bodyB.mass : 0)
    };
    const relativeMomentum = Math.sqrt(
      Math.pow(momentumBodyA.x - momentumBodyB.x, 2) +
      Math.pow(momentumBodyA.y - momentumBodyB.y, 2)
    );

    if (relativeMomentum > momentumThreshold) {
      console.log("Colisión con momento detectada");
      for (const pig of pigs) {
        if (bodyA === pig.body || bodyB === pig.body) {
          console.log(pair);
          //const isBirdInvolved = bodyA === bird.body || bodyB === bird.body;
          //const damage = isBirdInvolved ? relativeMomentum * 2 : relativeMomentum;
          pig.takeDamage(relativeMomentum);
        }
      }
      for (const box of boxes) {
        if (bodyA === box.body || bodyB === box.body) {
          box.takeDamage(relativeMomentum);
        }
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

function displayBirdQueue() {
  const birdIconSize = 40; // Tamaño de las imágenes de los pájaros
  const margin = 8; // Espacio entre los íconos
  const startY = height - birdIconSize - 1; // Posición inicial en Y
  let startX;

  if (birdsQueue.length === 1) {
    // Si solo hay un pájaro, colócalo cerca de la resortera
    startX = 100; // Ajusta este valor según la posición de la resortera
  } else {
    // Si hay más pájaros, empieza desde la izquierda
    startX = 10;
  }

  for (let i = 0; i < birdsQueue.length; i++) {
    const birdData = birdsQueue[i];
    const x = startX + i * (birdIconSize + margin); // Calcula la posición horizontal
    image(birdData.img, x, startY, birdIconSize, birdIconSize); // Dibuja el ícono del pájaro
  }
}

function draw() {
  // Limpia el canvas con un fondo blanco
  background(255);

  //RESIZE background image
  image(bgImg, bgImg.width , bgImg.height, width, height+50);
  Engine.update(engine);

  // Registrar la velocidad del pájaro
  if (bird && !slingShot.isAttached()) {
    birdSpeedRecord100.push(bird.body.speed);
    if (birdSpeedRecord100.length > 100) {
      birdSpeedRecord100.shift(); // Eliminar el valor más antiguo
    }
  }

  bird.update(); // Actualizar el pájaro
  // Power up
  if (!slingShot.isAttached() && mc.mouse.button === 0) {
    bird.activatePowerUp();
  }

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
  checkNewBird(); // DESCOMENTAR PARA QUE SE SUBAN LOS PAJAROS AUTOMATICAMENTE
  checkLevelCompletion(); // Revisar si todos los cerdos están derrotados
  displayBirdQueue(); // Mostrar la cola de pájaros
}

function keyPressed() {
  if (key === ' ') {
    // Verificar si hay un pájaro sujeto a la resortera
    if (bird && slingShot.isAttached()) {
      console.log("El pájaro actual todavía está en la resortera.");
      return; // No hacer nada si hay un pájaro en la resortera
    }

    // Si no hay pájaro en la resortera, subir el siguiente de la cola
    if (birdsQueue.length > 0) {
      const birdData = birdsQueue.shift(); // Obtener el siguiente pájaro
      bird.removeBird(); // Eliminar el pájaro anterior (si existe)
      bird = new Bird(120, 375, birdData.type); // Crear un nuevo pájaro
      slingShot.attach(bird); // Adjuntar el nuevo pájaro a la resortera
    } else {
      // causa un crasheo
      // if (bird) { World.remove(world, bird.body); } // Eliminar el pájaro actual
      setTimeout(() => {
        loadLevel(currentLevel); // Reiniciar el nivel actual
      }, 2000); // Espera 2000 ms (2 segundos) antes de reiniciar
      console.log("Sin más pájaros disponibles."); // Mostrar mensaje si no hay pájaros en la cola
    }
  }

  if (key === 'r') {
    console.log("Reiniciando nivel...");
    loadLevel(currentLevel); // Reiniciar el nivel actual
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

  // Eliminar todos los cerdos, cajas y pájaros actuales
  for (const box of boxes) World.remove(world, box.body);
  for (const pig of pigs) World.remove(world, pig.body);
  if (bird) bird.removeBird(); // Eliminar el pájaro actual
  birdsQueue = []; // Vaciar la cola de pájaros

  // Reiniciar arrays
  boxes = [];
  pigs = [];

  // Cargar la configuración de las cajas y los cerdos
  for (const box of level.boxes) {
    let img, hardness;
    // Asignar imagen y dureza según el tipo
    switch (box.type) {
      case "ice":
        img = iceImg;
        hardness = 1;
        break;
      case "rock":
        img = rockImg;
        hardness = 16;
        break;
      case "box":
      default:
        img = boxImg;
        hardness = 8;
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
  // Cargar los pájaros para el nivel
  birdsQueue = level.birds.map(type => {
    let img;
    switch (type) {
      case "red":
        img = birdImg[0];
        break;
      case "stella":
        img = birdImg[1];
        break;
      case "blues":
        img = birdImg[2];
        break;
      case "chuck":
        img = birdImg[3];
        break;
      default:
        img = birdImg[0]; // Default to red if type is unrecognized
        break;
    }
    return { type, img };
  });

  // Configurar el primer pájaro en la resortera
  if (birdsQueue.length > 0) {
    const birdData = birdsQueue.shift();
    bird = new Bird(120, 375, birdData.type);
    slingShot.attach(bird);
  }
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
    // bird = new Bird(120, 375, 20, 2, birdImg[0]); // Crear un nuevo pájaro
    // slingShot.attach(bird); // Reconectar el pájaro a la resortera
  }  

function checkLevelCompletion() {
  // Comprobar si todos los cerdos están derrotados
  const allDefeated = pigs.every(pig => pig.isDefeated);
  
  if (allDefeated) {
    console.log("Todos los cerdos están derrotados");
    nextLevel();
    return; // Salir de la función, ya que el nivel está completado
  }

  // Verificar si ya no hay más pájaros y el pájaro actual está en la resortera y los objetos están quietos
  const birdStopped = !slingShot.isAttached() && checkWorldStillness()
                      //Math.abs(bird.body.velocity.x) < 0.5 && 
                      //Math.abs(bird.body.velocity.y) < 0.5 &&
                      //bird.body.position.y > height - 40; // Cerca del suelo
  
  if (birdsQueue.length === 0 && birdStopped) {
    console.log("Nivel fallido. Reiniciando en 2 segundos...");
    setTimeout(() => {
      loadLevel(currentLevel); // Reiniciar el nivel actual
    }, 2000); // Espera 2000 ms (2 segundos) antes de reiniciar
  }
}

function checkWorldStillness(){
  const bodies = world.bodies;
  for (body of bodies){
    //si algun objeto se mueve el mundo sigue funcionando
    if(Math.abs(body.velocity.x) > movementThreshold || Math.abs(bird.body.velocity.y) > movementThreshold ){
      return false;
    }
  }
  return true;
}

function checkNewBird(){
  if( checkWorldStillness() && !slingShot.isAttached()){
    if (birdsQueue.length > 0) {
      const birdData = birdsQueue.shift(); // Obtener el siguiente pájaro
      bird.removeBird() // Eliminar el pájaro anterior (si existe)
      bird = new Bird(120, 375, birdData.type); // Crear un nuevo pájaro
      slingShot.attach(bird); // Adjuntar el nuevo pájaro a la resortera
    } else {
      console.log("Sin más pájaros disponibles."); // Mostrar mensaje si no hay pájaros en la cola
    }
  }
}