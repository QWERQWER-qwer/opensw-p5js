// 주제명 : 공 받기 게임
// 학번 : 2025111753
// 이름 : 전민재
// [7주차] 키보드/마우스 제어 - 마우스로 받침 이동, color(), mousePressed/keyPressed

let itemX = [100, 180, 260, 320, 60];
let itemY = [-20, -120, -200, -300, -80];
let itemSpeed = [3, 4, 2, 5, 3];
let itemColor = [0, 1, 2, 0, 1];
let itemCount = 5;
let r = 18;
let playerW = 50;
let score = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220, 235, 255);

  fill(color(40, 50, 80));
  noStroke();
  textSize(16);
  text("점수 " + score, 10, 24);

  let playerX = mouseX;
  fill(color(200, 60, 60));
  rect(playerX - playerW / 2, 310, playerW, 18);

  for (let i = 0; i < itemCount; i = i + 1) {
    itemY[i] = itemY[i] + itemSpeed[i];
    if (isCaught(itemX[i], itemY[i], playerX) === true) {
      score = score + 1;
      makeItem(i);
    }
    if (itemY[i] > height) {
      makeItem(i);
    }
    drawItem(itemX[i], itemY[i], itemColor[i]);
  }
}

function drawItem(x, y, c) {
  noStroke();
  switch (c) {
    case 0:
      fill(color(255, 80, 80));
      break;
    case 1:
      fill(color(80, 200, 120));
      break;
    case 2:
      fill(color(90, 140, 255));
      break;
  }
  ellipse(x, y, r * 2, r * 2);
}

function isCaught(x, y, playerX) {
  if (x > playerX - playerW / 2 && x < playerX + playerW / 2 && y > 310 && y < 345) {
    return true;
  } else {
    return false;
  }
}

function makeItem(i) {
  itemX[i] = random(r, width - r);
  itemY[i] = random(-200, -r);
  let rnd = random(3);
  if (rnd < 1) {
    itemColor[i] = 0;
  } else if (rnd < 2) {
    itemColor[i] = 1;
  } else {
    itemColor[i] = 2;
  }
}

function mousePressed() {
  for (let i = 0; i < itemCount; i = i + 1) {
    makeItem(i);
  }
}

function keyPressed() {
  if (key === 'r') {
    score = 0;
    for (let i = 0; i < itemCount; i = i + 1) {
      makeItem(i);
    }
  }
}
