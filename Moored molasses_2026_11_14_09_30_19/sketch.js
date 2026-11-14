// 주제명 : 공 받기 게임 (11주차 — 클래스 버전)
// 주제설명 : 10주차 '객체 리터럴' 공/폭탄을 클래스로 바꾸고 메소드로 동작을 정리한 버전
// 학번 : 2025111753
// 이름 : 전민재
//
// [10주차 대비 달라진 점 — 교재 25·26장]
//  (10주차) 공 = 객체 리터럴 {x,y,speed,color}, 폭탄 = 객체 리터럴
//   → (11주차) 공 = class Item, 폭탄 = class Bomb  — 속성+동작을 '틀(클래스)'로 묶음 (25장)
//  + 동작을 메소드로: move()/display()[유형1], reset(spd)[유형2], isCaught()/hits()[유형4]
//  + 공들을 new Item()으로 만들어 객체 배열에 담아 관리                         (26장 객체배열)
//  + 받거나 놓친 공은 splice/push 대신 reset() 메소드로 '재사용'               (25장)

// ===== 25장: 공 클래스 =====
class Item {
  constructor() {
    this.reset(baseSpeed);          // 생성자에서 초기화(아래 reset 메소드 호출)
  }
  // [메소드 유형2] 매개변수(속도)O, 반환X — 위치·속도·색을 새로 정함
  reset(spd) {
    this.x = random(r, width - r);
    this.y = random(-300, -r);
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
  // [메소드 유형1] 매개변수X, 반환X — 아래로 이동
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
  // [메소드 유형4] 매개변수O, 반환O — 로켓이 나를 받았나(참/거짓)
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
  // [메소드 유형1] 위치/속도 초기화
  reset() {
    this.x = random(30, width - 30);
    this.y = random(-200, -40);
    this.speedY = 0;
    this.gravity = 0.15;
  }
  // [메소드 유형1] 중력으로 가속 낙하
  move() {
    this.speedY = this.speedY + this.gravity;
    this.y = this.y + this.speedY;
  }
  // [메소드 유형1] 폭탄 그리기
  display() {
    fill(color(40, 40, 40));
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
    stroke(255, 150, 0);
    strokeWeight(3);
    line(this.x, this.y - this.size / 2, this.x + 6, this.y - this.size / 2 - 8);
    noStroke();
  }
  // [메소드 유형4] 매개변수O, 반환O — 로켓과 거리(dist)로 충돌했나
  hits(px, py) {
    let d = dist(this.x, this.y, px, py);
    if (d < this.size / 2 + 20) {
      return true;
    } else {
      return false;
    }
  }
}

let items = [];          // 26장: Item 객체들의 배열
let itemCount = 5;
let r = 18;
let bomb;                // Bomb 객체 1개

let playerX = 200;
let playerW = 50;

let score = 0;
let lives = 3;

let stage = 1;
let caught = 0;
let stageGoal = 3;
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
  makeItems();
  bomb = new Bomb();
}

// 26장: new Item()으로 공 객체를 만들어 배열에 push
function makeItems() {
  items = [];
  for (let i = 0; i < itemCount; i = i + 1) {
    items.push(new Item());
  }
}

function draw() {
  background(220, 235, 255);

  if (state === "start") {
    fill(color(40, 50, 80));
    textSize(26);
    text("공 받기 게임", 120, 160);
    textSize(14);
    text("마우스 또는 화살표로 공을 받으세요", 75, 200);
    text("한 단계에 공 3개! 폭탄은 피하기", 90, 225);
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
      caught = 0;
      makeItems();
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

  // 26장: 객체 배열을 돌며 각 공의 메소드 호출
  for (let i = 0; i < items.length; i = i + 1) {
    items[i].move();
    if (items[i].isCaught(playerX, playerW) === true) {
      score = score + 1;
      caught = caught + 1;
      catchSound.play();
      items[i].reset(baseSpeed);      // 지웠다 다시 만드는 대신 메소드로 재사용
    } else if (items[i].y > height) {
      items[i].reset(baseSpeed);
    } else {
      items[i].display();
    }
  }

  // 폭탄: 메소드로 이동·그리기·충돌
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

  // 난이도: 목표 채우면 단계 클리어
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
  textSize(15);
  text("점수 " + score + "   단계 " + stage + " (" + caught + "/" + stageGoal + ")   생명 " + lives, 10, 25);
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
  playerX = 200;
  makeItems();
  bomb.reset();
  state = "play";
}