var img;
var sized;
var boxSize = 9;
var xOffset;
var yOffset;
var w;
var h;
var posi;
var posi1=0;
var ptMap1;
var oldPoint;
var pointList = [];
var curPoly = [];
var polyList = [];
var myTiling;
var myImage;
var baseX = 10;
var baseY = 10;
var Ax = 500;
var Ay = 0;
var Bx = 0;
var By = 500;
var mode = 0;

function createButtons() {
  butDraw= createImg('draw.png');
  butDraw.mousePressed(goDraw);
  butDraw.position(10, 10);
  butDraw.attribute("title", "Draw points");

  butErase= createImg('erase.png');
  butErase.mousePressed(goErase);
  butErase.position(50, 10);
  butErase.attribute("title", "Erase points");

  butMove= createImg('move.png');
  butMove.mousePressed(goMove);
  butMove.position(90, 10);
  butMove.attribute("title", "Move points");

  butUp= createImg('up.png');
  butUp.mousePressed(goUp);
  butUp.position(50, 90);
  butUp.attribute("title", "Up");

  butLeft= createImg('left.png');
  butLeft.mousePressed(goLeft);
  butLeft.position(10, 130);
  butLeft.attribute("title", "Left");

  butRight= createImg('right.png');
  butRight.mousePressed(goRight);
  butRight.position(90, 130);
  butRight.attribute("title", "Right");

  butDown= createImg('down.png');
  butDown.mousePressed(goDown);
  butDown.position(50, 170);
  butDown.attribute("title", "Down");

  butGrow= createImg('grow.png');
  butGrow.mousePressed(goGrow);
  butGrow.position(10,210);
  butGrow.attribute("title", "Grow");

  butShrink= createImg('shrink.png');
  butShrink.mousePressed(goShrink);
  butShrink.position(50, 210);
  butShrink.attribute("title", "Shrink");

  butSave= createImg('save.png');
  butSave.mousePressed(goSave);
  butSave.position(10, 250);
  butSave.attribute("title", "Save");

  butSvg= createImg('svg.png');
  butSvg.mousePressed(goSvg);
  butSvg.position(10, 290);
  butSvg.attribute("title", "Save svg");

}

function goLeft() {
//  if (xOffset < w-10) {xOffset += 10;}
xOffset += 10;
  draw();
}

function goRight() {
//  if (xOffset >= 10) {xOffset -= 10;}
xOffset -= 10;
  draw();
}

function goUp() {
//  if (yOffset < h-10) {yOffset += 10;}
yOffset += 10;
  draw();
}

function goDown() {
//  if (yOffset>=10) {yOffset -= 10;}
yOffset -= 10;
  draw();
}

function goGrow() {
  sized *= 2;
  draw();
}

function goShrink() {
  sized /= 2;
  draw();
}

function goLoad() {
}

function goDraw() {
  mode = 0;
  draw();
}

function goErase() {
  mode = 1;
  curPoly = [];
  draw();
}

function goMove() {
  mode = 2;
  draw();
}

function goSave() {
  var asOutput = [];
  asOutput.push('vectors:');
  asOutput.push(""+Ax+","+Ay);
  asOutput.push(""+Bx+","+By);
  asOutput.push('points:');
  pointList.forEach(function(point) {
    asOutput.push(""+point[0]+","+point[1]);
  });
  polyList.forEach(function(poly) {
    asOutput.push('poly:');
    poly.forEach(function(ptMap) {
      asOutput.push(""+ptMap[0]+","+ptMap[1][0]+","+ptMap[1][1]);
    });
  });
  asOutput.push('end');
  saveStrings(asOutput,"myTiles","txt");
}

function goSvg() {
  var asOutput = [];
  asOutput.push('<svg height="500" width="600">');
  polyList.forEach(function(poly) {
    asOutput.push('<polygon points="'); 
    poly.forEach(function(ptMap) {
      var sPoint = "" + (pointList[ptMap[0]][0]+ptMap[1][0]*Ax+ptMap[1][1]*Bx) 
                 + "," + (pointList[ptMap[0]][1]+ptMap[1][0]*Ay+ptMap[1][1]*By);
      asOutput.push(sPoint);
    });
    asOutput.push('" style="fill:white;stroke:black;stroke-width:1" />'); 
  });

  asOutput.push('</svg>');
  saveStrings(asOutput,"myTiles","svg");
}

// find point close to current point, or -1 if none.
function findPoint(point) {
  for (pt = 0;pt<pointList.length;pt++) {
    for (i = -1;i<2;i++) {
      for (j = -1; j<2;j++) {
        if (abs(point[0]-(pointList[pt][0]+i*Ax+j*Bx))<=boxSize/sized 
         && abs(point[1]-(pointList[pt][1]+i*Ay+j*By))<=boxSize/sized)
          {return [pt,[i,j]];}
      }
    }
  }
  return([-1]);
}

function mouseMoved() {
  posi = [(mouseX-150)/sized+xOffset,mouseY/sized+yOffset];
  draw();
}

function mouseClicked() {
  if (mouseX >150) {
    posi = [(mouseX-150)/sized+xOffset,mouseY/sized+yOffset];
    var ptMap= findPoint(posi);

    if (mode ===0) {drawPoint(ptMap);}
    if (mode ===1) {erasePoint(ptMap);}

    draw();
  }
}

function mousePressed() {
  if (posi1 === 0 && mode===2 && mouseX >150) {
    posi1 = [(mouseX-150)/sized+xOffset,mouseY/sized+yOffset];
    ptMap1= findPoint(posi1);
    if (ptMap1[0]<0) { 
      mode = onVector();
      if (mode===2) {posi1=0;}
    }
    else { oldPoint = pointList[ptMap1[0]]; }
  }
}

function mouseDragged() {
//move points
  if (posi1 != 0 && mode===2 && mouseX >150) {
    posi = [(mouseX-150)/sized+xOffset,mouseY/sized+yOffset];
    pointList[ptMap1[0]]=[oldPoint[0]-posi1[0]+posi[0],
                          oldPoint[1]-posi1[1]+posi[1]];
    draw();
  }
//move vectors
  if (posi1 != 0 && mode>2 && mouseX >150) {
    posi = [(mouseX-150)/sized+xOffset,mouseY/sized+yOffset];
    if (mode ===3) {
      baseX = oldPoint[0]-posi1[0]+posi[0];
      baseY = oldPoint[1]-posi1[1]+posi[1];
    }
    if (mode ===4) {
      Ax = oldPoint[0]-posi1[0]+posi[0]-baseX;
      Ay = oldPoint[1]-posi1[1]+posi[1]-baseY;

    }
    if (mode ===5) {
      Bx = oldPoint[0]-posi1[0]+posi[0]-baseX;
      By = oldPoint[1]-posi1[1]+posi[1]-baseY;

    }
    draw();
  }
}

function mouseReleased() {
  if (posi1 != 0 && mode===2 && mouseX >150) {
    posi1 = 0;
  }
  if (posi1 != 0 && mode>2 && mouseX >150) {
    mode=2;
    posi1 = 0;
  }
  draw();
}

function onVector() {
  var onVec = 2;
  if (abs(posi1[0]-baseX)<10/sized 
         && abs(posi1[1]-baseY)<=boxSize/sized )
          {onVec = 3; oldPoint = posi1;};
  if (abs(posi1[0]-baseX-Ax)<10/sized 
         && abs(posi1[1]-baseY-Ay)<=boxSize/sized )
          {onVec = 4;oldPoint = posi1;};
  if (abs(posi1[0]-baseX-Bx)<10/sized 
         && abs(posi1[1]-baseY-By)<=boxSize/sized )
          {onVec = 5;oldPoint = posi1;};
  return(onVec);
}

function erasePoint(ptMap) {
  if (ptMap[0]>=0) {
// remove point
    var pointless = ptMap[0];
    var newPointList = [];
    for (i=0;i<pointless;i++) {
      newPointList[i]=pointList[i];
     }
    for (i=pointless+1;i<pointList.length;i++) {
      newPointList[i-1]=pointList[i];
    }
   pointList = newPointList;

// remove polys that had that point
    var newPolyList = [];
    polyList.forEach(function(poly) {
      var keepPoly = 1;
      poly.forEach(function(ptMap) {
        if (ptMap[0] === pointless) {keepPoly = 0;}
        if (ptMap[0] > pointless) {ptMap[0]--;}
      });
      if (keepPoly === 1) {newPolyList.push(poly)}
    });
    polyList = newPolyList;
  }
}

function drawPoint(ptMap) {
//add new point
  if (ptMap[0]<0) { 
    ptMap= [pointList.length,[0,0]]; 
    pointList.push(posi);
  }
//if we return to polygon starting point
  if (JSON.stringify(ptMap) === JSON.stringify(curPoly[0])) {
    polyList.push(curPoly);
    curPoly = [];
    }
//add point to current polygon
  else {
    curPoly.push(ptMap); 
    }
}

function loadTiling(file) {
  var lines = file.data.split(/\r\n|\n/);
  pointList = [];
  polyList = [];
//  var numPts = lines[1];
  var curLen = lines.length;
  var setPoly = 0;

  for (i = 1;i<curLen;i++) {
    if (lines[i] === "points:") { setPoly = 1; continue;}
    if (lines[i] === "poly:") { setPoly = 2; curPoly = []; continue;}
    if (lines[i] === "end") { break;}
    var coords = lines[i].split(",");
    if (i===1) {Ax = coords[0],Ay=coords[1]}
    if (i===2) {Bx = coords[0],By=coords[1]}
    if (setPoly === 1) {pointList.push([float(coords[0]),float(coords[1])]);}   
    if (setPoly === 2) {
      curPoly.push( [int(coords[0]),[int(coords[1]),int(coords[2])]] );
      if (lines[i+1] === "poly:") {polyList.push(curPoly);curPoly = [];};
      if (lines[i+1] === "end") {polyList.push(curPoly);curPoly = [];};
    }
  }
} // end loadTiling()

function loadMyImage(file) {
//  print(file);
  if (file.type === 'image') {
    img = createImg(file.data, '');
    img.hide();
  } else {
    img = null;
  }
  xOffset=0;
  yOffset=0;
  sized = 1;
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  myImage = createFileInput(loadMyImage);
  myImage.position(0, 400);

  myTiling = createFileInput(loadTiling);
  myTiling.position(0, 450);

  createButtons();

  xOffset = 0;
  yOffset = 0;
  sized = 1;
}

function draw() {

  background(255);
  stroke(0);
  strokeWeight(1);

// draw image
  if (img) {
    w=img.width;
    h=img.height;
    var minX = -xOffset*sized+150;
    var minY = -yOffset*sized;
    image(img,minX,minY,w*sized,h*sized);
  }

// draw points
  strokeWeight(2);
  stroke("red");
  pointList.forEach(function(point) {
    var oldX = (point[0]-xOffset)*sized+150-boxSize;
    var oldY = (point[1]-yOffset)*sized-boxSize;
    for (i = -1;i<2;i++) {
      for (j = -1; j<2;j++) {
        rect(oldX+i*Ax+j*Bx,oldY+i*Ay+j*By,boxSize*2+1,boxSize*2+1);
      }
    }
  });

// draw vectors
  stroke("blue");
  rect(baseX+150-boxSize,baseY-boxSize,boxSize*2+1,boxSize*2+1);
  rect(baseX+Ax+150-boxSize,baseY+Ay-boxSize,boxSize*2+1,boxSize*2+1);
  rect(baseX+Bx+150-boxSize,baseY+By-boxSize,boxSize*2+1,boxSize*2+1);

  line(baseX+150,baseY,baseX+Ax+150,baseY+Ay);
  line(baseX+150,baseY,baseX+Bx+150,baseY+By);


// draw polygons
  strokeWeight(1);
  stroke("red");
  fill(128,0,128,128);
  polyList.forEach(function(poly) {
    beginShape();
    poly.forEach(function(ptMap) {
        vertex((pointList[ptMap[0]][0]+ptMap[1][0]*Ax+ptMap[1][1]*Bx-xOffset)*sized+150,
		(pointList[ptMap[0]][1]+ptMap[1][0]*Ay+ptMap[1][1]*By-yOffset)*sized);	
      });
    endShape(CLOSE); 
  });

//control panel
  stroke(0);
  strokeWeight(1);
  fill(255);
  rect(0,0,150,windowHeight);
  line(150,0,150,windowHeight);

// radio buttons for draw, erase or move
  circle(30,55,9);
  circle(70,55,9);
  circle(110,55,9);
  fill(0);
  switch (mode) {
    case 0:
      circle(30,55,4);
      break;
    case 1:
      circle(70,55,4);
      break;
    default:
      circle(110,55,4);
  };

  noFill();
  text(JSON.stringify(posi),10,350);
  text("load image",10,385);
  text("load tiling",10,435);

// draw lines of current polygon
// I don't know why this section really wants to be last...
  stroke("red");
  strokeWeight(3);
  noFill();
  for (pt = 1;pt<=curPoly.length;pt++)  {
    line((pointList[curPoly[pt-1][0]][0]+curPoly[pt-1][1][0]*Ax+
		curPoly[pt-1][1][1]*Bx-xOffset)*sized+150,
         (pointList[curPoly[pt-1][0]][1]+curPoly[pt-1][1][0]*Ay+
		curPoly[pt-1][1][1]*By-yOffset)*sized,
	 (pointList[curPoly[pt][0]][0]+curPoly[pt][1][0]*Ax+
		curPoly[pt][1][1]*Bx-xOffset)*sized+150,
         (pointList[curPoly[pt][0]][1]+curPoly[pt][1][0]*Ay+
		curPoly[pt][1][1]*By-yOffset)*sized);
  };

//noLoop();
}