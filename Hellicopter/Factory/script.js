const gameState = {
    money: 10000,
    machines: {
        "Assembly Machine": 0,
        "Compactor": 0,
        "Wire Maker": 0,
        "Circuit Fabricator": 0,
        "Robotics Assembler": 0,
        "Advanced Robotics Factory": 0,
        "Quantum Computer Plant": 0,
        "Processor Foundry": 0,
        "Advanced Circuit Lab": 0,
    },
    items: {
        "Metal Part": 0,
        "Compacted Part": 0,
        "Wire": 0,
        "Basic Circuit": 0,
        "Simple Robot": 0,
        "Advanced Robot": 0,
        "Quantum Processor": 0,
        "High-Grade Processor": 0,
        "Advanced Circuit": 0,
    },
    machineCosts: {
        "Assembly Machine": 1000,
        "Compactor": 1500,
        "Wire Maker": 2000,
        "Circuit Fabricator": 2500,
        "Robotics Assembler": 3000,
        "Advanced Robotics Factory": 5000,
        "Quantum Computer Plant": 15000,
        "Processor Foundry": 10000,
        "Advanced Circuit Lab": 7000,
    },
    productionRates: { // Items produced per production cycle
        "Assembly Machine": {"Metal Part": 1, "time": 5}, // 'time' in ticks
        "Compactor": {"Compacted Part": 1, "Metal Part": -1, "time": 7},
        "Wire Maker": {"Wire": 1, "Metal Part": -1, "time": 6},
        "Circuit Fabricator": {"Basic Circuit": 1, "Compacted Part": -2, "Wire": -3, "time": 10},
        "Robotics Assembler": {"Simple Robot": 1, "Compacted Part": -1, "Basic Circuit": -5, "time": 15},
        "Advanced Robotics Factory": {"Advanced Robot": 1, "Simple Robot": -3, "Advanced Circuit": -2, "time": 20},
        "Quantum Computer Plant": {"Quantum Processor": 1, "Advanced Robot": -5, "High-Grade Processor": -10, "time": 30},
        "Processor Foundry": {"High-Grade Processor": 1, "Metal Part": -4, "Basic Circuit": -2, "time": 18},
        "Advanced Circuit Lab": {"Advanced Circuit": 1, "Wire": -2, "Basic Circuit": -3, "time": 12},
    },
    sellingPrices: {
        "Metal Part": 5,
        "Compacted Part": 7,
        "Wire": 10,
        "Basic Circuit": 30,
        "Simple Robot": 100,
        "Advanced Robot": 450,
        "Quantum Processor": 1000,
        "High-Grade Processor": 800,
    },
    machineProgress: { // Track the progress of each machine
        "Assembly Machine": 0,
        "Compactor": 0,
        "Wire Maker": 0,
        "Circuit Fabricator": 0,
        "Robotics Assembler": 0,
        "Advanced Robotics Factory": 0,
        "Quantum Computer Plant": 0,
        "Processor Foundry": 0,
        "Advanced Circuit Lab": 0,
    },
};

const moneyDisplay = document.getElementById("money");
const machinesDisplay = document.getElementById("machines");
const itemsDisplay = document.getElementById("items");
const buyButtons = document.querySelectorAll("#buy-machines button");
const produceButton = document.getElementById("produce-button");
const sellButtons = document.querySelectorAll("#sell-items button");
const messageArea = document.getElementById("message-area");
const progressBars = {}; // Object to store references to progress bar elements

// Get all progress bar elements
for (const machineName in gameState.machines) {
    progressBars[machineName] = machinesDisplay.querySelector(`[data-machine-progress="${machineName}"]`);
}

function updateDisplay() {
    moneyDisplay.textContent = gameState.money;
    for (const machine in gameState.machines) {
        const span = machinesDisplay.querySelector(`[data-machine="${machine}"]`);
        if (span) {
            span.textContent = gameState.machines[machine];
        }
    }
    for (const item in gameState.items) {
        const span = itemsDisplay.querySelector(`[data-item="${item}"]`);
        if (span) {
            span.textContent = gameState.items[item];
        }
    }
    updateProgressBars();
}

function updateProgressBars() {
    for (const machineName in gameState.machineProgress) {
        if (progressBars[machineName]) {
            const progress = gameState.machineProgress[machineName];
            const maxTime = gameState.productionRates[machineName]?.time || 1; // Avoid division by zero
            const percentage = (progress / maxTime) * 100;
            progressBars[machineName].style.width = `${percentage}%`;
        }
    }
}

buyButtons.forEach(button => {
    button.addEventListener("click", function() {
        const machine = this.dataset.machine;
        const cost = parseInt(this.dataset.cost);
        if (gameState.money >= cost) {
            gameState.money -= cost;
            gameState.machines[machine]++;
            updateDisplay();
            setMessage(`Bought 1 ${machine}`);
        } else {
            setMessage("Not enough money!");
        }
    });
});

produceButton.addEventListener("click", function() {
    let productionOccurred = false;
    for (const machine in gameState.machines) {
        const count = gameState.machines[machine];
        if (count > 0 && gameState.productionRates[machine]) {
            const recipe = gameState.productionRates[machine];
            const productionTime = recipe.time;
            let canStartProduction = true;
            const neededItems = {};
            for (const item in recipe) {
                if (recipe[item] < 0) { // It's an input
                    neededItems[item] = Math.abs(recipe[item]) * count;
                    if (gameState.items[item] < neededItems[item]) {
                        canStartProduction = false;
                        break;
                    }
                }
            }

            if (canStartProduction) {
                gameState.machineProgress[machine] += 1; // Increment progress

                if (gameState.machineProgress[machine] >= productionTime) {
                    productionOccurred = true;
                    gameState.machineProgress[machine] = 0; // Reset progress

                    // Deduct inputs and add outputs
                    for (const item in recipe) {
                        gameState.items[item] += recipe[item] * count;
                    }
                }
            } else {
                gameState.machineProgress[machine] = 0; // Reset progress if no resources
            }
        } else {
            gameState.machineProgress[machine] = 0; // Reset progress if no machines of this type
        }
    }
    updateDisplay();
    if (        productionOccurred) {
        setMessage("Machines produced items.");
    } else {
        setMessage("No items produced (either no machines or not enough resources).");
    }
});

sellButtons.forEach(button => {
    button.addEventListener("click", function() {
        const item = this.dataset.item;
        const price = parseInt(this.dataset.price);
        if (gameState.items[item] > 0) {
            gameState.items[item]--;
            gameState.money += price;
            updateDisplay();
            setMessage(`Sold 1 ${item} for $${price}`);
        } else {
            setMessage(`No ${item} to sell!`);
        }
    });
});

function setMessage(message) {
    messageArea.textContent = message;
}

// Call this function periodically to simulate time passing and production
function gameTick() {
    let productionOccurred = false;
    for (const machine in gameState.machines) {
        const count = gameState.machines[machine];
        if (count > 0 && gameState.productionRates[machine]) {
            const recipe = gameState.productionRates[machine];
            const productionTime = recipe.time;
            let canStartProduction = true;
            const neededItems = {};
            for (const item in recipe) {
                if (recipe[item] < 0) { // It's an input
                    neededItems[item] = Math.abs(recipe[item]) * count;
                    if (gameState.items[item] < neededItems[item]) {
                        canStartProduction = false;
                        break;
                    }
                }
            }

            if (canStartProduction) {
                gameState.machineProgress[machine] += 1; // Increment progress

                if (gameState.machineProgress[machine] >= productionTime) {
                    productionOccurred = true;
                    gameState.machineProgress[machine] = 0; // Reset progress

                    // Deduct inputs and add outputs
                    for (const item in recipe) {
                        gameState.items[item] += recipe[item] * count;
                    }
                }
            } else {
                gameState.machineProgress[machine] = 0; // Reset progress if no resources
            }
        } else {
            gameState.machineProgress[machine] = 0; // Reset progress if no machines of this type
        }
    }
    updateDisplay();
}

// Run the game tick every second (adjust as needed)
setInterval(gameTick, 1000);

updateDisplay(); // Initial display update