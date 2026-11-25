// 주제명 : 공 받기 게임 (12주차 — 동적 객체배열)
// 주제설명 : 11주차 '고정 5개' 공을, 시간마다 생겨나고 사라지는 '동적 객체배열'로 바꾼 버전
// 학번 : 2025111753
// 이름 : 전민재
//
// [11주차 대비 달라진 점 — 교재 26장 객체배열(질문26.5)]
//  (11주차) 공 5개 고정 배열, 받으면 reset()로 제자리에서 재사용
//   → (12주차) 공이 시간마다 생겨나고(push), 받거나 놓치면 배열에서 제거(splice)
//             → 배열 크기(items.length)가 실시간으로 늘었다 줄었다 하는 '동적 객체배열'
//  + 단계가 오를수록 생성 간격↓ · 낙하 속도↑ 로 더 어려워짐

// ===== 25장: 공 클래스 =====
class Item {
  constructor() {
    this.reset(baseSpeed);
  }
  // [메소드 유형2] 매개변수(속도)O, 반환X
  reset(spd) {
    this.x = random(r, width - r);
    this.y = random(-80, -r);     // 화면 위에서 생성
    this.speed = spd + random(0, 1);
    let rnd = random(3);
    if (rnd < 1) {
      this.color = 0;
    } else if (rnd < 2) {
      this.color = 1;
    } else {
      this.color = 2;
    }
  }
  // [메소드 유형1] 아래로 이동
  move() {
    this.y = this.y + this.speed;
  }
  // [메소드 유형1] 자기 색으로 그리기
  display() {
    noStroke();
    switch (this.color) {
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
    ellipse(this.x, this.y, r * 2, r * 2);
  }
  // [메소드 유형4] 매개변수O, 반환O — 로켓이 나를 받았나
  isCaught(px, pw) {
    if (this.x > px - pw / 2 && this.x < px + pw / 2 && this.y > 300 && this.y < 345) {
      return true;
    } else {
      return false;
    }
  }
}

// ===== 25장: 폭탄 클래스 =====
class Bomb {
  constructor() {
    this.size = 28;
    this.reset();
  }
  reset() {
    this.x = random(30, width - 30);
    this.y = random(-200, -40);
    this.speedY = 0;
    this.gravity = 0.15;
  }
  move() {
    this.speedY = this.speedY + this.gravity;
    this.y = this.y + this.speedY;
  }
  display() {
    fill(color(40, 40, 40));
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
    stroke(255, 150, 0);
    strokeWeight(3);
    line(this.x, this.y - this.size / 2, this.x + 6, this.y - this.size / 2 - 8);
    noStroke();
  }
  hits(px, py) {
    let d = dist(this.x, this.y, px, py);
    if (d < this.size / 2 + 20) {
      return true;
    } else {
      return false;
    }
  }
}

let items = [];          // 26장: 동적 객체배열 (시작 비어있음)
let r = 18;
let spawnTimer = 0;      // 생성 타이머
let spawnInterval = 45;  // 몇 프레임마다 공 1개 생성
let bomb;

let playerX = 200;
let playerW = 50;

let score = 0;
let lives = 3;

let stage = 1;
let caught = 0;
let stageGoal = 5;
let maxStage = 5;
let baseSpeed = 2;
let clearTimer = 0;

let state = "start";
let rocketImg;
let catchSound;
let bombSound;

async function setup() {
  createCanvas(400, 400);
  rocketImg = await loadImage('rocket2.png');
  catchSound = await loadSound('catch.mp3');
  bombSound = await loadSound('burst.mp3');
  bomb = new Bomb();
}

function draw() {
  background(220, 235, 255);

  if (state === "start") {
    fill(color(40, 50, 80));
    textSize(26);
    text("공 받기 게임", 120, 160);
    textSize(14);
    text("공이 계속 생겨납니다. 받으세요!", 85, 200);
    text("한 단계에 공 5개 · 폭탄은 피하기", 85, 225);
    text("아무 키나 누르면 시작", 130, 255);
    return;
  }

  if (state === "stageClear") {
    fill(color(40, 50, 80));
    textSize(28);
    text("단계 " + stage + " 클리어!", 95, 180);
    textSize(16);
    text("다음 단계는 더 빨라집니다...", 90, 220);
    clearTimer = clearTimer - 1;
    if (clearTimer <= 0) {
      stage = stage + 1;
      baseSpeed = baseSpeed + 1.5;
      if (baseSpeed > 8) {
        baseSpeed = 8;
      }
      spawnInterval = spawnInterval - 7;      // 생성 간격 줄이기(더 자주)
      if (spawnInterval < 15) {
        spawnInterval = 15;
      }
      caught = 0;
      items = [];                              // 화면 비우기(배열 초기화)
      spawnTimer = 0;
      bomb.reset();
      state = "play";
    }
    return;
  }

  if (state === "clear") {
    fill(color(40, 50, 80));
    textSize(30);
    text("게임 클리어!", 100, 190);
    textSize(16);
    text("R 키로 다시 시작", 120, 230);
    return;
  }

  if (state === "over") {
    fill(color(200, 60, 60));
    textSize(30);
    text("게임 오버", 130, 190);
    fill(color(40, 50, 80));
    textSize(16);
    text("R 키로 다시 시작", 120, 230);
    return;
  }

  // ---------- state === "play" ----------
  drawHUD();
  image(rocketImg, playerX - playerW / 2, 300, playerW, 88);

  // 26장: 일정 시간마다 공 객체를 새로 생성해 배열에 push
  spawnTimer = spawnTimer - 1;
  if (spawnTimer <= 0) {
    items.push(new Item());
    spawnTimer = spawnInterval;
  }

  // 26장: 객체배열을 역순으로 돌며 처리 (splice로 제거하므로 역순)
  for (let i = items.length - 1; i >= 0; i = i - 1) {
    items[i].move();
    if (items[i].isCaught(playerX, playerW) === true) {
      score = score + 1;
      caught = caught + 1;
      catchSound.play();
      items.splice(i, 1);           // 받으면 배열에서 제거
    } else if (items[i].y > height) {
      items.splice(i, 1);           // 놓치면(바닥) 제거
    } else {
      items[i].display();
    }
  }

  // 폭탄
  bomb.move();
  bomb.display();
  if (bomb.hits(playerX, 320) === true) {
    bombSound.play();
    lives = lives - 1;
    bomb.reset();
    if (lives <= 0) {
      state = "over";
    }
  }

  // 난이도: 이번 단계 목표 채우면 단계 클리어
  if (caught >= stageGoal) {
    if (stage >= maxStage) {
      state = "clear";
    } else {
      state = "stageClear";
      clearTimer = 80;
    }
  }
}

function drawHUD() {
  fill(color(40, 50, 80));
  noStroke();
  rect(0, 0, width, 40);
  fill(255);
  textSize(14);
  text("점수 " + score + "  단계 " + stage + " (" + caught + "/" + stageGoal + ")  생명 " + lives + "  화면공 " + items.length, 8, 25);
}

function keyPressed() {
  if (state === "start") {
    userStartAudio();
    state = "play";
    return;
  }
  if (state === "over" || state === "clear") {
    if (key === 'r' || key === 'R') {
      resetGame();
    }
    return;
  }
  if (key === LEFT_ARROW) {
    playerX = playerX - 20;
  }
  if (key === RIGHT_ARROW) {
    playerX = playerX + 20;
  }
  playerX = constrain(playerX, playerW / 2, width - playerW / 2);
}

function mouseMoved() {
  if (state === "play") {
    playerX = constrain(mouseX, playerW / 2, width - playerW / 2);
  }
}

function resetGame() {
  score = 0;
  lives = 3;
  stage = 1;
  caught = 0;
  baseSpeed = 2;
  spawnInterval = 45;
  spawnTimer = 0;
  items = [];
  playerX = 200;
  bomb.reset();
  state = "play";
}