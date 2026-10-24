// 주제명 : 공 받기 게임
// 주제설명 : 로켓을 마우스로 움직여 떨어지는 공을 받고, 점수가 쌓이면 단계가 올라 점점 빨라지는 게임
// 학번 : 2025111753
// 이름 : 전민재
// [8주차] 이미지 파일 적용(로켓)·난이도 단계·UI로 게임 완성 (중간과제)

let itemX = [100, 180, 260, 320, 60];
let itemY = [-20, -120, -200, -300, -80];
let itemSpeed = [2, 2, 2, 2, 2];
let itemColor = [0, 1, 2, 0, 1];
let itemCount = 5;
let r = 18;
let playerW = 50;

let score = 0;
let stage = 1;
let previousStage = 1;
let baseSpeed = 2;
let cleared = false;

let rocketImg;

async function setup() {
  createCanvas(400, 400);
  rocketImg = await loadImage('rocket2.png');
}

function draw() {
  background(220, 235, 255);

  if (cleared === true) {
    fill(color(40, 50, 80));
    textSize(30);
    text("게임 클리어!", 100, height / 2);
    textSize(16);
    text("R 키로 다시 시작", 120, height / 2 + 35);
    return;
  }

  drawUI();

  let playerX = mouseX;
  image(rocketImg, playerX - playerW / 2, 300, playerW, 88);

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

  if (score >= stage * 5) {
    stage = stage + 1;
  }
  if (stage === 1) {
    baseSpeed = 2;
  } else if (stage > 1 && stage !== previousStage) {
    baseSpeed = baseSpeed + 1;
    if (baseSpeed > 8) {
      baseSpeed = 8;
    }
  }
  previousStage = stage;

  if (stage >= 5) {
    cleared = true;
  }
}

function drawUI() {
  fill(color(40, 50, 80));
  noStroke();
  rect(0, 0, width, 40);
  stroke(255);
  strokeWeight(2);
  line(0, 40, width, 40);
  noStroke();
  fill(255);
  textSize(16);
  text("점수 " + score + "   단계 " + stage, 10, 26);
  noFill();
  stroke(255, 200, 0);
  strokeWeight(4);
  let progress = (score - (stage - 1) * 5) / 5;
  arc(width - 25, 20, 26, 26, radians(0), radians(360 * progress));
  drawStar(width - 60, 20, 9);
}

function drawStar(cx, cy, s) {
  fill(color(255, 220, 0));
  noStroke();
  beginShape();
  vertex(cx, cy - s);
  vertex(cx + s * 0.3, cy - s * 0.3);
  vertex(cx + s, cy - s * 0.3);
  vertex(cx + s * 0.4, cy + s * 0.2);
  vertex(cx + s * 0.6, cy + s);
  vertex(cx, cy + s * 0.5);
  vertex(cx - s * 0.6, cy + s);
  vertex(cx - s * 0.4, cy + s * 0.2);
  vertex(cx - s, cy - s * 0.3);
  vertex(cx - s * 0.3, cy - s * 0.3);
  endShape(CLOSE);
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
  if (x > playerX - playerW / 2 && x < playerX + playerW / 2 && y > 300 && y < 345) {
    return true;
  } else {
    return false;
  }
}

function makeItem(i) {
  itemX[i] = random(r, width - r);
  itemY[i] = random(-200, -r);
  itemSpeed[i] = baseSpeed + random(0, 1);
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
    stage = 1;
    previousStage = 1;
    cleared = false;
    for (let i = 0; i < itemCount; i = i + 1) {
      makeItem(i);
    }
  }
}
