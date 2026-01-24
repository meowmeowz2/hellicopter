document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const themeSelect = document.getElementById('theme-select');
    const body = document.body;
    const settingsPanel = document.getElementById('settingsPanel');
    const fontSizeInput = document.getElementById('font-size');
    const favoritesGrid = document.getElementById('favorites-grid');
    const noFavoritesMessage = document.getElementById('no-favorites-message');
    const gamesGrid = document.getElementById('games-grid'); // Get the games grid
    //  const htmlFileInput = document.getElementById('html-file'); // Get the file input
    let customGames = JSON.parse(localStorage.getItem('customGames') || '[]');
    const contextMenu = document.getElementById('contextMenu');
    let selectedGameItem = null;
    const recentlyPlayedGrid = document.getElementById('recently-played-grid');
    const gameItems = document.querySelectorAll('.game-item');


    let toolsClickCount = 0;
    let helicopterVisible = false;


    // Function to set the theme
    function setTheme(theme) {
        if (theme === 'light') {
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light'); // Store the theme
        } else {
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark'); // Store the theme
        }
    }

     // Save theme to localStorage when changed
    themeSelect.addEventListener('change', function() {
        setTheme(this.value);
        localStorage.setItem('theme', this.value);
    });

    // Load theme from localStorage on page load
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        setTheme(storedTheme);
        themeSelect.value = storedTheme;
    }

     // Save font size to localStorage when changed
    fontSizeInput.addEventListener('change', function() {
        applySettings();
    });

    // Load stored settings
    const storedFontSize = localStorage.getItem('fontSize');
    if (storedFontSize) {
        body.style.fontSize = storedFontSize;
        fontSizeInput.value = storedFontSize.replace('px', '');
    }

    // Function to toggle the settings panel
    window.toggleSettings = function() {
        settingsPanel.classList.toggle('collapsed');
    };

    // Function to apply settings
    window.applySettings = function() {
        const fontSize = fontSizeInput.value + 'px';

        body.style.fontSize = fontSize;
        localStorage.setItem('fontSize', fontSize);

        toggleSettings(); // Close the settings panel after applying
    };

      // Favorites functionality
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    function updateFavoritesTab() {
        favoritesGrid.innerHTML = ''; // Clear the grid

        if (favorites.length === 0) {
            noFavoritesMessage.style.display = 'block'; // Show "No favorites" message
        } else {
            noFavoritesMessage.style.display = 'none'; // Hide the message
            favorites.forEach(game => {
                const gameItem = document.querySelector(`.game-item[data-game="${game}"]`).cloneNode(true);
                favoritesGrid.appendChild(gameItem);
                // Remove the onclick event to prevent adding the item to the grid again
                gameItem.querySelector('.favorite-button').onclick = null;
                 // Prevent context menu on cloned items
                gameItem.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                });
            });
        }
    }

    // Initialize favorites on load
    gameItems.forEach(item => {
        const gameName = item.dataset.game;
        const favButton = item.querySelector('.favorite-button');
            if (favorites.includes(gameName)) {
                favButton.classList.add('active');
                favButton.textContent = '★';
            }
    });

     // Toggle favorite status
    window.toggleFavorite = function(gameName) {
        const gameItem = document.querySelector(`.game-item[data-game="${gameName}"]`);
        const favButton = gameItem.querySelector('.favorite-button');

        if (favorites.includes(gameName)) {
            favorites = favorites.filter(item => item !== gameName);
            favButton.classList.remove('active');
            favButton.textContent = '☆';
        } else {
            favorites.push(gameName);
            favButton.classList.add('active');
            favButton.textContent = '★';
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesTab();
    };

    updateFavoritesTab(); // Initial update of the favorites tab

    // Function to remove a custom game
    window.removeCustomGame = function(gameName, gameItem) {
        // Remove from customGames array
        customGames = customGames.filter(game => game.name !== gameName);
        localStorage.setItem('customGames', JSON.stringify(customGames));

        // Remove the game item from the grid
        gameItem.remove();
    };


   // Function to add a custom game
   window.addCustomGame = function() {
        const gameName = prompt("Enter the name for your custom game:");
        if (gameName) {
            const filePath = prompt("Enter the file path for your custom game (e.g., games/mygame.html).  Make sure the file is in the same directory or a sub directory to where the hellicopter homepage page is located");
            if (filePath) {
                // Save the game info to local storage
                customGames.push({
                    name: gameName,
                    url: filePath
                });
                localStorage.setItem('customGames', JSON.stringify(customGames));

                // Create a new game item
                const newGameItem = document.createElement('div');
                newGameItem.classList.add('game-item');
                newGameItem.dataset.game = gameName;

                // Create the link
                const gameLink = document.createElement('a');
                gameLink.href = filePath;
                gameLink.target = "_blank";
                gameLink.textContent = gameName;

                // Create the favorite button
                const favButton = document.createElement('button');
                favButton.classList.add('favorite-button');
                favButton.textContent = '☆';
                favButton.onclick = function() {
                    toggleFavorite(gameName);
                };

                // Create the remove button
                const removeButton = document.createElement('button');
                removeButton.classList.add('remove-button');
                removeButton.textContent = '❌';
                removeButton.onclick = function() {
                    removeCustomGame(gameName, newGameItem);
                };
                 // Prevent default context menu
                newGameItem.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    showContextMenu(e, newGameItem);
                });

                newGameItem.appendChild(gameLink);
                newGameItem.appendChild(favButton);
                newGameItem.appendChild(removeButton);

                gamesGrid.appendChild(newGameItem);

                // Reinitialize Favorites
                const gameItems = document.querySelectorAll('.game-item');
                gameItems.forEach(item => {
                    const gameName = item.dataset.game;
                    const favButton = item.querySelector('.favorite-button');
                    if (favorites.includes(gameName)) {
                        favButton.classList.add('active');
                        favButton.textContent = '★';
                    }
                });
            } else {
                alert('Please enter a valid file path.');
            }
        } else {
            alert('Please enter a name for your custom game.');
        }
    };



    // Function to load custom games from local storage on page load
    function loadCustomGames() {
        customGames.forEach(game => {
            // Create a new game item
            const newGameItem = document.createElement('div');
            newGameItem.classList.add('game-item');
            newGameItem.dataset.game = game.name;

            // Create the link
            const gameLink = document.createElement('a');
            gameLink.href = game.url;
            gameLink.target = "_blank"; //game.url;
            gameLink.textContent = game.name;

            // Create the favorite button
            const favButton = document.createElement('button');
            favButton.classList.add('favorite-button');
            favButton.textContent = '☆';
            favButton.onclick = function() { toggleFavorite(game.name); };

            // Create the remove button
            const removeButton = document.createElement('button');
            removeButton.classList.add('remove-button');
            removeButton.textContent = '❌';
            removeButton.onclick = function() { removeCustomGame(game.name, newGameItem); };

             // Prevent default context menu
            newGameItem.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                showContextMenu(e, newGameItem);
            });

            newGameItem.appendChild(gameLink);
            newGameItem.appendChild(favButton);
            newGameItem.appendChild(removeButton);

            gamesGrid.appendChild(newGameItem);
        });
    }

    // Context Menu Functions
    function showContextMenu(e, gameItem) {
        e.preventDefault();
        selectedGameItem = gameItem;

        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
    }

    window.launchGame = function() {
        if (selectedGameItem) {
            const gameLink = selectedGameItem.querySelector('a');
            window.open(gameLink.href, '_blank');
            contextMenu.style.display = 'none';
        }
    };

    window.showDescription = function() {
        if (selectedGameItem) {
            const gameNameElement = selectedGameItem.querySelector('a');
            const gameName = gameNameElement ? gameNameElement.textContent : 'Unknown Game';
            // Get the description from the data-desc attribute
            const description = selectedGameItem.dataset.desc || 'No description available.';

            document.getElementById('popupGameName').textContent = gameName;
            document.getElementById('popupDescription').textContent = description;
            document.getElementById('descriptionPopup').style.display = 'flex'; // Show the popup


            contextMenu.style.display = 'none';
        }
    };


    // Hide context menu on click outside
    document.addEventListener('click', function(e) {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });

     // Prevent default context menu and show custom menu on game items
    gameItems.forEach(item => {
        item.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showContextMenu(e, item);
        });
    });

     // Function to hide the description popup
    window.hideDescriptionPopup = function() {
        document.getElementById('descriptionPopup').style.display = 'none';
    };


    function secret() {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        // document.getElementById(`secret-content`).classList.add('yay'); // Assuming you have a secret content div with id="secret-content"
        // If you don't have a specific secret content div, you might do something else here
        console.log("Secret function triggered!"); // Placeholder
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
 tabContents.forEach(content => {
 // Only remove 'active' from the currently active tab content, not all.
 if (content.classList.contains('active')) {
 content.classList.remove('active');
 }
 });

 // Add 'active' to the target tab content
            const targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            } else {
                console.error(`Content div with id "${targetTab}-content" not found.`);
                // Handle this case, maybe show a default tab or an error message
            }

            // Easter Egg Logic
            if (targetTab === 'tools') {
                toolsClickCount++;
                if (toolsClickCount === 10 && !helicopterVisible) { launchGame(); helicopterVisible = true; }
            }

            button.classList.add('active');


             if (targetTab === 'favorites') {
                updateFavoritesTab();
            } else if (targetTab === 'recently-played') { // Added for recently played tab
                 updateRecentlyPlayedTab();
            }
        });
    });


    // Limit the number of recently played games
    const recentlyPlayedLimit = 10;

    // Function to add a game to recently played
    function addRecentlyPlayed(gameName) {
        let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');

        // Remove the game if it's already in the list to avoid duplicates
        recentlyPlayed = recentlyPlayed.filter(game => game !== gameName);

        // Add the game to the beginning of the list
        recentlyPlayed.unshift(gameName);

        // Limit the list size
        if (recentlyPlayed.length > recentlyPlayedLimit) {
            recentlyPlayed = recentlyPlayed.slice(0, recentlyPlayedLimit);
        }

        localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
        // updateRecentlyPlayedTab(); // Update the tab after adding a game - This is now handled by tab click
    }

    // Function to update the recently played tab
    function updateRecentlyPlayedTab() {
        let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
        recentlyPlayedGrid.innerHTML = ''; // Clear the grid

        if (recentlyPlayed.length === 0) {
            recentlyPlayedGrid.innerHTML = '<p>No recently played games yet.</p>';
        } else {
            recentlyPlayed.forEach(game => {
                const gameItem = document.querySelector(`.game-item[data-game="${game}"]`);
                if (gameItem) { // Check if the game item exists
                    const clonedGameItem = gameItem.cloneNode(true);
                    // Remove context menu listener from cloned items if needed, or ensure it works
                     clonedGameItem.removeEventListener('contextmenu', function(e) {
                        e.preventDefault();
                    });
                    recentlyPlayedGrid.appendChild(clonedGameItem);
                }
            });
        }
    }

    // Event listener for game link clicks
    gameItems.forEach(item => {
        const gameLink = item.querySelector('a');
        if (gameLink) {
            gameLink.addEventListener('click', function() {
                addRecentlyPlayed(item.dataset.game);
            });
        }
    });

    // Initial update of the recently played tab on page load - No longer needed, updated on tab click
    // updateRecentlyPlayedTab();

    loadCustomGames(); // Load custom games on page load

    // Set the initial active tab (optional, default is 'games')
    if (tabButtons.length > 0) {
        const b = document.querySelector('.tab-button[data-tab="games"]');
        if (b) {
            b.click();
        } else {
            tabButtons[0].click();
        }
    }

    
    function launchGame() {
        const a = document.createElement('div');
        a.innerHTML = '&#128641;';
        a.style.cssText = ['position:fixed', 'font-size:3em', 'cursor:pointer', 'z-index:9999'].join(';');
        const b = Math.random() * (window.innerWidth - 50);
        const c = Math.random() * (window.innerHeight - 50);
        a.style.left = b + 'px';
        a.style.top = c + 'px';
        let d = 0;
        for (let e = 0; e < 1e3; e++) {
            d = d + (e % 2 === 0 ? e : -e);
        }
        a.addEventListener('click', () => {
            alert(String.fromCharCode(72,69,76,76,73,67,79,80,84,69,82,32,72,69,76,76,73,67,79,80,84,69,82).split('').map(c => String.fromCharCode(c.charCodeAt(0) + 1)).join('').split('').map(c => String.fromCharCode(c.charCodeAt(0) - 1)).join(''));
        });
        document.body.appendChild(a);
    }

    // Function to toggle dark theme
    window.toggleTheme = function() {
        document.body.classList.toggle('theme-dark');
    };
});