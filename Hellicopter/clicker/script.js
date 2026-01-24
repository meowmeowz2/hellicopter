const clickButton = document.getElementById('clickButton');
const scoreDisplay = document.getElementById('score');
const autoClickerButton = document.getElementById('autoClickerUpgrade');
const autoClickerCostDisplay = document.getElementById('autoClickerCost');
const multiplierButton = document.getElementById('multiplierUpgrade');
const multiplierCostDisplay = document.getElementById('multiplierCost');
const clickPowerButton = document.getElementById('clickPowerUpgrade');
const clickPowerCostDisplay = document.getElementById('clickPowerCost');
const autoSpeedButton = document.getElementById('autoSpeedUpgrade');
const autoSpeedCostDisplay = document.getElementById('autoSpeedCost');
const multiplierPowerButton = document.getElementById('multiplierPowerUpgrade');
const multiplierPowerCostDisplay = document.getElementById('multiplierPowerCost');

let score = 0;
let scoreMultiplier = 1;
let clicksPerClick = 1; // Base clicks per manual click
let autoClickerCount = 0;
let autoClickerInterval = null;
let autoClickerSpeed = 1000; // Initial interval in milliseconds
let autoClickerCost = 10;
let multiplierCost = 50;
let clickPowerCost = 100;
let autoSpeedCost = 200;
let multiplierPowerCost = 500;
let multiplierIncrease = 1.5;

function formatScore(score) {
    if (score >= 1e60) {
        return (score / 1e60).toFixed(2) + 'Nxd'; // Novemdecillion
    } else if (score >= 1e57) {
        return (score / 1e57).toFixed(2) + 'Od'; // Octodecillion
    } else if (score >= 1e54) {
        return (score / 1e54).toFixed(2) + 'Spd'; // Septendecillion
    } else if (score >= 1e51) {
        return (score / 1e51).toFixed(2) + 'Sd'; // Sexdecillion
    } else if (score >= 1e48) {
        return (score / 1e48).toFixed(2) + 'Qn'; // Quindecillion
    } else if (score >= 1e45) {
        return (score / 1e45).toFixed(2) + 'Qd'; // Quattuordecillion
    } else if (score >= 1e42) {
        return (score / 1e42).toFixed(2) + 'Td'; // Tredecillion
    } else if (score >= 1e39) {
        return (score / 1e39).toFixed(2) + 'Dd'; // Duodecillion
    } else if (score >= 1e36) {
        return (score / 1e36).toFixed(2) + 'Ud'; // Undecillion
    } else if (score >= 1e33) {
        return (score / 1e33).toFixed(2) + 'Dc'; // Decillion
    } else if (score >= 1e30) {
        return (score / 1e30).toFixed(2) + 'No'; // Nonillion
    } else if (score >= 1e27) {
        return (score / 1e27).toFixed(2) + 'Oc'; // Octillion
    } else if (score >= 1e24) {
        return (score / 1e24).toFixed(2) + 'Sp'; // Septillion
    } else if (score >= 1e21) {
        return (score / 1e21).toFixed(2) + 'Sx'; // Sextillion
    } else if (score >= 1e18) {
        return (score / 1e18).toFixed(2) + 'Qt'; // Quintillion
    } else if (score >= 1e15) {
        return (score / 1e15).toFixed(2) + 'Qa'; // Quadrillion
    } else if (score >= 1e12) {
        return (score / 1e12).toFixed(2) + 'T';  // Trillion
    } else if (score >= 1e9) {
        return (score / 1e9).toFixed(2) + 'B';   // Billion
    } else if (score >= 1e6) {
        return (score / 1e6).toFixed(2) + 'M';   // Million
    } else if (score >= 1e3) {
        return (score / 1e3).toFixed(2) + 'K';   // Thousand
    } else {
        return Math.floor(score);
    }
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${formatScore(score)}`;
}

function createFloatingText(message, element) {
    const floatingText = document.createElement('div');
    floatingText.classList.add('floating-text');
    floatingText.textContent = message;
    const rect = element.getBoundingClientRect();
    floatingText.style.left = rect.left + rect.width / 2 + window.scrollX + 'px';
    floatingText.style.top = rect.top + window.scrollY + 'px';
    document.body.appendChild(floatingText);

    setTimeout(() => {
        floatingText.remove();
    }, 1500);
}

clickButton.addEventListener('click', () => {
    score += clicksPerClick * scoreMultiplier;
    updateScore();
    clickButton.classList.add('clicked');
    setTimeout(() => {
        clickButton.classList.remove('clicked');
    }, 100);
    createFloatingText(`+${formatScore(clicksPerClick * scoreMultiplier)}`, clickButton);
});

autoClickerButton.addEventListener('click', () => {
    if (score >= autoClickerCost) {
        score -= autoClickerCost;
        autoClickerCount++;
        autoClickerCost = Math.floor(autoClickerCost * 1.5);
        autoClickerCostDisplay.textContent = autoClickerCost;
        updateScore();
        createFloatingText('Auto-Clicker Purchased!', autoClickerButton);

        clearInterval(autoClickerInterval); // Clear previous interval
        if (autoClickerCount > 0) {
            autoClickerInterval = setInterval(() => {
                score += autoClickerCount * scoreMultiplier;
                updateScore();
                createFloatingText(`+${formatScore(autoClickerCount * scoreMultiplier)}`, clickButton);
            }, autoClickerSpeed);
        }
    } else {
        createFloatingText('Not enough score!', autoClickerButton);
    }
});

multiplierButton.addEventListener('click', () => {
    if (score >= multiplierCost) {
        score -= multiplierCost;
        scoreMultiplier *= 2;
        multiplierCost = Math.floor(multiplierCost * 2);
        multiplierCostDisplay.textContent = multiplierCost;
        updateScore();
        createFloatingText('Score Multiplier Purchased!', multiplierButton);
    } else {
        createFloatingText('Not enough score!', multiplierButton);
    }
});

clickPowerButton.addEventListener('click', () => {
    if (score >= clickPowerCost) {
        score -= clickPowerCost;
        clicksPerClick++;
        clickPowerCost = Math.floor(clickPowerCost * 2);
        clickPowerCostDisplay.textContent = clickPowerCost;
        updateScore();
        createFloatingText('Click Power Increased!', clickPowerButton);
    } else {
        createFloatingText('Not enough score!', clickPowerButton);
    }
});

autoSpeedButton.addEventListener('click', () => {
    if (score >= autoSpeedCost && autoClickerSpeed > 100) { // Prevent speed from going too low
        score -= autoSpeedCost;
        autoClickerSpeed -= 100;
        autoSpeedCost = Math.floor(autoSpeedCost * 2.5);
        autoSpeedCostDisplay.textContent = autoSpeedCost;
        updateScore();
        createFloatingText('Auto-Clicker Speed Increased!', autoSpeedButton);

        clearInterval(autoClickerInterval); // Reset interval with new speed
        if (autoClickerCount > 0) {
            autoClickerInterval = setInterval(() => {
                score += autoClickerCount * clicksPerClick * scoreMultiplier;
                updateScore();
                createFloatingText(`+${formatScore(autoClickerCount * clicksPerClick * scoreMultiplier)}`, clickButton);
            }, autoClickerSpeed);
        }
    } else if (autoClickerSpeed <= 100) {
        createFloatingText('Auto-Clicker at maximum speed!', autoSpeedButton);
    } else {
        createFloatingText('Not enough score!', autoSpeedButton);
    }
});

multiplierPowerButton.addEventListener('click', () => {
    if (score >= multiplierPowerCost) {
        score -= multiplierPowerCost;
        scoreMultiplier *= multiplierIncrease;
        multiplierPowerCost = Math.floor(multiplierPowerCost * 3);
        multiplierPowerCostDisplay.textContent = multiplierPowerCost;
        updateScore();
        createFloatingText(`Multiplier increased by ${multiplierIncrease}x!`, multiplierPowerButton);
    } else {
        createFloatingText('Not enough score!', multiplierPowerButton);
    }
});