const canvasSize = 400;
const snakeSize = 20;

// Initial snake position and length
let snake = [{ x: 10 * snakeSize, y: 10 * snakeSize }];
let food = { x: 5 * snakeSize, y: 5 * snakeSize };
let score = 0;
let dx = snakeSize; // horizontal velocity
let dy = 0;       // vertical velocity
let changingDirection = false; // Flag to prevent rapid direction changes
let gameOver = false; // Start as false to allow the game to begin immediately

let gameSpeed = 7; // Adjust for slower speed (updates per second)
let lastRenderTime = 0;

let canvas;
let ctx;
let scoreDisplay;
let gameOverMessage;
let restartButton;

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    scoreDisplay = document.getElementById('score');
    gameOverMessage = document.getElementById('gameOverScreen');

    restartButton = document.getElementById('restartButton');
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    generateFood(); // Generate the first food item
    requestAnimationFrame(gameLoop); // Start the game loop

    // Add event listener for keyboard input
    document.addEventListener('keydown', changeDirection);

    // Add event listener for the restart button
    restartButton.addEventListener('click', () => { location.reload(); });
});

function restartGame() {
    snake = [{ x: 10 * snakeSize, y: 10 * snakeSize }];
    score = 0;
    scoreDisplay.textContent = score;
    dx = snakeSize;
    dy = 0;
};

function drawSnakePart(snakePart) {
    // Draw the snake segment as a simple 2D rectangle
    ctx.fillStyle = 'lightgreen';
    ctx.strokestyle = 'darkgreen';
    ctx.fillRect(snakePart.x, snakePart.y, snakeSize, snakeSize);
    ctx.strokeRect(snakePart.x, snakePart.y, snakeSize, snakeSize);
}

function moveSnake() {
    // Create the new snake's head
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    // Add the new head to the beginning of snake body
    snake.unshift(head); // Always add the new head

    // Check if the snake ate the food
    const didEatFood = snake[0].x === food.x && snake[0].y === food.y;
    if (didEatFood) {
        score += 10;
        scoreDisplay.textContent = score;
        generateFood(); // Generate new food
    } else {
        // Remove the last part of snake body only if no food was eaten
        snake.pop();
    }

    changingDirection = false; // Allow direction changes after movement

}

function checkCollision() {
    // Check collision with boundaries
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > canvasSize - snakeSize;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > canvasSize - snakeSize;

    // Check collision with own body
    const hitSelf = snake.slice(1).some(part => part.x === snake[0].x && part.y === snake[0].y);

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall || hitSelf) {
        gameOver = true;
    }
}


function drawSnake() {
    snake.forEach(drawSnakePart);
}

function generateFood() {
    // Generate a random food location
    food.x = Math.floor(Math.random() * (canvasSize / snakeSize)) * snakeSize;
    food.y = Math.floor(Math.random() * (canvasSize / snakeSize)) * snakeSize;

    // Check if the new food location overlaps with the snake
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) {
            generateFood(); // Regenerate if it overlaps
        }
    });
}

function drawFood() {
    // Draw the food as a simple 2D rectangle
    ctx.fillStyle = 'red';
    ctx.strokestyle = 'darkred';
    ctx.fillRect(food.x, food.y, snakeSize, snakeSize);
    ctx.strokeRect(food.x, food.y, snakeSize, snakeSize);
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.strokestyle = 'black';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.strokeRect(0, 0, canvasSize, canvasSize);
}

// Function to show the game over screen
function showGameOverScreen() {
    gameOverMessage.style.display = 'block';
}

// The main game loop
function gameLoop(currentTime) {
    if (gameOver) {
 return showGameOverScreen(); // Stop the loop and show the game over screen
    }

    requestAnimationFrame(gameLoop);

    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / gameSpeed) return; // Control speed based on frames per second

    lastRenderTime = currentTime;

    clearCanvas();

    drawFood();
 moveSnake(); // Move the snake before checking collision for the next frame
    checkCollision();
 drawSnake();
}

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    // Prevent the snake from reversing on itself
    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.keyCode;
    const goingUp = dy === -snakeSize;
    const goingDown = dy === snakeSize;
    const goingRight = dx === snakeSize;
    const goingLeft = dx === -snakeSize;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -snakeSize;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -snakeSize;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = snakeSize;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = snakeSize;
    }
}
