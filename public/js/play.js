const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvas2 = document.getElementById("createCanvas");
const ctx2 = canvas2.getContext("2d");
const quality = 2; //keep below 4
function setCanvasSize(canvas, w, h) {
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = canvas.width + "px";
  canvas.style.height = canvas.height + "px";
}
function setCanvasQuality(canvas, w, h) {
  canvas.width = w * quality;
  canvas.height = h * quality;
  canvas.style.width = canvas.width / quality + "px";
  canvas.style.height = canvas.height / quality + "px";
}
setCanvasQuality(canvas, window.innerWidth, window.innerHeight);
// setCanvasQuality(canvas2, window.innerWidth, window.innerHeight);

// ctx2.scale(quality, quality);
ctx2.fillStyle = "#000";
ctx2.fillRect(0, 0, 100, 100);
//draw piece shape
function createPiece(x, y, w, h, pos, s, b, ctx = ctx) {
  let connectorL = 0.15;
  let connectorS = 0.13;
  let bevel = 1.2;
  ctx.beginPath();
  ctx.save();
  ctx.translate(x, y);

  ctx.lineTo(0, h / 2 + h * connectorS * s[3]);
  ctx.lineTo(
    w * connectorL * pos[3],
    h / 2 + h * connectorS * bevel * b[3] * s[3]
  );
  ctx.lineTo(
    w * connectorL * pos[3],
    h / 2 - h * connectorS * bevel * b[3] * s[3]
  );
  ctx.lineTo(0, h / 2 - h * connectorS * s[3]);
  ctx.moveTo(0, 0);

  //TOP
  ctx.lineTo(w / 2 - w * connectorS * s[0], 0);
  ctx.lineTo(
    w / 2 - w * connectorS * bevel * b[0] * s[0],
    h * connectorL * pos[0]
  );
  ctx.lineTo(
    w / 2 + w * connectorS * bevel * b[0] * s[0],
    h * connectorL * pos[0]
  );
  ctx.lineTo(w / 2 + w * connectorS * s[0], 0);
  ctx.lineTo(w, 0);

  ctx.lineTo(w, h / 2 - h * connectorS * s[1]);
  ctx.lineTo(
    w + w * connectorL * pos[1],
    h / 2 - h * connectorS * bevel * b[1] * s[1]
  );
  ctx.lineTo(
    w + w * connectorL * pos[1],
    h / 2 + h * connectorS * bevel * b[1] * s[1]
  );
  ctx.lineTo(w, h / 2 + h * connectorS * s[1]);
  ctx.lineTo(w, h);

  ctx.lineTo(w / 2 + w * connectorS * s[2], h);
  ctx.lineTo(
    w / 2 + w * connectorS * bevel * b[2] * s[2],
    h + h * connectorL * pos[2]
  );
  ctx.lineTo(
    w / 2 - w * connectorS * bevel * b[2] * s[2],
    h + h * connectorL * pos[2]
  );
  ctx.lineTo(w / 2 - w * connectorS * s[2], h);

  ctx.lineTo(0, h);

  ctx.fill();
  ctx.strokeStyle = "#0f0";
  // ctx.stroke();
  ctx.restore();
}

//create piece shape
function pieceGenerator(grid) {
  let piecePos = Array.from(new Array(grid + 1), () =>
    Array.from(new Array(grid + 1)).fill(0)
  );
  let pieceS = Array.from(new Array(grid + 1), () =>
    Array.from(new Array(grid + 1)).fill(0)
  );
  let pieceB = Array.from(new Array(grid + 1), () =>
    Array.from(new Array(grid + 1)).fill(0)
  );
  return [piecePos, pieceS, pieceB];
}
function dist(x, y, x1, y1) {
  x = x - x1;
  y = y - y1;
  return Math.sqrt(x ** 2 + y ** 2);
}
function constrain(aNumber, aMin, aMax) {
  return aNumber > aMax ? aMax : aNumber < aMin ? aMin : aNumber;
}
function random(min, max) {
  return Math.random() * (max - min) + min;
}
function hexToBase64(str) {
  return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}

//draw background
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = "#f00";
// ctx.translate(50, 50);
const minimap = document.getElementById('map')
const puzzleImage = new Image();
let imageURL = document.getElementById('details').innerHTML.split(',')

let grid = ~~Math.sqrt(Number(imageURL[2]));
// console.log(imageURL)
if(imageURL[0] == "custom"){
  var img = new Image();
  img.src = imageURL[1]
  document.getElementById('banner').appendChild(img);
  puzzleImage.src = 'data:image/jpeg;base64,' + hexToBase64(document.getElementById('exImage').src)//btoa(imageURL[0]);
  // puzzleImage.src = document.getElementById('exImage').src
}
else {
  puzzleImage.src = `./assets/${imageURL[0]}/${imageURL[1]}`
}
// puzzleImage.src = "./assets/Waterfalls/Waterfalls1.jpg";
const testing = false;

let piecePos = pieceGenerator(grid)[0];
let pieceS = pieceGenerator(grid)[1];
let pieceB = pieceGenerator(grid)[2];
const pieces = [];
const mode = window.innerWidth > window.innerHeight ? "portrait" : "landscape";
let smallest = 0;
if (mode == "portrait") {
  smallest = window.innerHeight;
} else {
  smallest = window.innerWidth;
}
smallest *= quality;
const size = (smallest * 0.8) / grid;
setCanvasSize(canvas2, size * 3, size * 3);

let frameCount = 0;
let selectedPiece = false;
const errorDst = size * 0.3; // error distance of piece from start position
const dragDst = 1;
const connectorDst = 5;
const offset = {
  x: (canvas.width - size * grid) / 2,
  y: (canvas.height - size * grid) / 2,
};
let piecePadding = 0;
const edgesOnly = document.getElementById("check");

puzzleImage.onload = function () {
  document.getElementById('minimap').style.backgroundImage = 'url('+puzzleImage.src+')'
  pieces.forEach((piece) => piece.createImage(ctx2));
  draw();
};
// puzzleImage.src = "./assets/beach/Beach.jpg";
let dragged = false;

class Piece {
  constructor(x, y, pos, s, b, size, idxs) {
    this.x = x;
    this.y = y;
    this.start = {
      x: this.x,
      y: this.y,
    };
    this.overlap = {
      x: 0,
      y: 0,
    };
    this.width = size;
    this.height = size;
    this.origIdx = idxs;
    this.idxs = idxs;
    this.pos = pos;
    this.s = s;
    this.b = b;
    this.isEdge = false;
    //REMOVE CONNECTORS FROM EDGES
    if (this.idxs[0] == 0) {
      this.pos[3] = 0;
      this.isEdge = true;
    }
    if (this.idxs[0] == grid - 1) {
      this.pos[1] = 0;
      this.isEdge = true;
    }
    if (this.idxs[1] == 0) {
      this.pos[0] = 0;
      this.isEdge = true;
    }
    if (this.idxs[1] == grid - 1) {
      this.pos[2] = 0;
      this.isEdge = true;
    }
    this.clicked = false;
    this.hovered = false;
    this.currentRotation = 0;
    this.rotationSpeed = 0.1;
    this.rotationDst = Math.PI / 30;
    this.image = false;
    this.placed = false;
    this.rotations = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    this.rotation = !testing
      ? this.rotations[~~random(0, this.rotations.length)]
      : 0;
    this.rotated = false;
  }
  createImage(ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(size, size);
    createPiece(0, 0, this.width, this.height, this.pos, this.s, this.b, ctx);
    ctx.clip();
    ctx.drawImage(
      puzzleImage,
      -this.width * this.idxs[0],
      -this.height * this.idxs[1],
      size*grid,
      size*grid
    );
    ctx.restore();

    let p = this;
    let image = new Image();
    image.src = canvas2.toDataURL();
    image.onload = function () {
      p.image = image;
      if (!testing) {
        p.x =
          Math.random() > 0.5
            ? constrain(
                Math.random() * offset.x,
                piecePadding,
                offset.x - p.width
              )
            : constrain(
                Math.random() * offset.x,
                piecePadding,
                offset.x - p.width
              ) +
              offset.x +
              size * grid;

        p.y = constrain(
          Math.random() * canvas.height,
          piecePadding,
          canvas.height - p.height - piecePadding
        );
      }
    };
  }
  draw(ctx) {
    this.x = constrain(
      this.x,
      piecePadding,
      canvas.width - this.width - piecePadding
    );
    this.y = constrain(
      this.y,
      piecePadding,
      canvas.height - this.height - piecePadding
    );
    if (!this.image) {
      return false;
    }
    if (this.currentRotation < this.rotation) {
      this.currentRotation += this.rotationSpeed;
      this.rotated = false;
    }
    if (Math.abs(this.currentRotation - this.rotation) < this.rotationDst) {
      this.currentRotation = this.rotation;
      if (this.rotation >= Math.PI * 2) {
        this.currentRotation = this.rotation %= Math.PI * 2;
        this.rotation = this.rotation %= Math.PI * 2;
      }
      if (this.currentRotation == this.rotation && !this.rotated) {
        this.rotated = true;
        this.place();
      }
    }

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.currentRotation);
    ctx.translate(-this.width * 1.5, -this.height * 1.5);
    ctx.drawImage(this.image, 0, 0);

    ctx.restore();

    //debugging
    // ctx.fillStyle = "#f005";
    // ctx.beginPath()
    // ctx.arc(this.start.x+this.width/2, this.start.y+this.height/2, errorDst, 0, Math.PI*2, true);
    // ctx.stroke()
    // ctx.beginPath()
    // ctx.arc(this.x+this.width/2, this.y+this.height/2, 15, 0, Math.PI*2, true);
    // ctx.fillStyle = '#00f'
    // ctx.fill()

    // ctx.fillStyle = "#ff05";
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    // ctx.fillStyle = "#000";
    // ctx.font = '30px Arial'
    // ctx.fillText(this.start.x.toFixed(1)+',  '+this.start.y.toFixed(1), this.x+50, this.y+this.height/2-20)
    // ctx.fillText(this.clicked, this.x+50, this.y+this.height/2+50)
  }

  isin(x, y) {
    this.overlap = {
      x: this.x - x,
      y: this.y - y,
    };
    return (
      x > this.x &&
      x < this.x + this.width &&
      y > this.y &&
      y < this.y + this.height
    );
  }
  drag(x, y) {
    if (this.placed) return;
    this.x = constrain(
      x + this.overlap.x,
      piecePadding,
      canvas.width - this.width - piecePadding
    );
    this.y = constrain(
      y + this.overlap.y,
      piecePadding,
      canvas.height - this.height - piecePadding
    );
  }
  place() {
    if (
      dist(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.start.x + this.width / 2,
        this.start.y + this.height / 2
      ) < errorDst &&
      this.rotation == 0
    ) {
      this.x = this.start.x;
      this.y = this.start.y;
      this.placed = true;
    }
    this.clicked = false;
  }
}

for (let i = 0; i < piecePos.length; i++) {
  for (let j = 0; j < piecePos[i].length; j++) {
    piecePos[i][j] = 0.5 + Math.random();
    pieceS[i][j] = 0.5 + Math.random();
    pieceB[i][j] = 1 + random(-0.5, 0.5);
  }
}
for (let i = 0; i < grid; i++) {
  for (let j = 0; j < grid; j++) {
    let gap = 1;
    pieces.push(
      new Piece(
        j * size * gap + offset.x,
        i * size * gap + offset.y,
        [
          piecePos[j][i],
          piecePos[j + 1][i],
          piecePos[j][i + 1],
          piecePos[j][i],
        ],
        [pieceS[j][i], pieceS[j + 1][i], pieceS[j][i + 1], pieceS[j][i]],
        [pieceB[j][i], pieceB[j + 1][i], pieceB[j][i + 1], pieceB[j][i]],
        size,
        [j, i]
      )
    );

    // createPiece(
    //   i * gap,
    //   j * gap,
    //   canvas.width / grid / 2,
    //   canvas.width / grid / 2,
    //   [
    //     piecePos[i][j],
    //     piecePos[i+1][j],
    //     piecePos[i][j+1],
    //     piecePos[i][j],
    // ],
    // [
    //     pieceS[i][j],
    //     pieceS[i+1][j],
    //     pieceS[i][j+1],
    //     pieceS[i][j],
    // ]
    // );
  }
}

var lastLoop = new Date();
function gameLoop() { 
    var thisLoop = new Date();
    var fps = 1000 / (thisLoop - lastLoop);
    lastLoop = thisLoop;
    return fps
}
function draw() {
  let frames = gameLoop()
  frameCount += 0.01;
  if(~~(frameCount*100) %10 == 0){
    iosdebugger.innerHTML = frames.toFixed(0) + 'fps'
  }
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if(minimap.checked){
    ctx.drawImage(puzzleImage, offset.x, offset.y, size*grid, size*grid)
    ctx.fillStyle = "#666a";
  } else {
    ctx.fillStyle = "#666";
  }
  ctx.fillRect(offset.x, offset.y, size * grid, size * grid);
  pieces.forEach((piece) => {
    if (piece.isEdge && edgesOnly.checked) {
      piece.draw(ctx);
    } else if(!edgesOnly.checked) {
      piece.draw(ctx);
    }
  });
    requestAnimationFrame(draw);

}

const iosdebugger = document.getElementById("debugger");
///events
let dragging = false;
function dragPiece(x, y) {
  x *= quality;
  y *= quality;

  if (typeof selectedPiece == "number") {
    pieces[selectedPiece].drag(x, y);
    dragging = true;
  }
}
function clickPiece(x, y) {
  x *= quality;
  y *= quality;
  for (let i = pieces.length - 1; i >= 0; i--) {
    if(!pieces[i].isEdge && edgesOnly.checked){continue;}
    if (pieces[i].isin(x, y)) {
      pieces.splice(pieces.length - 1, 0, pieces.splice(i, 1)[0]);
      selectedPiece = pieces.length - 1;
      pieces[selectedPiece].clicked = true;
      return false;
    }
  }
}
function releasePiece() {

  if (typeof selectedPiece == "number") {
    pieces[selectedPiece].place();
    if (!dragging && !pieces[selectedPiece].placed) {
      pieces[selectedPiece].rotation += Math.PI / 2;
    }
    selectedPiece = false;
    dragging = false;
    return;
  }
}

canvas.addEventListener("touchmove", (e) => {
  dragPiece(e.touches[0].clientX, e.touches[0].clientY);
  e.preventDefault();
  return false;
});
canvas.addEventListener("touchstart", (e) => {
  clickPiece(e.touches[0].clientX, e.touches[0].clientY);
});
canvas.addEventListener("touchend", (e) => {

  releasePiece();
  e.preventDefault();
  return false;
});
canvas.addEventListener("touchcancel", (e) => {

  releasePiece();
  e.preventDefault();
  return false;
});

canvas.addEventListener("mousemove", (e) => {
  dragPiece(e.clientX, e.clientY);
});
canvas.addEventListener("mousedown", (e) => {
  clickPiece(e.clientX, e.clientY);
});
canvas.addEventListener("mouseup", (e) => {
  releasePiece(e.clientX, e.clientY);
  e.preventDefault();
  return false;
});


// window.onresize = function () {
//   setCanvasQuality(canvas, window.innerWidth, window.innerHeight);
// };
