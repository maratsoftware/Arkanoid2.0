"use strict"

function startGame() {
  document.querySelector('.menu').style.display = 'none';
  document.querySelector('.final').style.display = 'flex';
  
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0070e8';
  ctx.fillRect(50, 50, 100, 100);
}

function backToMenu() {
  document.querySelector('.menu').style.display = 'flex';
  document.querySelector('.final').style.display = 'none';
}

window.onload = function() {
  document.querySelector('.menu').style.display = 'flex';
  document.querySelector('.game').style.display = 'none';
}
