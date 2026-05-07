// loading food from backend
// loading user points
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    let userId = null;
    let userPoints = 0; 
    let userPet = null;
    let currentFoodToBuy = null; //food currently selected 

    // DOM Elements
    const loginHint = document.getElementById("loginHint");
    const errorMsg = document.getElementById("errorMsg");
    const successMsg = document.getElementById("successMsg");
    // points display
    const pointsTracker = document.getElementById("pointsTracker");
    const userPointsEl = document.getElementById("userPoints");
    // card for food
    const foodContainer = document.getElementById("foodContainer");

    // Modal Elements
    const buyModal = new bootstrap.Modal(document.getElementById('buyModal'));
    const modalFoodEmoji = document.getElementById("modalFoodEmoji");
    const modalFoodName = document.getElementById("modalFoodName");
    const modalFoodCost = document.getElementById("modalFoodCost");
    const quantityInput = document.getElementById("quantityInput");
    const buyError = document.getElementById("buyError");
    
    // Summary elements
    const summaryUnitCost = document.getElementById("summaryUnitCost");
    const summaryQuantity = document.getElementById("summaryQuantity");
    const summaryTotalCost = document.getElementById("summaryTotalCost");
    const summaryUserPoints = document.getElementById("summaryUserPoints");
    const summaryRemaining = document.getElementById("summaryRemaining");

    // Food emoji mapping
    const foodEmojis = {
        'Milk': '🥛',
        'Kibble': '🍪',
        'Chicken': '🍗',
        'Beef': '🥩',
        'Tuna': '🐟',
        'Salmon': '🐠',
        'Super Special Treat': '🍬'
    };

    // Check login and load data
    if (token) {
        const payload = token.split('.')[1];
        userId = JSON.parse(atob(payload)).userId;
        loadUserData();
        pointsTracker.classList.remove("d-none");
    } else {
        // show login hint
        loginHint.classList.remove("d-none");
        // hide points tracker
        pointsTracker.classList.add("d-none");
    }

    // Always load food items (for both logged in and not logged in users)
    loadFood();

    // Load user data (points)
    function loadUserData() {
        if (!userId) return;
        
        fetchMethod(currentUrl + "/api/users/" + userId, (status, data) => {
            if (status === 200) {
                userPoints = data.points || 0;
                userPointsEl.textContent = userPoints;
            }
        }, "GET", null, token);
    }

    // Load all food items
    function loadFood() {
        fetchMethod(currentUrl + "/api/food", (status, data) => {
            if (status !== 200) {
                showError("Failed to load food items");
                return;
            }
            displayFood(data);
        }, "GET");
    }

    // Display food items (similar to pets.js)
    function displayFood(foodItems) {
        // clears existing content
        foodContainer.innerHTML = "";
        
        // loops thru each food from backend
        foodItems.forEach(food => {
            const col = document.createElement("div");
            // creating column
            col.className = "col-md-6 col-lg-4 mb-4";
            
            // Get emoji for this food
            const emoji = foodEmojis[food.food_name] || '🍖';
            const canAfford = userPoints >= food.cost;
            
            // card for food similar to challenge, pet and food
            col.innerHTML = `
                <div class="card h-100 text-center">
                    <div class="card-body d-flex flex-column">
                        <div class="display-4 text-primary mb-3">${emoji}</div> <!-- emoji -->
                        <h5 class="card-title fw-bold">${food.food_name}</h5> <!-- food name -->
                        
                        <div class="mb-3">
                            <span class="badge bg-primary fs-6">${food.cost} points</span> <!-- cost -->
                            <span class="badge bg-success fs-6 ms-2">+${food.hunger_restore} Hunger</span> <!-- hunger restore -->
                            <span class="badge bg-info fs-6 ms-2">+${food.xp_gain} XP</span> <!-- xp -->
                        </div>
                        
                        <!-- description -->
                        <p class="card-text flex-grow-1">
                            Restores ${food.hunger_restore} hunger and gives ${food.xp_gain} XP to your pet
                        </p>
                        
                        <div class="mt-auto">
                        <!-- if no token button disabled -->
                            ${!token ? 
                                `<button class="btn btn-outline-primary w-100" disabled>
                                    Login to Buy
                                </button>` :
                                !canAfford ? // if cant afford button disabled
                                `<button class="btn btn-secondary w-100" disabled>
                                    Need ${food.cost} points
                                </button>` : // if logged in and can afford button enabled
                                `<button class="btn btn-primary w-100 buy-food" 
                                    data-id="${food.food_id}" 
                                    data-cost="${food.cost}"
                                    data-name="${food.food_name}">
                                    Buy for ${food.cost} points
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            `;
            // add card to container
            foodContainer.appendChild(col);
        });
        
        // Add event listeners to buy buttons
        document.querySelectorAll('.buy-food').forEach(button => {
            button.addEventListener('click', function() {
                // get food data from button attributes
                const foodId = this.getAttribute('data-id');
                const cost = parseInt(this.getAttribute('data-cost'));
                const name = this.getAttribute('data-name');
                openBuyModal(foodId, cost, name); //open modal
            });
        });
    }

    // Open buy modal
    function openBuyModal(foodId, cost, name) {
        // stores select food
        currentFoodToBuy = { id: foodId, cost: cost, name: name };
        
        // Check if user has enough points for at least 1 item
        if (userPoints < cost) {
            showBuyError(`You need ${cost} points but only have ${userPoints} points`);
            buyModal.show();
            return;
        }
        
        // Set modal content
        modalFoodEmoji.textContent = foodEmojis[name] || '🍖';
        modalFoodName.textContent = name;
        modalFoodCost.textContent = cost;
        quantityInput.value = 1;
        
        // Update summary
        updateSummary();
        // clears any error
        hideBuyError();
        // show modal
        buyModal.show();
        // focus on quantity input
        quantityInput.focus();
    }

    // Update purchase summary
    function updateSummary() {
        // exit if no food selected
        if (!currentFoodToBuy) return;
        // get quantity
        const quantity = parseInt(quantityInput.value) || 1;
        // calculate total cost
        const totalCost = currentFoodToBuy.cost * quantity;
        // remaining points
        const remaining = userPoints - totalCost;
        
        // updating summary
        summaryUnitCost.textContent = currentFoodToBuy.cost + " points";
        summaryQuantity.textContent = quantity;
        summaryTotalCost.textContent = totalCost + " points";
        summaryUserPoints.textContent = userPoints + " points";
        summaryRemaining.textContent = remaining + " points";
        
        // Color code remaining points
        summaryRemaining.className = remaining >= 0 ? "text-success" : "text-danger";
    }

    // Quantity input change event
    quantityInput.addEventListener("input", updateSummary);

    // Buy form submit
    document.getElementById("buyForm").addEventListener("submit", function(e) {
        e.preventDefault();
        hideBuyError();
        
        // validation checks
        if (!token || !currentFoodToBuy) {
            showBuyError("Please login first");
            return;
        }
        
        const quantity = parseInt(quantityInput.value) || 1;
        const totalCost = currentFoodToBuy.cost * quantity;
        
        // Check if user has enough points
        if (userPoints < totalCost) {
            showBuyError(`You need ${totalCost} points but only have ${userPoints} points`);
            return;
        }
        
        // Check if quantity is valid
        if (quantity < 1) {
            showBuyError("Quantity must be at least 1");
            return;
        }
        
        const data = {
            food_id: parseInt(currentFoodToBuy.id),
            quantity: quantity
        };
        
        const callback = (status, response) => {
            if (status !== 200) {
                showBuyError(response.message || "Failed to buy food");
                return;
            }
            
            // close modals and show success message
            buyModal.hide();
            showSuccess(`Successfully bought ${quantity} ${currentFoodToBuy.name}!`);
            
            // Refresh user points
            setTimeout(() => {
                loadUserData();
            }, 500);
        };
        
        fetchMethod(currentUrl + "/api/inventory/buy", callback, "POST", data, token);
    });

    // Helper functions for modal errors
    function showBuyError(message) {
        buyError.textContent = message;
        buyError.classList.remove("d-none");
    }

    function hideBuyError() {
        buyError.textContent = "";
        buyError.classList.add("d-none");
    }

    // Helper functions for page messages
    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.remove("d-none");
        setTimeout(() => errorMsg.classList.add("d-none"), 3000);
    }
    
    function showSuccess(message) {
        successMsg.textContent = message;
        successMsg.classList.remove("d-none");
        setTimeout(() => successMsg.classList.add("d-none"), 3000);
    }
});