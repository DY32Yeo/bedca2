// challenge.js
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
    const loginHint = document.getElementById("loginHint");
    const createBtn = document.getElementById("createBtn");
    const challengesContainer = document.getElementById("challengesContainer");
    const errorMsg = document.getElementById("errorMsg");
    const successMsg = document.getElementById("successMsg");
    
    // Stats elements
    const totalCompleted = document.getElementById("totalCompleted");
    const totalPoints = document.getElementById("totalPoints");
    const createdChallenges = document.getElementById("createdChallenges");
    
    // Modals
    const createModal = new bootstrap.Modal(document.getElementById('createModal'));
    const completeModal = new bootstrap.Modal(document.getElementById('completeModal'));
    const manageModal = new bootstrap.Modal(document.getElementById('manageModal'));
    
    // Forms
    const createForm = document.getElementById("createForm");
    const completeForm = document.getElementById("completeForm");
    const manageForm = document.getElementById("manageForm");
    
    // Form inputs
    const descriptionInput = document.getElementById("description");
    const pointsInput = document.getElementById("points");
    const detailsInput = document.getElementById("details");
    const editDescriptionInput = document.getElementById("editDescription");
    const editPointsInput = document.getElementById("editPoints");
    const challengeText = document.getElementById("challengeText");
    const challengePoints = document.getElementById("challengePoints");
    const deleteBtn = document.getElementById("deleteBtn");
    
    // Error divs
    const createError = document.getElementById("createError");
    const completeError = document.getElementById("completeError");
    const manageError = document.getElementById("manageError");

    let currentChallengeId = null;
    let userCompletions = {};
    let allChallenges = [];
    let userTotalPoints = 0;

    // Check if user is logged in
    if (!token) {
        loginHint.classList.remove("d-none");
        createBtn.disabled = true;
        createBtn.classList.add("disabled");
        // Load challenges without user data
        loadAllChallenges();
    } else {
        // Load user data and challenges
        loadUserData();
    }

    // Load user data
    function loadUserData() {
        // 1. First get user's total points
        const userPointsCallback = (status, data) => {
            if (status === 200) {
                userTotalPoints = data.points || 0;
                totalPoints.textContent = userTotalPoints;
                
                // Now load user completions
                loadUserCompletions();
            } else {
                loadUserCompletions();
            }
        };
        
        fetchMethod(currentUrl + "/api/users/" + userId, userPointsCallback, "GET", null, token);
    }

    // Load user's completion counts
    function loadUserCompletions() {
        const callback = (status, data) => {
            if (status === 200) {
                userCompletions = {};
                let totalChallengesCompleted = 0;
                
                for (let i = 0; i < data.length; i++) {
                    const challengeId = data[i].challenge_id;
                    const completionCount = data[i].completion_count || 1;
                    userCompletions[challengeId] = completionCount;
                    totalChallengesCompleted += completionCount;
                }
                
                totalCompleted.textContent = totalChallengesCompleted;
            }
            
            // Now load all challenges
            loadAllChallenges();
        };
        
        fetchMethod(currentUrl + "/api/completion/user", callback, "GET", null, token);
    }

    // Load all challenges
    function loadAllChallenges() {
        const callback = (status, data) => {
            if (status !== 200) {
                showError(errorMsg, data.message || "Failed to load challenges");
                return;
            }
            
            allChallenges = data;
            
            // Count user's created challenges
            if (userId) {
                const userCreated = data.filter(c => c.creator_id == userId).length;
                createdChallenges.textContent = userCreated;
            }
            
            displayChallenges();
        };
        
        fetchMethod(currentUrl + "/api/challenges", callback, "GET");
    }

    // Display challenges on page
    function displayChallenges() {
        challengesContainer.innerHTML = "";
        
        for (let i = 0; i < allChallenges.length; i++) {
            const challenge = allChallenges[i];
            const completionCount = userCompletions[challenge.challenge_id] || 0;
            const isCreator = userId == challenge.creator_id;
            
            const col = document.createElement("div");
            col.className = "col-md-6 col-lg-4 mb-4";
            
            col.innerHTML = `
                <div class="card h-100 text-center ${completionCount > 0 ? 'border-success border-2' : ''}">
                    <div class="card-body d-flex flex-column">
                        <div class="display-4 text-primary mb-3">🎯</div>
                        <h5 class="card-title fw-bold">Challenge #${challenge.challenge_id}</h5>
                        <p class="card-text flex-grow-1">${challenge.description}</p>
                        
                        <div class="mb-3">
                            <span class="badge bg-primary fs-6">${challenge.points} points</span>
                            ${completionCount > 0 ? 
                                `<span class="badge bg-success fs-6 ms-2">${completionCount}x</span>` : ''
                            }
                        </div>
                        
                        ${completionCount > 0 ? 
                            `<div class="alert alert-success py-2 mb-3">
                                <small>Completed ${completionCount} time(s)</small>
                            </div>` : 
                            '<div class="mb-4"></div>'
                        }
                        
                        <div class="mt-auto">
                            ${isCreator ? 
                                `<button class="btn btn-outline-warning w-100 manage-challenge" data-id="${challenge.challenge_id}">
                                    Manage Challenge
                                </button>` : 
                                `<button class="btn ${completionCount > 0 ? 'btn-success' : 'btn-primary'} w-100 complete-challenge" 
                                    data-id="${challenge.challenge_id}" 
                                    ${!token ? 'disabled' : ''}>
                                    ${completionCount > 0 ? '✅ Complete Again' : 'Complete Challenge'}
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            `;
            
            challengesContainer.appendChild(col);
        }
        
        // Add event listeners to buttons
        document.querySelectorAll('.complete-challenge').forEach(button => {
            button.addEventListener('click', function() {
                const challengeId = this.getAttribute('data-id');
                openCompleteModal(challengeId);
            });
        });
        
        document.querySelectorAll('.manage-challenge').forEach(button => {
            button.addEventListener('click', function() {
                const challengeId = this.getAttribute('data-id');
                openManageModal(challengeId);
            });
        });
    }

    // Open complete modal
    function openCompleteModal(challengeId) {
        currentChallengeId = challengeId;
        
        // Find the challenge
        const challenge = allChallenges.find(c => c.challenge_id == challengeId);
        if (!challenge) return;
        
        // Check if user is trying to complete their own challenge
        if (challenge.creator_id == userId) {
            showError(completeError, "You cannot complete your own challenge");
            completeModal.show();
            return;
        }
        
        challengeText.textContent = challenge.description;
        challengePoints.textContent = challenge.points + " points";
        
        detailsInput.value = "";
        hideError(completeError);
        
        completeModal.show();
        detailsInput.focus();
    }

    // Open manage modal
    function openManageModal(challengeId) {
        currentChallengeId = challengeId;
        
        const challenge = allChallenges.find(c => c.challenge_id == challengeId);
        if (!challenge) return;
        
        editDescriptionInput.value = challenge.description;
        editPointsInput.value = challenge.points;
        hideError(manageError);
        
        manageModal.show();
    }

    // Show create modal
    createBtn.addEventListener("click", function() {
        if (!token) {
            showError(errorMsg, "Please login to create challenges");
            return;
        }
        
        descriptionInput.value = "";
        pointsInput.value = "20";
        hideError(createError);
        createModal.show();
    });

    // Create challenge form
    createForm.addEventListener("submit", function(e) {
        e.preventDefault();
        hideError(createError);
        
        if (!token) {
            showError(createError, "Please login first");
            return;
        }
        
        const data = {
            description: descriptionInput.value,
            points: pointsInput.value ? parseInt(pointsInput.value) : undefined
        };
        
        const callback = (status, responseData) => {
            if (status !== 201) {
                showError(createError, responseData.message || "Failed to create challenge");
                return;
            }
            
            createModal.hide();
            showSuccess("Challenge created successfully!");
            createForm.reset();
            loadAllChallenges();
        };
        
        fetchMethod(currentUrl + "/api/challenges", callback, "POST", data, token);
    });

    // Complete challenge form
    completeForm.addEventListener("submit", function(e) {
        e.preventDefault();
        hideError(completeError);
        
        if (!token || !currentChallengeId) {
            showError(completeError, "Please login first");
            return;
        }
        
        if (!detailsInput.value.trim()) {
            showError(completeError, "Please provide details");
            return;
        }
        
        const data = {
            details: detailsInput.value
        };
        
        const callback = (status, responseData) => {
            if (status !== 201) {
                showError(completeError, responseData.message || responseData.error || "Failed to complete challenge");
                return;
            }
            
            // Show success message with points from backend
            const pointsEarned = responseData.total_points_earned || 0;
            const bonusPoints = responseData.bonus_points || 0;

            let basePoints = responseData.points_earned;
            if(!basePoints) {
                const current = allChallenges.find((c => c.challenge_id == currentChallengeId));
                basePoints = current ? current.points : 0;
            }
            
            let successMessage = `✅ Challenge completed! You earned ${pointsEarned} points`;
            if (bonusPoints > 0) {
                successMessage += ` (${basePoints} base + ${bonusPoints} bonus)`;
            }
            
            showSuccess(successMessage);
            completeModal.hide();
            detailsInput.value = "";
            
            // IMPORTANT: Reload user data to get updated points
            setTimeout(() => {
                loadUserData();
            }, 500);
        };
        
        fetchMethod(
            currentUrl + "/api/completion/challenges/" + currentChallengeId,
            callback,
            "POST",
            data,
            token
        );
    });

    // Manage challenge form
    manageForm.addEventListener("submit", function(e) {
        e.preventDefault();
        hideError(manageError);
        
        if (!token || !currentChallengeId) {
            showError(manageError, "Please login first");
            return;
        }
        
        const data = {
            description: editDescriptionInput.value,
            points: parseInt(editPointsInput.value)
        };
        
        const callback = (status, responseData) => {
            if (status !== 200) {
                showError(manageError, responseData.message || "Failed to update challenge");
                return;
            }
            
            manageModal.hide();
            showSuccess("Challenge updated successfully!");
            loadAllChallenges();
        };
        
        fetchMethod(
            currentUrl + "/api/challenges/" + currentChallengeId,
            callback,
            "PUT",
            data,
            token
        );
    });

    // Delete challenge
    deleteBtn.addEventListener("click", function() {
        if (!token || !currentChallengeId) return;
        
        if (!confirm("Are you sure you want to delete this challenge? This cannot be undone.")) {
            return;
        }
        
        const callback = (status, responseData) => {
            if (status !== 204) {
                showError(manageError, responseData.message || "Failed to delete challenge");
                return;
            }
            
            manageModal.hide();
            showSuccess("Challenge deleted successfully!");
            loadAllChallenges();
        };
        
        fetchMethod(
            currentUrl + "/api/challenges/" + currentChallengeId,
            callback,
            "DELETE",
            null,
            token
        );
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