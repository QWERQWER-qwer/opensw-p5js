// 주제명 : 공 받기 게임 (10주차 진화판)
// 주제설명 : 중간과제 '공 받기 게임'을 객체 배열로 바꾸고, 폭탄·생명·단계 클리어 방식을 추가한 버전
// 학번 : 2025111753
// 이름 : 전민재
//
// [중간과제 대비 달라진 점 — 교재 15~24장]
//  (중간) 공을 itemX[], itemY[], itemSpeed[], itemColor[] 배열 4개로 관리
//   → (10주차) items = [{x, y, speed, color}] 객체 배열 하나로 관리        (20~21장)
//  + push / splice 로 공 동적 생성·제거                                     (22장)
//  + makeOne() 으로 공 객체를 만들어 반환 — 사용자정의함수 유형3            (04/20장)
//  + 폭탄(bomb): 중력으로 가속 낙하 + dist 충돌로 생명 감소                 (15~16·17~19장)
//  + 난이도 단계: "한 단계를 깨면(배경 클리어) → 다음 단계가 더 빨라짐"     (21~23장)
//  + 로켓을 마우스 '또는' 화살표키로 조작                                   (23장)
//  + 사운드: 공 받을 때 catch, 폭탄 맞을 때 burst                           (08장)
 
let items = [];          // [20~21장] 받을 공들 — 객체 배열
let itemCount = 5;
let r = 18;
 
let bomb = { x: 200, y: -40, speedY: 0, gravity: 0.15, size: 28 };
 
let playerX = 200;
let playerW = 50;
 
let score = 0;
let lives = 3;
 
let stage = 1;           // 현재 단계
let caught = 0;          // 이번 단계에서 받은 공 수
let stageGoal = 3;       // 이만큼 받으면 이 단계 클리어
let maxStage = 5;        // 이 단계까지 깨면 게임 클리어
let baseSpeed = 2;       // 이번 단계의 공 낙하 속도
let clearTimer = 0;      // 단계 클리어 화면 표시 시간
 
let state = "start";     // start / play / stageClear / clear / over
let rocketImg;
let catchSound;   // 공 받는 소리
let bombSound;    // 폭탄 소리
 
async function setup() {
  createCanvas(400, 400);
  rocketImg = await loadImage('rocket2.png');
  catchSound = await loadSound('catch.mp3');
  bombSound = await loadSound('burst.mp3');
  makeItems();
}
 
// [유형1] 현재 baseSpeed로 공 5개를 새로 만들어 배열에 채움
function makeItems() {
  items = [];
  for (let i = 0; i < itemCount; i = i + 1) {
    items.push(makeOne());
  }
}
 
// [유형3] 매개변수 없이 공 객체 하나를 만들어 반환 (속도는 현재 단계 baseSpeed)
function makeOne() {
  let c = 0;
  let rnd = random(3);
  if (rnd < 1) {
    c = 0;
  } else if (rnd < 2) {
    c = 1;
  } else {
    c = 2;
  }
  return { x: random(r, width - r), y: random(-300, -r), speed: baseSpeed + random(0, 1), color: c };
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
 
  // 단계 클리어 화면: 배경만 남기고(= 공 없이) 잠깐 보여준 뒤 다음 단계로
  if (state === "stageClear") {
    fill(color(40, 50, 80));
    textSize(28);
    text("단계 " + stage + " 클리어!", 95, 180);
    textSize(16);
    text("다음 단계는 더 빨라집니다...", 90, 220);
    clearTimer = clearTimer - 1;
    if (clearTimer <= 0) {
      stage = stage + 1;              // 다음 단계
      baseSpeed = baseSpeed + 1.5;    // 난이도 상승(공이 더 빨라짐)
      if (baseSpeed > 8) {
        baseSpeed = 8;
      }
      caught = 0;
      makeItems();                    // 배경(공)을 새 속도로 다시 생성
      resetBomb();
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
 
  // [20~22장] 객체 배열을 돌며 이동·받기·재생성 (splice 때문에 역순)
  for (let i = items.length - 1; i >= 0; i = i - 1) {
    items[i].y = items[i].y + items[i].speed;
    if (isCaught(items[i].x, items[i].y) === true) {
      score = score + 1;
      caught = caught + 1;
      catchSound.play();
      items.splice(i, 1);
      items.push(makeOne());
    } else if (items[i].y > height) {
      items.splice(i, 1);
      items.push(makeOne());
    } else {
      drawItem(items[i]);
    }
  }
 
  updateBomb();
  drawBomb();
 
  // 난이도 단계: 이번 단계 목표(3개)를 채우면 → 단계 클리어
  if (caught >= stageGoal) {
    if (stage >= maxStage) {
      state = "clear";              // 마지막 단계까지 깨면 게임 클리어
    } else {
      state = "stageClear";         // 단계 클리어 화면으로
      clearTimer = 80;
    }
  }
}
 
// [15~16장] 폭탄: 중력으로 가속하며 낙하
function updateBomb() {
  bomb.speedY = bomb.speedY + bomb.gravity;
  bomb.y = bomb.y + bomb.speedY;
 
  // [17~19장] 로켓 중심과 폭탄 중심의 거리(dist)로 충돌
  let d = dist(bomb.x, bomb.y, playerX, 320);
  if (d < bomb.size / 2 + 20) {
    bombSound.play();
    lives = lives - 1;
    resetBomb();
    if (lives <= 0) {
      state = "over";
    }
  }
  if (bomb.y > height) {
    resetBomb();
  }
}
 
function resetBomb() {
  bomb.x = random(30, width - 30);
  bomb.y = random(-200, -40);
  bomb.speedY = 0;
}
 
function drawBomb() {
  fill(color(40, 40, 40));
  noStroke();
  ellipse(bomb.x, bomb.y, bomb.size, bomb.size);
  stroke(255, 150, 0);
  strokeWeight(3);
  line(bomb.x, bomb.y - bomb.size / 2, bomb.x + 6, bomb.y - bomb.size / 2 - 8);
  noStroke();
}
 
// [유형2] 공 하나(객체)를 색에 맞게 그림
function drawItem(it) {
  noStroke();
  switch (it.color) {
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
  ellipse(it.x, it.y, r * 2, r * 2);
}
 
// [유형4] 로켓이 (x,y)를 받는 범위에 있나 — 참/거짓
function isCaught(x, y) {
  if (x > playerX - playerW / 2 && x < playerX + playerW / 2 && y > 300 && y < 345) {
    return true;
  } else {
    return false;
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
 
// [23장] 이벤트: 화살표키 이동 / 상태 전환
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
 
// [23장] 이벤트: 마우스를 움직이면 로켓이 따라옴
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
  resetBomb();
  state = "play";
}