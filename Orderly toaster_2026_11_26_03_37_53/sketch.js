// 주제명 : 공 쏘기 게임 (13주차 — 슈팅 + 경계 반사)
// 주제설명 : 12주차 '받기' 게임을, 벽에 반사되는 공을 총알로 쏴서 터뜨리는 슈팅 게임으로 변형
// 학번 : 2025111753
// 이름 : 전민재
//
// [12주차 대비 달라진 점 — 교재 29~36장]
//  (12주차) 떨어지는 공을 로켓으로 '받기'
//   → (13주차) 공이 좌우로 '벽에 반사'되며 떨어지고(29장), 로켓이 '총알'을 쏴서 맞히면
//              '폭발'하며 사라지는 슈팅 게임(35·36장)
//  + 총알 객체배열 추가 (스페이스로 발사 → push, 화면 밖이면 offCanvas로 제거)
//  + 폭발 효과를 translate + rotate 로 회전시켜 그림 (34·35장, p5 push/pop)
//  + 공·총알·폭발 세 종류의 객체배열 운용 (push / splice)

// ===== 공(목표물) — 벽에 반사 =====
class Ball {
  constructor() {
    this.r = 16;
    this.reset();
  }
  reset() {
    this.x = random(this.r, width - this.r);
    this.y = random(-120, -20);
    this.speedX = random(-2, 2);           // 좌우 속도(반사용)
    this.speedY = baseSpeed + random(0, 1);
    let rnd = random(3);
    if (rnd < 1) {
      this.color = 0;
    } else if (rnd < 2) {
      this.color = 1;
    } else {
      this.color = 2;
    }
  }
  // [29장] 이동 + 좌우 벽에서 반사
  move() {
    this.x = this.x + this.speedX;
    this.y = this.y + this.speedY;
    if (this.x < this.r || this.x > width - this.r) {
      this.speedX = this.speedX * -1;       // 방향 반대로 = 반사
    }
  }
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
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }
  // 바닥까지 내려갔나(놓침)
  offCanvas() {
    if (this.y > height) {
      return true;
    } else {
      return false;
    }
  }
  // 총알(bx,by)과 부딪혔나 — 거리로 판정
  hit(bx, by) {
    let d = dist(this.x, this.y, bx, by);
    if (d < this.r + 6) {
      return true;
    } else {
      return false;
    }
  }
}

// ===== 총알 =====
class Bullet {
  constructor(x) {
    this.x = x;
    this.y = 300;
    this.speed = 7;
  }
  move() {
    this.y = this.y - this.speed;          // 위로
  }
  display() {
    noStroke();
    fill(color(40, 50, 80));
    ellipse(this.x, this.y, 10, 10);
  }
  // 화면 위로 벗어났나
  offCanvas() {
    if (this.y < 0) {
      return true;
    } else {
      return false;
    }
  }
}

// ===== 폭발 효과 — translate + rotate =====
class Boom {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.timer = 18;
    this.angle = 0;
  }
  move() {
    this.timer = this.timer - 1;
    this.angle = this.angle + 0.3;
  }
  // [34·35장] translate로 원점을 옮기고 rotate로 회전시켜 그림
  display() {
    push();                                // 좌표계 저장
    translate(this.x, this.y);             // 원점을 폭발 위치로
    rotate(this.angle);                    // 회전
    stroke(255, 150, 0);
    strokeWeight(3);
    let s = (18 - this.timer) * 2;         // 점점 커지는 선
    for (let k = 0; k < 6; k = k + 1) {
      line(0, 0, s, 0);
      rotate(PI / 3);                      // 60도씩 돌려 6방향
    }
    pop();                                 // 좌표계 복원
    noStroke();
  }
  done() {
    if (this.timer <= 0) {
      return true;
    } else {
      return false;
    }
  }
}

let balls = [];
let bullets = [];
let booms = [];
let spawnTimer = 0;
let spawnInterval = 50;

let playerX = 200;
let playerW = 50;

let score = 0;
let lives = 3;
let stage = 1;
let destroyed = 0;
let stageGoal = 5;
let maxStage = 5;
let baseSpeed = 2;
let clearTimer = 0;

let state = "start";
let rocketImg;
let shootSound;
let boomSound;

async function setup() {
  createCanvas(400, 400);
  rocketImg = await loadImage('rocket2.png');
  shootSound = await loadSound('catch.mp3');
  boomSound = await loadSound('burst.mp3');
}

function draw() {
  background(220, 235, 255);

  if (state === "start") {
    fill(color(40, 50, 80));
    textSize(24);
    text("공 쏘기 게임", 125, 160);
    textSize(14);
    text("마우스/화살표로 이동, 스페이스로 발사", 60, 200);
    text("공을 쏴서 터뜨리세요! 놓치면 생명 -1", 65, 225);
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
      spawnInterval = spawnInterval - 7;
      if (spawnInterval < 18) {
        spawnInterval = 18;
      }
      destroyed = 0;
      balls = [];
      bullets = [];
      booms = [];
      spawnTimer = 0;
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

  // 공 생성(push)
  spawnTimer = spawnTimer - 1;
  if (spawnTimer <= 0) {
    balls.push(new Ball());
    spawnTimer = spawnInterval;
  }

  // 총알: 이동·그리기·화면밖 제거
  for (let i = bullets.length - 1; i >= 0; i = i - 1) {
    bullets[i].move();
    if (bullets[i].offCanvas() === true) {
      bullets.splice(i, 1);
    } else {
      bullets[i].display();
    }
  }

  // 공: 이동(반사)·그리기·바닥 도달 시 생명 감소
  for (let i = balls.length - 1; i >= 0; i = i - 1) {
    balls[i].move();
    if (balls[i].offCanvas() === true) {
      balls.splice(i, 1);
      lives = lives - 1;
      if (lives <= 0) {
        state = "over";
      }
    } else {
      balls[i].display();
    }
  }

  // 충돌: 총알 vs 공 → 폭발 + 둘 다 제거 + 점수
  for (let i = bullets.length - 1; i >= 0; i = i - 1) {
    for (let j = balls.length - 1; j >= 0; j = j - 1) {
      if (balls[j].hit(bullets[i].x, bullets[i].y) === true) {
        booms.push(new Boom(balls[j].x, balls[j].y));
        boomSound.play();
        balls.splice(j, 1);
        bullets.splice(i, 1);
        score = score + 1;
        destroyed = destroyed + 1;
        break;                              // 이 총알은 사라졌으니 안쪽 반복 종료
      }
    }
  }

  // 폭발 효과: 진행·그리기·끝나면 제거
  for (let i = booms.length - 1; i >= 0; i = i - 1) {
    booms[i].move();
    if (booms[i].done() === true) {
      booms.splice(i, 1);
    } else {
      booms[i].display();
    }
  }

  // 난이도: 목표만큼 터뜨리면 단계 클리어
  if (destroyed >= stageGoal) {
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
  text("점수 " + score + "  단계 " + stage + " (" + destroyed + "/" + stageGoal + ")  생명 " + lives, 8, 25);
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
  // 스페이스 = 발사
  if (key === ' ') {
    bullets.push(new Bullet(playerX));
    shootSound.play();
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
  destroyed = 0;
  baseSpeed = 2;
  spawnInterval = 50;
  spawnTimer = 0;
  balls = [];
  bullets = [];
  booms = [];
  playerX = 200;
  state = "play";
}