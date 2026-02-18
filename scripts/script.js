class ArkanoidGame {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.paddleWidth = 150;
    this.paddleHeight = 20;
    this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
    this.ballRadius = 9;
    this.resetBall();
    this.bricks = [];
    this.brickRowCount = 5;
    this.brickColumnCount = 10;
    this.brickWidth = 70;
    this.brickHeight = 40;
    this.brickPadding = 0;
    this.brickOffsetTop = 50;
    this.brickOffsetLeft = 0;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('arkanoidHighScore')) || 0;
    this.lives = 2;
    this.maxLives = 2;
    this.gameRunning = false;
    this.powerUps = [];
    this.activePowerUps = [];

    this.POWER_UP_TYPES = {
        EXPAND_PADDLE: 'expand',
        SHRINK_PADDLE: 'shrink',
        SLOW_BALL: 'slow',
        FAST_BALL: 'fast'
    };

    this.startButton = document.getElementById('start-button');
    this.backButton = document.getElementById('back-button');
    
    this.initScoreElements();
    
    this.mainMenu = document.getElementById('main-menu');
    this.gameScreen = document.getElementById('game-screen');
    this.finalScreen = document.getElementById('final-screen');

    this.init();
  }

  initScoreElements() {
    this.menuCurrentScore = document.querySelector('#main-menu .score__current p:last-child');
    this.menuHighScore = document.querySelector('#main-menu #final-score');
    
    this.gameCurrentScore = document.querySelector('#game-screen #score');
    this.gameHighScore = document.querySelector('#game-screen #final-score');
    this.gameLivesElement = document.querySelector('#game-screen .game__info__lives span');
    this.gameRoundElement = document.querySelector('#game-screen .round__info span');
    
    this.finalCurrentScore = document.querySelector('#final-screen #score');
    this.finalHighScore = document.querySelector('#final-screen #final-score');
    
    this.updateAllScores();
  }

  updateAllScores() {
    const formattedScore = this.formatScore(this.score);
    const formattedHighScore = this.formatScore(this.highScore);
    
    if (this.menuCurrentScore) this.menuCurrentScore.textContent = formattedScore;
    if (this.gameCurrentScore) this.gameCurrentScore.textContent = formattedScore;
    if (this.finalCurrentScore) this.finalCurrentScore.textContent = formattedScore;
    
    if (this.menuHighScore) this.menuHighScore.textContent = formattedHighScore;
    if (this.gameHighScore) this.gameHighScore.textContent = formattedHighScore;
    if (this.finalHighScore) this.finalHighScore.textContent = formattedHighScore;
  }

  updateLivesDisplay() {
    if (this.gameLivesElement) {
      this.gameLivesElement.textContent = this.lives;
    }
  }

  updateRoundDisplay() {
    if (this.gameRoundElement) {
      this.gameRoundElement.textContent = '1';
    }
  }

  formatScore(score) {
    return score.toString().padStart(2, '0');
  }

  init() {
    this.createBricks();
    this.updateAllScores();
    this.updateLivesDisplay();
    this.updateRoundDisplay();
    
    document.addEventListener('keydown', (e) => this.keyDownHandler(e));
    this.startButton.addEventListener('click', () => this.startGame());
    this.backButton.addEventListener('click', () => this.backToMenu());
  }

  createBricks() {
    this.bricks = [];
    for (let c = 0; c < this.brickColumnCount; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.brickRowCount; r++) {
          const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
          const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
          
          const rowColors = [
              '#d52600',
              '#0070e8',
              '#7acd0b',
              '#f99736',
              '#e97bf2'
          ];
          
          this.bricks[c][r] = { 
              x: brickX, 
              y: brickY, 
              status: 1, 
              color: rowColors[r % rowColors.length] 
          };
      }
    }
  }

  resetBall() {
    this.ballX = this.canvas.width / 2;
    this.ballY = this.canvas.height - 30;
    this.ballDX = 4 * (Math.random() > 0.5 ? 1 : -1);
    this.ballDY = -4;
  }

  resetGame() {
    this.score = 0;
    this.lives = this.maxLives;
    this.paddleWidth = 150;
    this.powerUps = [];
    this.activePowerUps = [];
    this.createBricks();
    this.resetBall();
    this.updateAllScores();
    this.updateLivesDisplay();
  }

  drawPaddle() {
    this.ctx.beginPath();
    this.ctx.rect(this.paddleX, this.canvas.height - this.paddleHeight, this.paddleWidth, this.paddleHeight);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawBall() {
    this.ctx.beginPath();
    this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawBricks() {
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        const brick = this.bricks[c][r];
        if (brick.status === 1) {
          this.ctx.beginPath();
          this.ctx.rect(brick.x, brick.y, this.brickWidth, this.brickHeight);
          this.ctx.fillStyle = brick.color;
          this.ctx.fill();
          this.ctx.strokeStyle = '#000';
          this.ctx.stroke();
          this.ctx.closePath();
        }
      }
    }
  }

  drawPowerUps() {
    this.powerUps.forEach(powerUp => {
      this.ctx.beginPath();
      this.ctx.arc(powerUp.x, powerUp.y, 10, 0, Math.PI * 2);
      this.ctx.fillStyle = this.getPowerUpColor(powerUp.type);
      this.ctx.fill();
      this.ctx.closePath();
    });
  }

  getPowerUpColor(type) {
    switch(type) {
      case this.POWER_UP_TYPES.EXPAND_PADDLE: return '#4CAF50';
      case this.POWER_UP_TYPES.SHRINK_PADDLE: return '#FF5252';
      case this.POWER_UP_TYPES.SLOW_BALL: return '#29B6F6';
      case this.POWER_UP_TYPES.FAST_BALL: return '#AB47BC';
      default: return '#FFFFFF';
    }
  }

  movePowerUps() {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.y += powerUp.speed;
      
      if (powerUp.y > this.canvas.height) {
        this.powerUps.splice(i, 1);
      } else {
        if (
          powerUp.x > this.paddleX &&
          powerUp.x < this.paddleX + this.paddleWidth &&
          powerUp.y + 10 > this.canvas.height - this.paddleHeight &&
          powerUp.y - 10 < this.canvas.height
        ) {
          this.applyPowerUp(powerUp.type);
          this.powerUps.splice(i, 1);
        }
      }
    }
  }

  applyPowerUp(type) {
    switch(type) {
      case this.POWER_UP_TYPES.EXPAND_PADDLE:
        this.paddleWidth = Math.min(this.paddleWidth + 30, this.canvas.width - 50);
        this.addActivePowerUp(type, 5000);
        break;
      case this.POWER_UP_TYPES.SHRINK_PADDLE:
        this.paddleWidth = Math.max(this.paddleWidth - 30, 50);
        this.addActivePowerUp(type, 5000);
        break;
      case this.POWER_UP_TYPES.SLOW_BALL:
        this.ballDX *= 0.7;
        this.ballDY *= 0.7;
        this.addActivePowerUp(type, 3000);
        break;
      case this.POWER_UP_TYPES.FAST_BALL:
        this.ballDX *= 1.3;
        this.ballDY *= 1.3;
        this.addActivePowerUp(type, 3000);
        break;
    }
  }

  addActivePowerUp(type, duration) {
    const powerUpObj = { type, startTime: Date.now(), duration };
    this.activePowerUps.push(powerUpObj);
    
    setTimeout(() => {
      const index = this.activePowerUps.findIndex(p => p.type === type);
      if (index !== -1) {
        this.revertPowerUp(type);
        this.activePowerUps.splice(index, 1);
      }
    }, duration);
  }

  revertPowerUp(type) {
    switch(type) {
      case this.POWER_UP_TYPES.EXPAND_PADDLE:
      case this.POWER_UP_TYPES.SHRINK_PADDLE:
        this.paddleWidth = 150;
        break;
      case this.POWER_UP_TYPES.SLOW_BALL:
        this.ballDX /= 0.7;
        this.ballDY /= 0.7;
        break;
      case this.POWER_UP_TYPES.FAST_BALL:
        this.ballDX /= 1.3;
        this.ballDY /= 1.3;
        break;
    }
  }

  collisionDetection() {
    let bricksRemaining = 0;
    
    for (let c = 0; c < this.brickColumnCount; c++) {
      for (let r = 0; r < this.brickRowCount; r++) {
        const brick = this.bricks[c][r];
        if (brick.status === 1) {
          bricksRemaining++;
          
          if (
            this.ballX > brick.x &&
            this.ballX < brick.x + this.brickWidth &&
            this.ballY > brick.y &&
            this.ballY < brick.y + this.brickHeight
          ) {
            this.ballDY = -this.ballDY;
            brick.status = 0;
            this.score += 10;
            
            if (this.score > this.highScore) {
              this.highScore = this.score;
              localStorage.setItem('arkanoidHighScore', this.highScore);
            }
            
            this.updateAllScores();
            
            if (Math.random() < 0.2) {
              this.powerUps.push({
                x: brick.x + this.brickWidth / 2,
                y: brick.y + this.brickHeight / 2,
                type: this.getRandomPowerUpType(),
                speed: 2
              });
            }
          }
        }
      }
    }
    
    if (bricksRemaining === 0) {
      setTimeout(() => {
        alert('YOU WIN!');
        this.gameRunning = false;
        this.showFinalScreen('VICTORY!');
      }, 100);
    }
  }

  getRandomPowerUpType() {
    const types = Object.values(this.POWER_UP_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }

  keyDownHandler(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
      this.paddleX += 40;
      if (this.paddleX + this.paddleWidth > this.canvas.width) {
          this.paddleX = this.canvas.width - this.paddleWidth;
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
      this.paddleX -= 40;
      if (this.paddleX < 0) {
          this.paddleX = 0;
      }
    }
  }

  startGame() {
    this.resetGame();
    this.mainMenu.style.display = 'none';
    this.gameScreen.style.display = 'flex';
    this.finalScreen.style.display = 'none';
    this.gameRunning = true;
    this.animate();
  }

  gameOver() {
    this.gameRunning = false;
    this.showFinalScreen('GAME OVER');
  }

  showFinalScreen() {
    this.finalCurrentScore.textContent = this.formatScore(this.score);
    this.finalHighScore.textContent = this.formatScore(this.highScore);
    this.finalScreen.style.display = 'flex';
    this.gameScreen.style.display = 'none';
    this.mainMenu.style.display = 'none';
  }

  backToMenu() {
    this.finalScreen.style.display = 'none';
    this.mainMenu.style.display = 'flex';
    this.gameScreen.style.display = 'none';
    this.gameRunning = false;
    this.resetGame();
  }

  animate() {
    if (!this.gameRunning) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawBricks();
    this.drawBall();
    this.drawPaddle();
    this.drawPowerUps();
    
    this.movePowerUps();
    
    if (this.ballX + this.ballDX > this.canvas.width - this.ballRadius || this.ballX + this.ballDX < this.ballRadius) {
      this.ballDX = -this.ballDX;
    }
    
    if (this.ballY + this.ballDY < this.ballRadius) {
      this.ballDY = -this.ballDY;
    } else if (this.ballY + this.ballDY > this.canvas.height - this.ballRadius) {
      if (this.ballX > this.paddleX && this.ballX < this.paddleX + this.paddleWidth) {
        const hitPosition = (this.ballX - this.paddleX) / this.paddleWidth;
        const angle = hitPosition * Math.PI - Math.PI / 2;
        const speed = Math.sqrt(this.ballDX * this.ballDX + this.ballDY * this.ballDY);
        
        this.ballDX = speed * Math.sin(angle);
        this.ballDY = -speed * Math.cos(angle);
      } else {
        this.lives--;
        this.updateLivesDisplay();
        
        if (this.lives <= 0) {
          this.gameOver();
          return;
        } else {
          this.resetBall();
        }
      }
    }
    
    this.ballX += this.ballDX;
    this.ballY += this.ballDY;
    
    this.collisionDetection();
    
    requestAnimationFrame(() => this.animate());
  }
}

window.onload = function() {
    const arkanoidGame = new ArkanoidGame();
};