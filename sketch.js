// 주제명 : 공 받기 게임
// 학번 : 2025111753
// 이름 : 전민재
// [5주차] 다양한 충돌 조건 - 떨어지는 공과 받침의 충돌 판정

let ballX = 200;
let ballY = 0;
let ballSpeed = 3;
let r = 18;

let catchX = 175;
let catchY = 320;
let catchW = 50;
let catchH = 18;

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

  fill(color(200, 60, 60));
  rect(catchX, catchY, catchW, catchH);

  ballY = ballY + ballSpeed;

  if (ballX > catchX && ballX < catchX + catchW && ballY > catchY && ballY < catchY + catchH) {
    score = score + 1;
    ballY = 0;
    ballX = random(r, width - r);
  }
  if (ballY > height) {
    ballY = 0;
    ballX = random(r, width - r);
  }

  noStroke();
  fill(color(255, 80, 80));
  ellipse(ballX, ballY, r * 2, r * 2);
}