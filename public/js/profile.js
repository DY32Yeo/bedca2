// profile.js - Using the /api/users/info endpoint
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    
    // Check if user is logged in
    if (!token) {
        window.location.href = "login.html";
        return;
    }

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
    const errorMsg = document.getElementById("errorMsg");
    const successMsg = document.getElementById("successMsg");
    
    // User info elements
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const createdOn = document.getElementById("createdOn");
    const points = document.getElementById("points");
    const completedChallenges = document.getElementById("completedChallenges");
    const totalPoints = document.getElementById("totalPoints");
    const ranking = document.getElementById("ranking");
    
    // Pet elements
    const petSection = document.getElementById("petSection");
    const noPetSection = document.getElementById("noPetSection");
    const petHeader = document.getElementById("petHeader");
    const petEmoji = document.getElementById("petEmoji");
    const petName = document.getElementById("petName");
    const petSpecies = document.getElementById("petSpecies");
    const petAdoptedOn = document.getElementById("petAdoptedOn");
    const petLevel = document.getElementById("petLevel");
    const petExperience = document.getElementById("petExperience");
    const petHungerBar = document.getElementById("petHungerBar");
    const petHunger = document.getElementById("petHunger");
    const petBonus = document.getElementById("petBonus");
    
    // Inventory elements
    const inventoryEmpty = document.getElementById("inventoryEmpty");
    const inventoryItems = document.getElementById("inventoryItems");
    
    // Buttons
    const editProfileBtn = document.getElementById("editProfileBtn");
    const deleteAccountBtn = document.getElementById("deleteAccountBtn");
    const releasePetBtn = document.getElementById("releasePetBtn");
    const feedPetBtn = document.getElementById("feedPetBtn");
    const levelUpPetBtn = document.getElementById("levelUpPetBtn");
    const editPetNameBtn = document.getElementById("editPetNameBtn");
    
    // Modals
    const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    const editPetNameModal = new bootstrap.Modal(document.getElementById('editPetNameModal'));
    const feedPetModal = new bootstrap.Modal(document.getElementById('feedPetModal'));
    const levelUpModal = new bootstrap.Modal(document.getElementById('levelUpModal'));
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    const confirmReleaseModal = new bootstrap.Modal(document.getElementById('confirmReleaseModal'));
    
    // Forms
    const editProfileForm = document.getElementById("editProfileForm");
    const editPetNameForm = document.getElementById("editPetNameForm");
    const feedPetForm = document.getElementById("feedPetForm");
    
    // Form inputs
    const editUsername = document.getElementById("editUsername");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const currentPassword = document.getElementById("currentPassword");
    const newPetName = document.getElementById("newPetName");
    const foodSelect = document.getElementById("foodSelect");
    const feedQuantity = document.getElementById("feedQuantity");
    const foodAvailable = document.getElementById("foodAvailable");
    const confirmLevelUpBtn = document.getElementById("confirmLevelUpBtn");
    
    // Food preview elements
    const foodPreview = document.getElementById("foodPreview");
    const previewHunger = document.getElementById("previewHunger");
    const previewXP = document.getElementById("previewXP");
    const previewTotal = document.getElementById("previewTotal");
    
    // Level up elements
    const levelUpEmoji = document.getElementById("levelUpEmoji");
    const levelUpPetName = document.getElementById("levelUpPetName");
    const currentLevelText = document.getElementById("currentLevelText");
    const currentExpValue = document.getElementById("currentExpValue");
    const requiredExpValue = document.getElementById("requiredExpValue");
    const expNeeded = document.getElementById("expNeeded");
    
    // Current pet status
    const currentHunger = document.getElementById("currentHunger");
    const currentExperience = document.getElementById("currentExperience");
    const currentLevel = document.getElementById("currentLevel");
    
    // Error divs
    const editProfileError = document.getElementById("editProfileError");
    const editPetNameError = document.getElementById("editPetNameError");
    const feedPetError = document.getElementById("feedPetError");
    const levelUpError = document.getElementById("levelUpError");

    // Confirm buttons
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const confirmReleaseBtn = document.getElementById("confirmReleaseBtn");

    let userData = null;
    let userPet = null;
    let inventoryData = [];
    let allLevels = [];
    let foodItems = [];

    // Initial load
    loadAllUserData();
    loadAllLevels();
    loadFoodItems();

    // Load all user data from /api/users/info endpoint
    function loadAllUserData() {
        if (!userId) {
            window.location.href = "login.html";
            return;
        }
        
        console.log("Loading user data from /api/users/info for user ID:", userId);
        
        fetchMethod(currentUrl + "/api/users/info", (status, response) => {
            console.log("User info response:", status, response);
            
            if (status === 200) {
                // Update user basic info
                if (response.user) {
                    userData = response.user;
                    updateUserInfo();
                }
                
                // Update pet info
                if (response.pet && response.pet.length > 0) {
                    // stores the first pet
                    userPet = response.pet[0];
                    // update pet info display
                    updatePetInfo();
                    petSection.classList.remove("d-none");
                    noPetSection.classList.add("d-none");
                    
                    // Show edit pet name button if user has pet
                    if (editPetNameBtn) {
                        editPetNameBtn.classList.remove("d-none");
                    }
                } else {
                    // if no pet data clear 
                    userPet = null;
                    petSection.classList.add("d-none");
                    noPetSection.classList.remove("d-none");
                    
                    // Hide edit pet name button if no pet
                    if (editPetNameBtn) {
                        editPetNameBtn.classList.add("d-none");
                    }
                }
                
                // Update inventory
                if (response.inventory && response.inventory.length > 0) {
                    inventoryData = response.inventory;
                    // display inventory items  
                    displayInventory();
                    inventoryEmpty.classList.add("d-none");
                } else {
                    // if no inventory data show empty message
                    inventoryData = [];
                    inventoryEmpty.classList.remove("d-none");
                }
                
                // Update completion count
                if (response.completion_count !== undefined) {
                    completedChallenges.textContent = response.completion_count;
                    // Use actual user points for total points
                    if (userData && userData.points) {
                        totalPoints.textContent = userData.points;
                    }
                }
                
                // Load leaderboard rank
                loadLeaderboardRank();
                
            } else {
                showError(errorMsg, "Failed to load profile data: " + (response.message || "Unknown error"));
            }
        }, "GET", null, token);
    }

    // Load leaderboard rank
    function loadLeaderboardRank() {
        fetchMethod(currentUrl + "/api/users/leaderboard", (status, data) => {
            if (status === 200 && data) {
                // Find user in leaderboard
                for (let i = 0; i < data.length; i++) {
                    if (data[i].user_id == userId) {
                        // set ranking
                        ranking.textContent = "#" + (i + 1);
                        return;
                    }
                }
                ranking.textContent = "Not Ranked";
            } else {
                ranking.textContent = "Not Ranked";
            }
        }, "GET");
    }

    // Load all levels for level up checking
    function loadAllLevels() {
        fetchMethod(currentUrl + "/api/level", (status, data) => {
            if (status === 200) {
                allLevels = data;
            }
        }, "GET");
    }

    // Load food items for dropdown
    function loadFoodItems() {
        fetchMethod(currentUrl + "/api/food", (status, data) => {
            if (status === 200) {
                foodItems = data;
            }
        }, "GET");
    }

    // Update user info display
    function updateUserInfo() {
        if (!userData) return;
        
        username.textContent = userData.username || "Unknown";
        email.textContent = userData.email || "Not provided";
        points.textContent = userData.points || 0;
        
        if (userData.created_on) {
            const date = new Date(userData.created_on);
            createdOn.textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            // if creation date unknown
            createdOn.textContent = "Unknown";
        }
    }

    // Update pet info display
    function updatePetInfo() {
        // exit if no pet data
        if (!userPet) return;
        
        // Set pet emoji based on species
        const emoji = getPetEmoji(userPet.species);
        petEmoji.textContent = emoji;
        
        const petDisplayName = userPet.pet_name || "Unnamed Pet";
        petName.textContent = petDisplayName;
        petSpecies.textContent = userPet.species || "Unknown";
        petHeader.textContent = petDisplayName;
        
        if (userPet.adopted_on) {
            const date = new Date(userPet.adopted_on);
            petAdoptedOn.textContent = date.toLocaleDateString();
        } else {
            petAdoptedOn.textContent = "Unknown";
        }
        
        petLevel.textContent = "Level " + (userPet.level_id || 1);
        petExperience.textContent = (userPet.experience || 0) + " XP";
        
        const hunger = userPet.hunger || 100;
        petHunger.textContent = hunger + "%";
        petHungerBar.style.width = hunger + "%";
        petHungerBar.textContent = hunger + "%";
        petHungerBar.className = hunger <= 10 ? "progress-bar bg-danger" : "progress-bar bg-warning";
        
        const bonusPercentage = (userPet.level_id || 1) * 10;
        petBonus.textContent = bonusPercentage + "%";
    }

    // Get pet emoji
    function getPetEmoji(species) {
        if (!species) return '🐾';
        
        const speciesLower = species.toLowerCase();
        
        if (speciesLower.includes('dog')) return '🐕';
        if (speciesLower.includes('cat')) return '🐈';
        if (speciesLower.includes('deer')) return '🦌';
        if (speciesLower.includes('otter')) return '🦦';
        if (speciesLower.includes('squirrel')) return '🐿️';
        if (speciesLower.includes('hamster')) return '🐹';
        if (speciesLower.includes('parrot')) return '🦜';
        if (speciesLower.includes('seal')) return '🦭';
        if (speciesLower.includes('alpaca')) return '🦙';
        
        return '🐾';
    }

    // Display inventory
    function displayInventory() {
        inventoryItems.innerHTML = "";
        
        if (!inventoryData || inventoryData.length === 0) {
            inventoryEmpty.classList.remove("d-none");
            return;
        }
        // loop thru inventory data
        for (let i = 0; i < inventoryData.length; i++) {
            // ger current food
            const item = inventoryData[i];
            
            const col = document.createElement("div");
            col.className = "col-md-6 col-lg-4 mb-3";
            
            col.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${item.food_name || "Unknown Food"}</h5>
                        <div class="mb-3">
                            <span class="badge bg-primary me-2">${item.hunger_restore || 0} hunger</span>
                            <span class="badge bg-success me-2">${item.xp_gain || 0} XP</span>
                            <span class="badge bg-secondary">${item.quantity || 0} left</span>
                        </div>
                        <div class="text-muted small">
                            <div>Cost: ${item.cost || 0} points</div>
                        </div>
                    </div>
                </div>
            `;
            
            inventoryItems.appendChild(col);
        }
        
        inventoryEmpty.classList.add("d-none");
    }

    // ===== EVENT HANDLERS =====
    
    // Edit profile button
    editProfileBtn.addEventListener("click", function() {
        if (!userData) return;
        
        editUsername.value = userData.username || "";
        newPassword.value = "";
        confirmPassword.value = "";
        currentPassword.value = "";
        hideError(editProfileError);
        editProfileModal.show();
    });

    // Edit profile form
    editProfileForm.addEventListener("submit", function(e) {
        e.preventDefault();
        hideError(editProfileError);
        
        // Validate passwords match if changing password
        if (newPassword.value && newPassword.value !== confirmPassword.value) {
            showError(editProfileError, "New passwords do not match");
            return;
        }
        
        if (!currentPassword.value) {
            showError(editProfileError, "Current password is required");
            return;
        }
        
        // Prepare data for password verification first
        const loginData = {
            username: userData.username,
            password: currentPassword.value
        };
        
        // First verify current password
        const verifyCallback = (status, responseData) => {
            if (status !== 200) {
                showError(editProfileError, "Current password is incorrect");
                return;
            }
            
            // Password verified, now update profile
            const updateData = {
                username: editUsername.value
            };
            
            // Only add password if it was provided
            if (newPassword.value) {
                updateData.password = newPassword.value;
            }
            
            const updateCallback = (updateStatus, updateResponse) => {
                if (updateStatus !== 200) {
                    showError(editProfileError, updateResponse.message || "Failed to update profile");
                    return;
                }
                
                editProfileModal.hide();
                showSuccess("Profile updated successfully!");
                loadAllUserData(); // Reload all data
            };
            
            fetchMethod(
                currentUrl + "/api/users/" + userId,
                updateCallback,
                "PUT",
                updateData,
                token
            );
        };
        
        // Verify password using login endpoint
        fetchMethod(
            currentUrl + "/api/login",
            verifyCallback,
            "POST",
            loginData
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
            
            // Clear token and redirect to index.html
            localStorage.removeItem("token");
            window.location.href = "index.html";
        };
        
        fetchMethod(
            currentUrl + "/api/users/" + userId,
            callback,
            "DELETE",
            null,
            token
        );
    });

    // Release pet button
    releasePetBtn.addEventListener("click", function() {
        if (!userPet) return;
        
        confirmReleaseModal.show();
    });

    // Confirm release pet
    confirmReleaseBtn.addEventListener("click", function() {
        const callback = (status, responseData) => {
            if (status !== 204) {
                showError(errorMsg, responseData.message || "Failed to release pet");
                confirmReleaseModal.hide();
                return;
            }
            
            showSuccess("Pet released successfully");
            confirmReleaseModal.hide();
            loadAllUserData(); // Reload all data
        };
        
        fetchMethod(
            currentUrl + "/api/pet",
            callback,
            "DELETE",
            null,
            token
        );
    });

    // Edit pet name button (add this button to your HTML)
    if (editPetNameBtn) {
        editPetNameBtn.addEventListener("click", function() {
            if (!userPet) return;
            
            newPetName.value = userPet.pet_name || "";
            hideError(editPetNameError);
            editPetNameModal.show();
        });
    }

    // Edit pet name form
    if (editPetNameForm) {
        editPetNameForm.addEventListener("submit", function(e) {
            e.preventDefault();
            hideError(editPetNameError);
            
            if (!newPetName.value.trim()) {
                showError(editPetNameError, "Please enter a pet name");
                return;
            }
            
            if (!userPet || !userPet.userpet_id) {
                showError(editPetNameError, "No pet found to update");
                return;
            }
            
            const data = {
                pet_name: newPetName.value.trim()
            };
            
            const callback = (status, responseData) => {
                if (status !== 200) {
                    showError(editPetNameError, responseData.message || "Failed to update pet name");
                    return;
                }
                
                editPetNameModal.hide();
                showSuccess("Pet name updated successfully!");
                loadAllUserData(); // Reload all data
            };
            
            fetchMethod(
                currentUrl + "/api/userpet/" + userPet.userpet_id,
                callback,
                "PUT",
                data,
                token
            );
        });
    }

    // Feed pet button
    feedPetBtn.addEventListener("click", function() {
        if (!userPet) {
            showError(errorMsg, "You don't have a pet to feed");
            return;
        }
        
        // Populate food dropdown from inventory
        populateFoodDropdown();
        
        // Set current pet status
        currentHunger.textContent = (userPet.hunger || 100) + "%";
        currentExperience.textContent = (userPet.experience || 0) + " XP";
        currentLevel.textContent = "Level " + (userPet.level_id || 1);
        
        hideError(feedPetError);
        feedPetModal.show();
    });

    // Populate food dropdown from inventory
    function populateFoodDropdown() {
        foodSelect.innerHTML = '<option value="">Choose food from inventory...</option>';
        
        if (!inventoryData || inventoryData.length === 0) {
            foodAvailable.textContent = "No food in inventory";
            foodSelect.disabled = true;
            return;
        }
        
        foodSelect.disabled = false;
        
        for (let i = 0; i < inventoryData.length; i++) {
            const item = inventoryData[i];
            if (item.quantity > 0) {
                const option = document.createElement("option");
                option.value = item.food_id;
                option.textContent = `${item.food_name} (${item.quantity} available)`;
                option.setAttribute("data-hunger", item.hunger_restore);
                option.setAttribute("data-xp", item.xp_gain);
                foodSelect.appendChild(option);
            }
        }
        
        // Update available text
        const hasFood = inventoryData.some(item => item.quantity > 0);
        if (!hasFood) {
            foodAvailable.textContent = "No food available in inventory";
            foodSelect.disabled = true;
        }
    }

    // Food selection changed
    foodSelect.addEventListener("change", function() {
        const foodId = this.value;
        const selectedOption = this.options[this.selectedIndex];
        
        if (foodId && selectedOption) {
            foodPreview.classList.remove("d-none");
            
            const selectedItem = inventoryData.find(item => item.food_id == foodId);
            if (selectedItem) {
                foodAvailable.textContent = `You have: ${selectedItem.quantity} available`;
                
                // Update max quantity
                feedQuantity.max = selectedItem.quantity;
                feedQuantity.value = Math.min(1, selectedItem.quantity);
                
                updateFoodPreview(selectedItem);
            }
        } else {
            foodPreview.classList.add("d-none");
        }
    });

    // Feed quantity changed
    feedQuantity.addEventListener("input", function() {
        const foodId = foodSelect.value;
        const selectedItem = inventoryData.find(item => item.food_id == foodId);
        
        if (selectedItem) {
            updateFoodPreview(selectedItem);
        }
    });

    // Update food preview
    function updateFoodPreview(item) {
        const quantity = parseInt(feedQuantity.value) || 1;
        const totalHunger = (item.hunger_restore || 0) * quantity;
        const totalXP = (item.xp_gain || 0) * quantity;
        
        previewHunger.textContent = totalHunger;
        previewXP.textContent = totalXP;
        previewTotal.textContent = `${totalHunger} hunger, ${totalXP} XP`;
    }

    // Feed pet form
    feedPetForm.addEventListener("submit", function(e) {
        e.preventDefault();
        hideError(feedPetError);
        
        if (!foodSelect.value) {
            showError(feedPetError, "Please select a food item");
            return;
        }
        
        const quantity = parseInt(feedQuantity.value) || 1;
        const selectedItem = inventoryData.find(item => item.food_id == foodSelect.value);
        
        if (!selectedItem) {
            showError(feedPetError, "Selected food item not found");
            return;
        }
        
        if (selectedItem.quantity < quantity) {
            showError(feedPetError, `Not enough food available. You have ${selectedItem.quantity}, trying to feed ${quantity}`);
            return;
        }
        
        if (quantity < 1) {
            showError(feedPetError, "Quantity must be at least 1");
            return;
        }
        
        const data = {
            food_id: parseInt(foodSelect.value),
            quantity: quantity,
            pet_id: userPet.pet_id // Add pet_id for the feed endpoint
        };
        
        const callback = (status, responseData) => {
            console.log("Feed response:", status, responseData);
            if (status !== 200) {
                showError(feedPetError, responseData.message || "Failed to feed pet");
                return;
            }
            
            feedPetModal.hide();
            showSuccess(responseData.message || "Pet fed successfully!");
            
            // Reload all data
            setTimeout(() => {
                loadAllUserData();
            }, 500);
        };
        
        fetchMethod(
            currentUrl + "/api/inventory/pet/feed",
            callback,
            "POST",
            data,
            token
        );
    });

    // Level up pet button
    levelUpPetBtn.addEventListener("click", function() {
        if (!userPet) {
            showError(errorMsg, "You don't have a pet to level up");
            return;
        }
        
        const emoji = getPetEmoji(userPet.species);
        levelUpEmoji.textContent = emoji;
        levelUpPetName.textContent = userPet.pet_name || "Your Pet";
        currentLevelText.textContent = "Level " + (userPet.level_id || 1);
        
        // Check level up requirements
        checkLevelUpRequirements();
        
        hideError(levelUpError);
        levelUpModal.show();
    });

    // Check level up requirements
    function checkLevelUpRequirements() {
        const currentExp = userPet.experience || 0;
        const currentLevelId = userPet.level_id || 1;
        
        currentExpValue.textContent = currentExp + " XP";
        
        // Find next level
        const nextLevel = allLevels.find(level => level.level_id == (currentLevelId + 1));
        
        if (!nextLevel) {
            requiredExpValue.textContent = "MAX";
            expNeeded.textContent = "Max Level Reached";
            confirmLevelUpBtn.disabled = true;
            confirmLevelUpBtn.textContent = "Maximum Level Reached";
            confirmLevelUpBtn.classList.remove("btn-primary");
            confirmLevelUpBtn.classList.add("btn-secondary");
            return;
        }
        
        requiredExpValue.textContent = nextLevel.experience_required + " XP";
        
        const expNeededValue = Math.max(0, nextLevel.experience_required - currentExp);
        expNeeded.textContent = expNeededValue + " XP";
        
        if (currentExp >= nextLevel.experience_required) {
            confirmLevelUpBtn.disabled = false;
            confirmLevelUpBtn.textContent = `⬆️ Level Up to ${nextLevel.level_name}`;
            confirmLevelUpBtn.classList.remove("btn-secondary");
            confirmLevelUpBtn.classList.add("btn-primary");
        } else {
            confirmLevelUpBtn.disabled = true;
            confirmLevelUpBtn.textContent = `Need ${expNeededValue} more XP`;
            confirmLevelUpBtn.classList.remove("btn-primary");
            confirmLevelUpBtn.classList.add("btn-secondary");
        }
    }

    // Confirm level up
    confirmLevelUpBtn.addEventListener("click", function() {
        if (!userPet) return;
        
        const data = {
            pet_id: userPet.pet_id
        };
        
        const callback = (status, responseData) => {
            console.log("Level up response:", status, responseData);
            if (status !== 200) {
                showError(levelUpError, responseData.message || "Failed to level up pet");
                return;
            }
            
            levelUpModal.hide();
            showSuccess(responseData.message || "Pet leveled up successfully!");
            setTimeout(() => {
                loadAllUserData(); // Reload all data
            }, 500);
        };
        
        fetchMethod(
            currentUrl + "/api/level/pet/levelup",
            callback,
            "POST",
            data,
            token
        );
    });

    // Helper functions
    function showError(element, message) {
        if (element) {
            element.textContent = message;
            element.classList.remove("d-none");
            console.error("Error:", message);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                hideError(element);
            }, 5000);
        }
    }
    
    function hideError(element) {
        if (element) {
            element.textContent = "";
            element.classList.add("d-none");
        }
    }
    
    function showSuccess(message) {
        if (successMsg) {
            successMsg.textContent = message;
            successMsg.classList.remove("d-none");
            setTimeout(function() {
                successMsg.classList.add("d-none");
            }, 3000);
        }
    }
});