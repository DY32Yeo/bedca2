document.addEventListener("DOMContentLoaded", function () 
{
    const token = localStorage.getItem("token");
    
    // Get user ID from token
    let userId = null;
    if (token) {
        const payload = token.split('.')[1];
        if (payload) {
            const decoded = JSON.parse(atob(payload));
            userId = decoded.userId;
        }
    }

    // Get DOM elements
    const loginRequired = document.getElementById("loginRequired");
    const profileContent = document.getElementById("profileContent");
    const errorMsg = document.getElementById("errorMsg");
    const successMsg = document.getElementById("successMsg");
    
    // Profile info elements
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const currentPasswordInput = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const editUsernameBtn = document.getElementById("editUsernameBtn");
    const profileForm = document.getElementById("profileForm");
    const memberSince = document.getElementById("memberSince");
    const userIdSpan = document.getElementById("userId");
    
    // Stats elements
    const totalPoints = document.getElementById("totalPoints");
    const completedChallenges = document.getElementById("completedChallenges");
    const totalPointsEarned = document.getElementById("totalPointsEarned");
    const leaderboardRank = document.getElementById("leaderboardRank");
    
    // Pet elements
    const petSection = document.getElementById("petSection");
    const petCard = document.getElementById("petCard");
    const noPetMessage = document.getElementById("noPetMessage");
    const petEmoji = document.getElementById("petEmoji");
    const petName = document.getElementById("petName");
    const petLevel = document.getElementById("petLevel");
    const petExperience = document.getElementById("petExperience");
    const petHunger = document.getElementById("petHunger");
    const petSpecies = document.getElementById("petSpecies");
    const petAdoptedDate = document.getElementById("petAdoptedDate");
    const feedPetBtn = document.getElementById("feedPetBtn");
    const levelPetBtn = document.getElementById("levelPetBtn");
    const releasePetBtn = document.getElementById("releasePetBtn");
    
    // Inventory elements
    const inventoryContainer = document.getElementById("inventoryContainer");
    const emptyInventory = document.getElementById("emptyInventory");
    
    // Danger zone
    const deleteAccountBtn = document.getElementById("deleteAccountBtn");
    
    // Modals
    const feedModal = new bootstrap.Modal(document.getElementById('feedModal'));
    const levelModal = new bootstrap.Modal(document.getElementById('levelModal'));
    const confirmReleaseModal = new bootstrap.Modal(document.getElementById('confirmReleaseModal'));
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    
    // Feed modal elements
    const feedPetEmoji = document.getElementById("feedPetEmoji");
    const feedPetName = document.getElementById("feedPetName");
    const feedPetHunger = document.getElementById("feedPetHunger");
    const foodSelect = document.getElementById("foodSelect");
    const feedQuantity = document.getElementById("feedQuantity");
    const feedInfoText = document.getElementById("feedInfoText");
    const feedForm = document.getElementById("feedForm");
    const feedError = document.getElementById("feedError");
    
    // Level modal elements
    const levelPetEmoji = document.getElementById("levelPetEmoji");
    const levelPetName = document.getElementById("levelPetName");
    const levelCurrentLevel = document.getElementById("levelCurrentLevel");
    const levelCurrentXP = document.getElementById("levelCurrentXP");
    const levelProgressBar = document.getElementById("levelProgressBar");
    const currentBonus = document.getElementById("currentBonus");
    const nextBonus = document.getElementById("nextBonus");
    const levelUpText = document.getElementById("levelUpText");
    const levelUpBtn = document.getElementById("levelUpBtn");
    const levelError = document.getElementById("levelError");
    const levelUpInfo = document.getElementById("levelUpInfo");
    
    // Release modal elements
    const releasePetName = document.getElementById("releasePetName");
    const confirmReleaseBtn = document.getElementById("confirmReleaseBtn");
    
    // Delete modal elements
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    let userData = null;
    let userPet = null;
    let userCompletions = [];
    let allFood = [];
    let userInventory = [];
    let availableLevels = [];
    let currentFoodItem = null;

    // Check if user is logged in
    if (!token || !userId) {
        loginRequired.classList.remove("d-none");
        return;
    } else {
        profileContent.classList.remove("d-none");
        loadUserProfile();
    }

    // Load user profile data
    function loadUserProfile() {
        userIdSpan.textContent = `#${userId}`;
        
        // Load user data
        loadUserData();
        // Load user pet
        loadUserPet();
        // Load user completions
        loadUserCompletions();
        // Load inventory
        loadInventory();
        // Load all food items
        loadAllFood();
        // Load levels
        loadLevels();
    }

    // Load user data (points, username, email)
    function loadUserData() {
        const callback = (status, data) => {
            if (status === 200) {
                userData = data;
                updateUserInfo();
            } else {
                showError(errorMsg, "Failed to load user data");
            }
        };
        
        fetchMethod(currentUrl + "/api/users/" + userId, callback, "GET", null, token);
    }

    // Load user's pet if exists
    function loadUserPet() {
        const callback = (status, data) => {
            if (status === 200) {
                if (data.length > 0) {
                    userPet = data[0];
                    updatePetInfo();
                    petCard.classList.remove("d-none");
                    noPetMessage.classList.add("d-none");
                } else {
                    userPet = null;
                    petCard.classList.add("d-none");
                    noPetMessage.classList.remove("d-none");
                }
            } else if (status === 404) {
                userPet = null;
                petCard.classList.add("d-none");
                noPetMessage.classList.remove("d-none");
            } else {
                showError(errorMsg, "Failed to load pet data");
            }
        };
        
        fetchMethod(currentUrl + "/api/userpet/" + userId, callback, "GET", null, token);
    }

    // Load user completions for stats
    function loadUserCompletions() {
        const callback = (status, data) => {
            if (status === 200) {
                userCompletions = data;
                updateStats();
            }
        };
        
        fetchMethod(currentUrl + "/api/completion/user", callback, "GET", null, token);
    }

    // Load user inventory
    function loadInventory() {
        const callback = (status, data) => {
            if (status === 200) {
                userInventory = data;
                displayInventory();
            } else {
                inventoryContainer.innerHTML = '<div class="col-12 text-center py-3"><p class="text-muted">Failed to load inventory</p></div>';
            }
        };
        
        fetchMethod(currentUrl + "/api/inventory", callback, "GET", null, token);
    }

    // Load all food items
    function loadAllFood() {
        const callback = (status, data) => {
            if (status === 200) {
                allFood = data;
                populateFoodSelect();
            }
        };
        
        fetchMethod(currentUrl + "/api/food", callback, "GET");
    }

    // Load all levels
    function loadLevels() {
        const callback = (status, data) => {
            if (status === 200) {
                availableLevels = data;
            }
        };
        
        fetchMethod(currentUrl + "/api/level", callback, "GET");
    }

    // Update user info display
    function updateUserInfo() {
        if (!userData) return;
        
        usernameInput.value = userData.username || "";
        emailInput.value = userData.email || "";
        
        if (userData.created_on) {
            const date = new Date(userData.created_on);
            memberSince.textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Update pet info display
    function updatePetInfo() {
        if (!userPet) return;
        
        // Set pet emoji based on species
        const emoji = getPetEmoji(userPet.species || userPet.pet_id);
        petEmoji.textContent = emoji;
        
        petName.textContent = userPet.pet_name || "Unnamed Pet";
        petLevel.textContent = "Level " + (userPet.level_id || 1);
        petExperience.textContent = (userPet.experience || 0) + " XP";
        
        const hunger = userPet.hunger || 100;
        petHunger.textContent = hunger + "%";
        petHunger.className = hunger <= 10 ? "badge bg-danger" : "badge bg-warning";
        
        petSpecies.textContent = userPet.species || "Unknown";
        
        if (userPet.adopted_on) {
            const date = new Date(userPet.adopted_on);
            petAdoptedDate.textContent = date.toLocaleDateString();
        }
    }

    // Update stats display
    function updateStats() {
        if (!userData) return;
        
        totalPoints.textContent = userData.points || 0;
        
        // Calculate completed challenges
        let completedCount = 0;
        let totalPointsFromChallenges = 0;
        
        for (let i = 0; i < userCompletions.length; i++) {
            completedCount += userCompletions[i].completion_count || 0;
            // Note: We need to load all challenges to calculate total points earned
            // For now, we'll show completion count
        }
        
        completedChallenges.textContent = completedCount;
        
        // For leaderboard rank, we'd need to calculate it from the leaderboard API
        // For now, we'll show placeholder
        leaderboardRank.textContent = completedCount > 0 ? "Top 50%" : "Not Ranked";
    }

    // Display inventory items
    function displayInventory() {
        inventoryContainer.innerHTML = "";
        
        if (!userInventory || userInventory.length === 0) {
            inventoryContainer.classList.add("d-none");
            emptyInventory.classList.remove("d-none");
            return;
        }
        
        inventoryContainer.classList.remove("d-none");
        emptyInventory.classList.add("d-none");
        
        for (let i = 0; i < userInventory.length; i++) {
            const item = userInventory[i];
            
            const col = document.createElement("div");
            col.className = "col-md-4 col-lg-3";
            
            col.innerHTML = `
                <div class="inventory-item card h-100">
                    <div class="card-body">
                        <h6 class="card-title fw-bold">${item.food_name}</h6>
                        <div class="mb-2">
                            <span class="badge bg-primary">${item.quantity} left</span>
                        </div>
                        <div class="small text-muted">
                            <div>Hunger: +${item.hunger_restore}%</div>
                            <div>XP: +${item.xp_gain}</div>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-sm btn-outline-primary use-food-btn" 
                                    data-id="${item.food_id}"
                                    data-name="${item.food_name}"
                                    data-hunger="${item.hunger_restore}"
                                    data-xp="${item.xp_gain}"
                                    data-quantity="${item.quantity}">
                                Use to Feed
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            inventoryContainer.appendChild(col);
        }
        
        // Add event listeners to use food buttons
        document.querySelectorAll('.use-food-btn').forEach(button => {
            button.addEventListener('click', function() {
                const foodId = this.getAttribute('data-id');
                const foodName = this.getAttribute('data-name');
                const hungerRestore = this.getAttribute('data-hunger');
                const xpGain = this.getAttribute('data-xp');
                const quantity = this.getAttribute('data-quantity');
                
                openFeedModalWithFood(foodId, foodName, hungerRestore, xpGain, quantity);
            });
        });
    }

    // Populate food select dropdown
    function populateFoodSelect() {
        foodSelect.innerHTML = '<option value="">Choose food from inventory...</option>';
        
        if (!userInventory || userInventory.length === 0) return;
        
        for (let i = 0; i < userInventory.length; i++) {
            const item = userInventory[i];
            const food = allFood.find(f => f.food_id == item.food_id);
            if (food) {
                const option = document.createElement("option");
                option.value = item.food_id;
                option.textContent = `${item.food_name} (${item.quantity} left) - +${food.hunger_restore}% Hunger, +${food.xp_gain} XP`;
                option.setAttribute('data-hunger', food.hunger_restore);
                option.setAttribute('data-xp', food.xp_gain);
                foodSelect.appendChild(option);
            }
        }
    }

    // Get pet emoji based on species or ID
    function getPetEmoji(species) {
        const speciesLower = species ? species.toLowerCase() : "";
        
        if (speciesLower.includes('dog')) return '🐕';
        if (speciesLower.includes('cat')) return '🐈';
        if (speciesLower.includes('ferret')) return '🐾';
        if (speciesLower.includes('hamster')) return '🐹';
        if (speciesLower.includes('parrot')) return '🦜';
        if (speciesLower.includes('seal')) return '🌊';
        
        // Default based on common species
        switch(speciesLower) {
            case 'dog': return '🐕';
            case 'cat': return '🐈';
            case 'ferret': return '🐾';
            case 'hamster': return '🐹';
            case 'parrot': return '🦜';
            case 'seal': return '🌊';
            default: return '🐾';
        }
    }

    // Open feed modal
    function openFeedModal() {
        if (!userPet) return;
        
        const emoji = getPetEmoji(userPet.species);
        feedPetEmoji.textContent = emoji;
        feedPetName.textContent = userPet.pet_name;
        feedPetHunger.textContent = (userPet.hunger || 100) + "%";
        feedPetHunger.className = userPet.hunger <= 10 ? "badge bg-danger" : "badge bg-warning";
        
        feedQuantity.value = "1";
        hideError(feedError);
        feedForm.reset();
        
        feedModal.show();
    }

    // Open feed modal with specific food pre-selected
    function openFeedModalWithFood(foodId, foodName, hungerRestore, xpGain, quantity) {
        openFeedModal();
        
        // Find and select the food item
        for (let i = 0; i < foodSelect.options.length; i++) {
            if (foodSelect.options[i].value == foodId) {
                foodSelect.selectedIndex = i;
                break;
            }
        }
        
        // Update feed info
        feedInfoText.textContent = `Feeding ${foodName} will restore ${hungerRestore}% hunger and give ${xpGain} XP per item.`;
        
        // Set max quantity
        feedQuantity.max = quantity;
        if (parseInt(quantity) === 1) {
            feedQuantity.disabled = true;
        }
    }

    // Open level up modal
    function openLevelModal() {
        if (!userPet) return;
        
        const emoji = getPetEmoji(userPet.species);
        levelPetEmoji.textContent = emoji;
        levelPetName.textContent = userPet.pet_name;
        
        const currentLevel = userPet.level_id || 1;
        const currentXP = userPet.experience || 0;
        
        levelCurrentLevel.textContent = `Level ${currentLevel}`;
        
        // Find current and next level requirements
        const currentLevelData = availableLevels.find(l => l.level_id === currentLevel);
        const nextLevelData = availableLevels.find(l => l.level_id === currentLevel + 1);
        
        if (nextLevelData) {
            const xpRequired = nextLevelData.experience_required;
            const xpProgress = Math.min(currentXP, xpRequired);
            const progressPercentage = Math.min(Math.floor((xpProgress / xpRequired) * 100), 100);
            
            levelCurrentXP.textContent = `${currentXP}/${xpRequired} XP`;
            levelProgressBar.style.width = progressPercentage + "%";
            levelProgressBar.textContent = progressPercentage + "%";
            levelProgressBar.className = progressPercentage >= 100 ? "progress-bar bg-success" : "progress-bar";
            
            currentBonus.textContent = `${(currentLevel - 1) * 10}%`;
            nextBonus.textContent = `${currentLevel * 10}%`;
            
            if (currentXP >= xpRequired) {
                levelUpText.textContent = "Your pet can level up! Click the button below.";
                levelUpInfo.className = "alert alert-success";
                levelUpBtn.disabled = false;
                levelUpBtn.textContent = `Level Up to ${nextLevelData.level_name}`;
            } else {
                const xpNeeded = xpRequired - currentXP;
                levelUpText.textContent = `Your pet needs ${xpNeeded} more XP to reach level ${currentLevel + 1}.`;
                levelUpInfo.className = "alert alert-warning";
                levelUpBtn.disabled = true;
                levelUpBtn.textContent = "Need More XP";
            }
        } else {
            // Max level reached
            levelCurrentXP.textContent = `${currentXP} XP (Max Level)`;
            levelProgressBar.style.width = "100%";
            levelProgressBar.textContent = "100%";
            levelProgressBar.className = "progress-bar bg-success";
            
            currentBonus.textContent = `${(currentLevel - 1) * 10}%`;
            nextBonus.textContent = "Max";
            
            levelUpText.textContent = "Your pet has reached the maximum level!";
            levelUpInfo.className = "alert alert-info";
            levelUpBtn.disabled = true;
            levelUpBtn.textContent = "Maximum Level Reached";
        }
        
        hideError(levelError);
        levelModal.show();
    }

    // Edit username button
    editUsernameBtn.addEventListener("click", function() {
        usernameInput.readOnly = !usernameInput.readOnly;
        if (!usernameInput.readOnly) {
            usernameInput.focus();
            editUsernameBtn.textContent = "Save";
            editUsernameBtn.className = "btn btn-primary";
        } else {
            editUsernameBtn.textContent = "Edit";
            editUsernameBtn.className = "btn btn-outline-primary";
        }
    });

    // Profile form submission
    profileForm.addEventListener("submit", function(e) {
        e.preventDefault();
        hideError(errorMsg);
        
        // Check if passwords match if provided
        const newPass = newPasswordInput.value;
        const confirmPass = confirmPasswordInput.value;
        
        if (newPass && newPass !== confirmPass) {
            showError(errorMsg, "New passwords do not match");
            return;
        }
        
        if (newPass && !currentPasswordInput.value) {
            showError(errorMsg, "Please enter current password to change password");
            return;
        }
        
        // Prepare data for update
        const data = {
            username: usernameInput.value
        };
        
        // If password change is requested
        if (newPass && currentPasswordInput.value) {
            // Note: In a real app, you'd need to verify current password first
            // This would require a separate API endpoint
            showError(errorMsg, "Password change requires current password verification. Please use a dedicated password change feature.");
            return;
        }
        
        const callback = (status, responseData) => {
            if (status !== 200) {
                showError(errorMsg, responseData.message || "Failed to update profile");
                return;
            }
            
            showSuccess("Profile updated successfully!");
            
            // Reset password fields
            currentPasswordInput.value = "";
            newPasswordInput.value = "";
            confirmPasswordInput.value = "";
            
            // Reload user data
            loadUserData();
        };
        
        fetchMethod(
            currentUrl + "/api/users/" + userId,
            callback,
            "PUT",
            data,
            token
        );
    });

    // Feed pet button
    feedPetBtn.addEventListener("click", openFeedModal);

    // Level pet button
    levelPetBtn.addEventListener("click", openLevelModal);

    // Release pet button
    releasePetBtn.addEventListener("click", function() {
        if (!userPet) return;
        
        releasePetName.textContent = userPet.pet_name;
        confirmReleaseModal.show();
    });

    // Feed form submission
    feedForm.addEventListener("submit", function(e) {
        e.preventDefault();
        hideError(feedError);
        
        if (!userPet) {
            showError(feedError, "You don't have a pet");
            return;
        }
        
        const foodId = foodSelect.value;
        const quantity = parseInt(feedQuantity.value);
        
        if (!foodId) {
            showError(feedError, "Please select a food item");
            return;
        }
        
        if (quantity < 1) {
            showError(feedError, "Quantity must be at least 1");
            return;
        }
        
        const data = {
            food_id: parseInt(foodId),
            quantity: quantity
        };
        
        const callback = (status, responseData) => {
            if (status !== 200) {
                showError(feedError, responseData.message || "Failed to feed pet");
                return;
            }
            
            feedModal.hide();
            showSuccess(`Successfully fed ${userPet.pet_name}! ${responseData.message}`);
            
            // Reload pet and inventory
            loadUserPet();
            loadInventory();
            loadUserData(); // Points might change
        };
        
        fetchMethod(
            currentUrl + "/api/inventory/pet/feed",
            callback,
            "POST",
            data,
            token
        );
    });

    // Level up button
    levelUpBtn.addEventListener("click", function() {
        if (!userPet || levelUpBtn.disabled) return;
        
        const callback = (status, responseData) => {
            if (status !== 200) {
                showError(levelError, responseData.message || "Failed to level up pet");
                return;
            }
            
            levelModal.hide();
            showSuccess(`Congratulations! ${userPet.pet_name} leveled up!`);
            
            // Reload pet data
            loadUserPet();
        };
        
        fetchMethod(
            currentUrl + "/api/level/pet/levelup",
            callback,
            "POST",
            { pet_id: userPet.pet_id },
            token
        );
    });

    // Confirm release pet
    confirmReleaseBtn.addEventListener("click", function() {
        const callback = (status, responseData) => {
            if (status !== 204) {
                showError(errorMsg, responseData.message || "Failed to release pet");
                confirmReleaseModal.hide();
                return;
            }
            
            confirmReleaseModal.hide();
            showSuccess("You have released your pet.");
            
            // Reload pet data
            loadUserPet();
        };
        
        fetchMethod(
            currentUrl + "/api/pet",
            callback,
            "DELETE",
            null,
            token
        );
    });

    // Delete account button
    deleteAccountBtn.addEventListener("click", function() {
        confirmDeleteModal.show();
    });

    // Confirm delete account
    confirmDeleteBtn.addEventListener("click", function() {
        const callback = (status, responseData) => {
            if (status !== 204) {
                showError(errorMsg, responseData.message || "Failed to delete account");
                confirmDeleteModal.hide();
                return;
            }
            
            confirmDeleteModal.hide();
            showSuccess("Your account has been deleted.");
            
            // Clear local storage and redirect to home page
            setTimeout(function() {
                localStorage.removeItem("token");
                window.location.href = "index.html";
            }, 2000);
        };
        
        fetchMethod(
            currentUrl + "/api/users/" + userId,
            callback,
            "DELETE",
            null,
            token
        );
    });

    // Food select change event
    foodSelect.addEventListener("change", function() {
        const selectedOption = foodSelect.options[foodSelect.selectedIndex];
        if (selectedOption.value) {
            const hungerRestore = selectedOption.getAttribute('data-hunger');
            const xpGain = selectedOption.getAttribute('data-xp');
            feedInfoText.textContent = `Feeding this will restore ${hungerRestore}% hunger and give ${xpGain} XP per item.`;
        }
    });

    // Helper functions
    function showError(element, message) {
        element.textContent = message;
        element.classList.remove("d-none");
    }
    
    function hideError(element) {
        element.textContent = "";
        element.classList.add("d-none");
    }
    
    function showSuccess(message) {
        successMsg.textContent = message;
        successMsg.classList.remove("d-none");
        setTimeout(function() {
            successMsg.classList.add("d-none");
        }, 3000);
    }
});