var canvas,renderer,scene,textureLoader,width,height,numXTiles,numYTiles,initialFrogPosition,orthographicCamera,perspectiveCamera;
var ambientLight,light,animationRequest;
var tileHeight, tileWidth, tileDepth, tileDepthOffset;
var frogObject, frogHeight, frogWidth, frogDepth, frogDepthOffset, frogHealth, frogWon;
var carObjects,carHeight,carWidth,carDepth,carDepthOffset, spawnOffset, carCount;
var logObjects, logHeight, logWidth, logDepth, logDepthOffset, logSpawnOffset,logSpeed,logCount;
var pressed;
var frogAlive=true;
var isOrthographic = true;
var frogWon = false;
var rowTiles = [0,1, 1, 1, 1,0,2, 2, 2, 2, 2,0];
var audioStart = new Audio('start.mp3');
var audioJump = new Audio('jump.mp3');
var audioEnd = new Audio('end.mp3');
var audioWin= new Audio('win.mp3');
function cameraSetup() {
    orthographicCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height /
        -2, 1, 2000);
    orthographicCamera.position.set(width / 2, height / 2, 610);

    perspectiveCamera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
    perspectiveCamera.position.set(width / 2, height / 2, 610);
    perspectiveCamera.lookAt(new THREE.Vector3(width / 2, height / 2, 0));

    scene.add(orthographicCamera);
    scene.add(perspectiveCamera);
}

function lightSetup() {
    ambientLight = new THREE.AmbientLight(0x101010);
    scene.add(ambientLight);

    light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(width / 2, height / 2, 1000);
    scene.add(light);
}

function textureSetup(texture, color) {
    var geometry, material, texture, cube;

    geometry = new THREE.BoxGeometry(1, 1, 5);
    if (texture)
        material = new THREE.MeshBasicMaterial({
            map: texture
        });
    else
        material = new THREE.MeshPhongMaterial({
            specular: 0xffffff,
            shininess: 2,
            shading: THREE.FlatShading
        });

    if (color)
        material.color = color;

    cube = new THREE.Mesh(geometry, material);
    return cube;
}

function banksSetup() {
    console.log('here');
    var texture = textureLoader.load('sand1.jpg', function() {
        var cube;

        for (var i = 0; i < rowTiles.length; i++) {
            if (rowTiles[i] == 0) {
              console.log('Entering here');
              cube = textureSetup(texture);
              cube.scale.set(width, tileHeight, tileDepth);
              cube.position.set(width / 2, (i * tileHeight) + (tileHeight / 2), tileDepthOffset);
              scene.add(cube);
          }
        }
    });
}

function roadSetup() {
    var texture = textureLoader.load('road.jpg', function() {
        var cube;

        for (var i = 0; i < rowTiles.length; i++) {
            if (rowTiles[i] == 1){
              cube = textureSetup(texture);
              cube.scale.set(width, tileHeight, tileDepth);
              cube.position.set(width / 2, (i * tileHeight) + (tileHeight / 2), tileDepthOffset);
              scene.add(cube);
          }
        }
    });
}

function riverSetup() {
    var texture = textureLoader.load('river.jpg', function() {
        var cube;
        for (var i = 0; i < rowTiles.length; i++) {
            if (rowTiles[i] == 2) {
              cube = textureSetup(texture);
              cube.scale.set(width, tileHeight, tileDepth);
              cube.position.set(width / 2, (i * tileHeight) + (tileHeight / 2), tileDepthOffset);
              scene.add(cube);
            }
        }
    });
}

function frogSetup() {
    var texture = textureLoader.load('frog.png', function() {
        var cube;
        cube = textureSetup(texture);
        cube.scale.set(frogWidth, frogHeight, frogDepth);
        cube.position.set(initialFrogPosition.x, initialFrogPosition.y, initialFrogPosition.z);
        scene.add(cube);
        frogObject = cube;
    });
}

function carInPosition(row, col) {
    var x, y, objX, objY;
    for (var i = 0; i < carObjects.length; i++) {
        x = (col * tileWidth) + (tileWidth / 2);
        y = (row * tileHeight) + (tileHeight / 2);
        objX = carObjects[i].position.x;
        objY = carObjects[i].position.y;
        if ((objX < (x + carWidth) && objX > (x - carWidth)) &&
            (objY < (y + carHeight) && objY > (y - carHeight)))
            return true;
    }
    return false;
}
function carsSetup() {
    var texture = textureLoader.load('car1.jpg', function() {
        var cube, row, col;

        for (var i = 0; i < carCount; i++) {
            do {
                row = Math.floor(Math.random() * 4) + 1;
                col = Math.floor(Math.random() * numXTiles);
            } while (carInPosition(row, col));

            cube = textureSetup(texture);
            cube.scale.set(carWidth, carHeight, carDepth);
            cube.position.set((col * tileWidth) + (tileWidth / 2),
                (row * tileHeight) + (tileHeight / 2),
                carDepthOffset);
            scene.add(cube);
            carObjects.push(cube);
        }
    });
}
function moveCars() {
    for (var i = 0; i < carObjects.length; i++) {
        var speed, carRow;

        currentRow = (carObjects[i].position.y - tileHeight / 2) / tileHeight;
        speed = 1.5;
        if (currentRow % 2 == 0) {
            carObjects[i].position.x += speed;
            if (carObjects[i].position.x > (width + tileWidth / 2)) {
                do {
                    row = Math.floor(Math.random() * 4) + 1;
                    if (row % 2 == 0)
                        col = -Math.floor(Math.random() * spawnOffset) - 1;
                    else
                        col = Math.floor(Math.random() * spawnOffset) + numXTiles;
                } while (carInPosition(row, col));

                carObjects[i].position.set((col * tileWidth) + (tileWidth / 2),
                    (row * tileHeight) + (tileHeight / 2),
                    carDepthOffset);
            }
        } else {
            carObjects[i].position.x -= speed;
            if (carObjects[i].position.x < -(tileWidth / 2)) {
                do {
                    row = Math.floor(Math.random() * 4) + 1;
                    if (row % 2 == 0)
                        col = -Math.floor(Math.random() * spawnOffset) - 1;
                    else
                        col = Math.floor(Math.random() * spawnOffset) + numXTiles;
                } while (carInPosition(row, col));

                carObjects[i].position.set((col * tileWidth) + (tileWidth / 2),
                    (row * tileHeight) + (tileHeight / 2),
                    carDepthOffset);
            }
        }
    }
}

function moveLogs() {
    for (var i = 0; i < logObjects.length; i++) {
        var speed, currentRow;

        currentRow = (logObjects[i].position.y - tileHeight / 2) / tileHeight;
        speed = 2.5;

        if (currentRow % 2 == 0) {
            logObjects[i].position.x -= speed;
            if (logObjects[i].position.x < -(tileWidth / 2)) {
                do {
                    row = Math.floor(Math.random() * 5) + 6;
                    if (row % 2 != 0)
                        col = -Math.floor(Math.random() * logSpawnOffset) - 1;
                    else
                        col = Math.floor(Math.random() * logSpawnOffset) + numXTiles;
                } while (logInPosition(row, col));

                logObjects[i].position.set((col * tileWidth) + (tileWidth / 2),
                    (row * tileHeight) + (tileHeight / 2),
                    logDepthOffset);
            }
        } else {
            logObjects[i].position.x += speed;
            if (logObjects[i].position.x > (width + tileWidth / 2)) {
                do {
                    row = Math.floor(Math.random() * 5) + 6;
                    if (row % 2 != 0)
                        col = -Math.floor(Math.random() * logSpawnOffset) - 1;
                    else
                        col = Math.floor(Math.random() * logSpawnOffset) + numXTiles;
                } while (logInPosition(row, col));

                logObjects[i].position.set((col * tileWidth) + (tileWidth / 2),
                    (row * tileHeight) + (tileHeight / 2),
                    logDepthOffset);
            }
        }
    }
}
function checkIfOk(){
  console.log("here");
    var i, x, y, row, col;
    if (frogObject == null)
        return true;
    x = frogObject.position.x;
    y = frogObject.position.y;
    row = Math.floor(y / tileHeight);
    col = Math.floor(x / tileWidth);
    if(row == 11) frogWon = true;
    if (rowTiles[row] == 0)
        return true;

    if (rowTiles[row] == 1) {
        for (i = 0; i < carObjects.length; i++) {
            objX = carObjects[i].position.x;
            objY = carObjects[i].position.y;
            xDiff = carWidth / 2 + frogWidth / 2;
            yDiff = carHeight / 2 + frogHeight / 2;
            if ((objX < (x + xDiff) && objX > (x - xDiff)) &&
                (objY < (y + yDiff) && objY > (y - yDiff)))
                return false;
        }
        return true;
    } else if (rowTiles[row] == 2) {
        for (i = 0; i < logObjects.length; i++) {
            objX = logObjects[i].position.x;
            objY = logObjects[i].position.y;
            xDiff = logWidth / 2 + frogWidth / 2;
            yDiff = logHeight / 2 + frogHeight / 2
            if ((objX < (x + xDiff) && objX > (x - xDiff)) &&
                (objY < (y + yDiff) && objY > (y - yDiff)))
                return true;
        }
        return false;
    }

    return true;
}
function moveFrog() {
    var i, x, y, row, col, speed, currentRow;

    if (frogObject == null)
        return;

    x = frogObject.position.x;
    y = frogObject.position.y;
    row = Math.floor(y / tileHeight);
    col = Math.floor(x / tileWidth);

    if (rowTiles[row] != 2)
        return;

    for (i = 0; i < logObjects.length; i++) {
        objX = logObjects[i].position.x;
        objY = logObjects[i].position.y;
        xDiff = logWidth / 2 + frogWidth / 2;
        yDiff = logHeight / 2 + frogHeight / 2
        if ((objX < (x + xDiff) && objX > (x - xDiff)) &&
            (objY < (y + yDiff) && objY > (y - yDiff))) {
            currentRow = (objY - tileHeight / 2) / tileHeight;
            speed = 2.5;
            if (currentRow % 2 == 0)
                frogObject.position.x -= speed;
            else
                frogObject.position.x += speed;
            //ensureHeroInGame();
            return;
        }
    }
}
function logInPosition(row, col) {
    var x, y, objX, objY;
    for (var i = 0; i < logObjects.length; i++) {
        x = (col * tileWidth) + (tileWidth / 2);
        y = (row * tileHeight) + (tileHeight / 2);
        objX = logObjects[i].position.x;
        objY = logObjects[i].position.y;
        if (objX == x && objY == y)
            return true;
    }

    return false;
}
function logsSetup() {
    var texture = textureLoader.load('log.jpg', function() {
        var cube, row, col;

        for (var i = 0; i < logCount; i++) {
            do {
                row = Math.floor(Math.random() * 5) + 6;
                col = Math.floor(Math.random() * numXTiles);
            } while (logInPosition(row, col));

            cube = textureSetup(texture);
            cube.scale.set(logWidth, logHeight, logDepth);
            cube.position.set((col * tileWidth) + (tileWidth / 2),
                (row * tileHeight) + (tileHeight / 2),
                carDepthOffset);
            scene.add(cube);
            logObjects.push(cube);
        }
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(logWidth / tileWidth, 1);
}
function createScene() {
    scene = new THREE.Scene();
    audioStart.currentTime = 0;
    audioStart.loop = true;
    audioStart.play();
    cameraSetup();
    lightSetup();
    banksSetup();
    roadSetup();
    riverSetup();
    frogSetup();
    carsSetup();
    logsSetup();
}
function handleKeyDown(event) {
    var key = event.keyCode;
    if (pressed)
        return;
    pressed = true;
    if (key == 67)
    isOrthographic = !isOrthographic;
    if(key==37 || key == 38|| key ==39 || key==40) {
      audioJump.currentTime = 0;
      audioJump.play();
    }
    if (key == 37)
        frogObject.position.x -= tileWidth;
    if (key == 39)
        frogObject.position.x += tileWidth;
    if (key == 38)
        frogObject.position.y += tileHeight;
    if (key == 40)
        frogObject.position.y -= tileHeight;

}
function handleKeyUp(event) {
    pressed = false;
}
function setup() {
    frogAlive = true;
    frogWon = false;
    width = 800;
    height = 480;
    tileWidth = 40;
    tileHeight = 40;
    tileDepth = 10;
    tileDepthOffset = 0;
    numXTiles = width/tileWidth;
    numYTiles = height/tileHeight;
    frogHeight = 2 * tileHeight / 3;
    frogWidth = 2 * tileWidth / 3;
    frogDepth = 5;
    frogDepthOffset = 70;
    frogHealth = 3;
    frogAlive = true;
    frogWon = false;
    carObjects = [];
    carHeight =  2 * tileHeight / 3;
    carWidth =  tileWidth;
    carDepth =  tileDepth;
    carDepthOffset = 50;
    spawnOffset = 3;
    carCount =  25;
    logObjects= [];
    logHeight= 2 *tileHeight / 3;
    logWidth= tileWidth * 2;
    logDepth= tileDepth;
    logDepthOffset= 50;
    logSpawnOffset = 3;
    logCount= 20;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.shadowMapEnabled = true;
    canvas = document.getElementById("canvas");
    canvas.appendChild(renderer.domElement);
    textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    initialFrogPosition = new THREE.Vector3(((numXTiles / 2) * tileWidth) + tileWidth / 2, tileHeight / 2, frogDepthOffset);
    createScene();
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
}
function reset() {
    carObjects = [];
    logObjects = [];
    frogObject = null;
    frogAlive = true;
    frogWon = false;
    createScene();
}
function drawScene() {
  animationRequest = requestAnimationFrame(drawScene);
  if(isOrthographic)
  renderer.render(scene, orthographicCamera);
  else {
    renderer.render(scene, perspectiveCamera);
  }
  console.log(frogAlive);
  if(!frogAlive) {
  var numberOfLives = parseInt(document.getElementById('lives').innerHTML);
  var score = parseInt(document.getElementById('score').innerHTML);
  if(numberOfLives==0) {
    alert('You lose with your score as ' + score);
    window.location.reload();
  }
  else{
    document.getElementById('lives').innerHTML = numberOfLives -1;
    audioEnd.play(); alert('Oops you lose'); reset();}
  }
  if(frogWon) {
    document.getElementById('score').innerHTML = parseInt(document.getElementById('score').innerHTML) + 1;
    audioWin.play(); alert('You win'); reset();
  }
  moveCars();
  moveLogs();
  moveFrog();
  frogAlive = checkIfOk();
}
alert('Lets Start Game');
setup();
drawScene();
