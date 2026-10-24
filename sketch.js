// 주제명 : 공 받기 게임
// 학번 : 2025111753
// 이름 : 전민재
// [6주차] 다양한 움직임 - 공마다 다른 속도, 점수가 오르면 전체 가속

let itemX = [100, 180, 260, 320, 60];
let itemY = [-20, -120, -200, -300, -80];
let itemSpeed = [3, 4, 2, 5, 3];
let itemCount = 5;
let r = 18;

let catchX = 175;
let catchY = 320;
let catchW = 50;
let catchH = 18;

let score = 0;
let accel = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220, 235, 255);

  fill(color(40, 50, 80));
  noStroke();
  textSize(16);
  text("점수 " + score, 10, 24);

  fill(color(200, 60, 60));
  rect(catchX, catchY, catchW, catchH);

  for (let i = 0; i < itemCount; i = i + 1) {
    itemY[i] = itemY[i] + itemSpeed[i] + accel;
    if (itemX[i] > catchX && itemX[i] < catchX + catchW && itemY[i] > catchY && itemY[i] < catchY + catchH) {
      score = score + 1;
      makeItem(i);
    }
    if (itemY[i] > height) {
      makeItem(i);
    }
    noStroke();
    fill(color(255, 80, 80));
    ellipse(itemX[i], itemY[i], r * 2, r * 2);
  }

  accel = score * 0.1;
}

function makeItem(i) {
  itemX[i] = random(r, width - r);
  itemY[i] = random(-200, -r);
}
