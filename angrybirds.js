const {Engine, World, Bodies,
  Body, Constraint,
  Mouse, MouseConstraint} = Matter;

let engine, world, ground, bird,
  slingShot, boxes = [], mc,
  birdImg = [], boxImg, groundImg;

function preload(){
  birdImg = [
    loadImage("sprites/red.png"),
    loadImage("sprites/stella.png")
  ];
  boxImg = loadImage("sprites/box.png");
  groundImg = loadImage("sprites/ground.png");
  bgImg = loadImage("sprites/fondo.png"); // Cargar la imagen del fondo
}

function setup() {
  const canvas = createCanvas(984, 480);
  
  engine = Engine.create();
  world = engine.world;
  
  const mouse = Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();
  
  mc = MouseConstraint.create(
    engine, {
      mouse: mouse,
      collisionFilter: {
        mask: 2
      }
    });
  World.add(world, mc);
  
  ground = new Ground(
    width/2, height-10, width, 20,
    groundImg);
  
  for (let j=0; j<4; j++){
    for (let i=0; i<10; i++){
      const box = new Box(
        400 + j*60,
        height - 40*(i+1),
        40, 40, boxImg);
      boxes.push(box);
    }
  }
  
  bird = new Bird(120, 375, 20, 2,
    birdImg[0]);
  
  slingShot = new SlingShot(bird);
  noSmooth();
}

function draw() {
  background(bgImg); // Usar la imagen del fondo
  
  Engine.update(engine);
  slingShot.fly(mc);
  
  ground.show();
  
  for(const box of boxes) {
    box.show();
  }
  
  slingShot.show();
  bird.show();
}

function keyPressed(){
  if (key == ' ') {
    World.remove(world, bird.body);
    const index = floor(
      random(0, birdImg.length)
    );
    bird = new Bird(120, 375, 20, 2,
      birdImg[index]);
    slingShot.attach(bird);
  }
}


// Bird (Circle), SlingShot (Constraint)
// Box (rectangle), Pig (Circle),
// Ground (Box => isStatic)

class Box {
  constructor(x,y,w,h,img,options={}){
    this.body = Bodies.rectangle(
      x,y,w,h,options);
    this.w = w;
    this.h = h;
    this.img = img;
    World.add(world, this.body);
  }
  
  show(){
    push();
    
    translate(
      this.body.position.x,
      this.body.position.y);
    rotate(this.body.angle);
    
    //rectMode(CENTER);
    //rect(0,0,this.w,this.h);
    
    imageMode(CENTER);
    image(this.img,
      0,0,this.w,this.h)
    pop();
  }
}

class Ground extends Box {
  constructor(x,y,w,h,img){
    super(x,y,w,h,img,{isStatic: true});
  }
}

class Bird {
  constructor(x,y,r,mass,img) {
    this.body = Bodies.circle(
      x, y, r, {
      restitution: 0.7,
      collisionFilter: {
        category: 2
      }
      });
    this.img = img;
    Body.setMass(this.body, mass);
    World.add(world, this.body);
  }
  
  show(){
    push();
    imageMode(CENTER);
    translate(this.body.position.x,
      this.body.position.y);
    rotate(this.body.angle);
    image(this.img, 0, 0,
      2*this.body.circleRadius,
      2*this.body.circleRadius);
    pop();
    
    //ellipse(this.body.position.x,
    //  this.body.position.y,
    //  2*this.body.circleRadius,
    //  2*this.body.circleRadius);
  }
}

class SlingShot {
  constructor(bird) {
    this.sling = Constraint.create({
      pointA: {
        x: bird.body.position.x,
        y: bird.body.position.y
      },
      bodyB: bird.body,
      stiffness: 0.05,
      length: 5
    });
    World.add(world, this.sling);
  }
  
  show() {
    if (this.sling.bodyB) {    
      line(this.sling.pointA.x,
        this.sling.pointA.y,
        this.sling.bodyB.position.x,
        this.sling.bodyB.position.y
      );
    }
  }
  
  fly(mc){
    if(this.sling.bodyB &&
       mc.mouse.button === -1 &&
       this.sling.bodyB.position.x > 
       this.sling.pointA.x + 10) {
       this.sling.bodyB.collisionFilter.category = 1
       this.sling.bodyB = null;
    }
  }
  
  attach(bird) {
    this.sling.bodyB = bird.body;
  }
}
