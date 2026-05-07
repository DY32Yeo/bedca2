// loading food from backend
// loading user points
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    let userId = null;
    let userPoints = 0; // user points
    let userPet = null; // store user pet
    let currentPetToAdopt = null; // store pet that is adopted

    // DOM Elements
    const loginHint = document.getElementById("loginHint");
    const errorMsg = document.getElementById("errorMsg");
    const successMsg = document.getElementById("successMsg");
    const pointsTracker = document.getElementById("pointsTracker");
    const userPointsEl = document.getElementById("userPoints");
    const petsContainer = document.getElementById("petsContainer");

    // Modal Elements
    const adoptModal = new bootstrap.Modal(document.getElementById('adoptModal'));
    const modalPetEmoji = document.getElementById("modalPetEmoji");
    const modalPetSpecies = document.getElementById("modalPetSpecies");
    const modalPetCost = document.getElementById("modalPetCost");
    const petNameInput = document.getElementById("petNameInput");
    const adoptError = document.getElementById("adoptError");

    // Pet emoji mapping
    const petEmojis = {
        'Dog': '🐕',
        'Cat': '🐈',
        'Deer': '🦌',
        'Otter': '🦦',
        'Squirrel': '🐿️',
        'Hamster': '🐹',
        'Parrot': '🦜',
        'Seal': '🦭',
        'Alpaca': '🦙'
    };

    // Check login and load data
    if (token) {
        const payload = token.split('.')[1];
        userId = JSON.parse(atob(payload)).userId;
        // load user points
        loadUserData();
        // load user current pets
        loadUserPet();
        pointsTracker.classList.remove("d-none");
    } else {
        // show login hint
        loginHint.classList.remove("d-none");
        // hide points tracker
        pointsTracker.classList.add("d-none");
    }

    // Always load pets (for both logged in and not logged in users)
    loadPets();

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

    // Load user's pet (to check if they already have one)
    function loadUserPet() {
        // exit if no userid
        if (!userId) return;
        
        fetchMethod(currentUrl + "/api/userpet/" + userId, (status, data) => {
            if (status === 200 && data.length > 0) {
                // store user pet so only 1 user 1 pet
                userPet = data[0];
            } else {
                userPet = null;
            }
            // Refresh pet display after loading user pet info
            loadPets();
        }, "GET", null, token);
    }

    // Load all pets
    function loadPets() {
        fetchMethod(currentUrl + "/api/pet", (status, data) => {
            if (status !== 200) {
                showError("Failed to load pets");
                return;
            }
            displayPets(data);
        }, "GET");
    }

    // Display pets similar to challenges.js and food.js
    function displayPets(pets) {
        // clear container before adding content
        petsContainer.innerHTML = "";
        
        // loops thru each pet in the array
        pets.forEach(pet => {
            const col = document.createElement("div");
            col.className = "col-md-6 col-lg-4 mb-4";
            
            // Get emoji for this pet
            const emoji = petEmojis[pet.species] || '🐾';
            // check if pet is owned by user
            const isUsersPet = userPet && userPet.pet_id == pet.pet_id;
            // check if user can afford to adopt the pet
            const canAfford = userPoints >= pet.adopt_cost;
            
            // html card for pet
            col.innerHTML = `
                <div class="card h-100 text-center ${isUsersPet ? 'border-success border-2' : ''}">
                    <div class="card-body d-flex flex-column">
                    <!-- emoji -->
                        <div class="display-4 text-primary mb-3">${emoji}</div>
                        <!-- pet species -->
                        <h5 class="card-title fw-bold">${pet.species}</h5>
                        <!-- adoption cost -->
                        <p class="card-text flex-grow-1">Adoption cost: ${pet.adopt_cost} points</p>
                        
                        ${isUsersPet ? 
                            `<div class="alert alert-success py-2 mb-3">
                                <small>Your companion</small>
                            </div>` : 
                            '<div class="mb-4"></div>'
                        }
                        
                        <div class="mt-auto">
                            ${isUsersPet ? 
                                `<button class="btn btn-success w-100" disabled>
                                    ✅ Your Pet
                                </button>` : 
                                !token ? 
                                `<button class="btn btn-outline-primary w-100" disabled>
                                    Login to Adopt
                                </button>` :
                                userPet ? // if user have pet
                                `<button class="btn btn-secondary w-100" disabled>
                                    Already Have Pet
                                </button>` :
                                !canAfford ? // if cant afford
                                `<button class="btn btn-secondary w-100" disabled>
                                    Need ${pet.adopt_cost} points (you have ${userPoints})
                                </button>` :
                                `<button class="btn btn-primary w-100 adopt-pet" 
                                    data-id="${pet.pet_id}" 
                                    data-cost="${pet.adopt_cost}"
                                    data-species="${pet.species}">
                                    Adopt for ${pet.adopt_cost} points
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            `;
            // add column to container
            petsContainer.appendChild(col);
    });
    
        // Add event listeners to adopt buttons
        document.querySelectorAll('.adopt-pet').forEach(button => {
            button.addEventListener('click', function() {
                // get pet id 
                const petId = this.getAttribute('data-id');
                // get cost
                const cost = parseInt(this.getAttribute('data-cost'));
                // get species
                const species = this.getAttribute('data-species');
                // open adoption modal
                openAdoptModal(petId, cost, species);
            });
        });
    }

    // Open adopt modal
    function openAdoptModal(petId, cost, species) {
        // store current pet info
        currentPetToAdopt = { id: petId, cost: cost, species: species };
        
        // Check if user already has a pet
        if (userPet) {
            showAdoptError("You already have a pet. Only one pet per user.");
            adoptModal.show(); // shows modal but with error
            return;
        }
        
        // Check if user has enough points
        if (userPoints < cost) {
            showAdoptError(`You need ${cost} points but only have ${userPoints} points`);
            adoptModal.show();
            return;
        }
        
        // Set modal content
        modalPetEmoji.textContent = petEmojis[species] || '🐾';
        modalPetSpecies.textContent = species;
        modalPetCost.textContent = cost;
        // clears pet name input
        petNameInput.value = "";
        // hides error
        hideAdoptError();
        // shows modal
        adoptModal.show();
        petNameInput.focus();
    }

    // Adopt form submit
    document.getElementById("adoptForm").addEventListener("submit", function(e) {
        e.preventDefault();
        // hide any previous erros
        hideAdoptError();
        
        // checks if user is logged in  
        if (!token || !currentPetToAdopt) {
            showAdoptError("Please login first");
            return;
        }
        
        // check if pet name is provided
        if (!petNameInput.value.trim()) {
            showAdoptError("Please give your pet a name");
            return;
        }
        
        const data = {
            pet_id: parseInt(currentPetToAdopt.id),
            pet_name: petNameInput.value
        };
        
        const callback = (status, response) => {
            if (status !== 201) {
                showAdoptError(response.message || "Failed to adopt pet");
                return;
            }
            
            // hides modal when successful
            adoptModal.hide();
            showSuccess(`Congratulations! You adopted ${petNameInput.value}!`);
            
            // Refresh data
            loadUserData();
            loadUserPet();
        };
        
        fetchMethod(currentUrl + "/api/userpet/adopt", callback, "POST", data, token);
    });

    // Helper functions for modal errors
    function showAdoptError(message) {
        adoptError.textContent = message;
        adoptError.classList.remove("d-none");
    }
    
    function hideAdoptError() {
        adoptError.textContent = "";
        adoptError.classList.add("d-none");
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
