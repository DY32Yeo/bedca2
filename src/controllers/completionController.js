const completionModel = require("../models/completionModel.js");
const userModel = require('../models/userModel.js');
const userpetModel = require('../models/userpetModel.js');

module.exports.createNewCompletion = (req, res, next) =>
{
    const user = req.user;
    const challenge = req.challenge;

    const data = {
        challenge_id: req.params.challenge_id,
        user_id: user.user_id,
        details: req.body.details
    }

    // Check if user has pets first
    userpetModel.selectById({ user_id: user.user_id }, (error, petResults) => {
        if (error) {
            console.error("Error checking user pets:", error);
            res.status(500).json(error);
            return;
        }

        let pointsEarned = challenge.points;
        let loyaltyBonus = 0;
        let levelMultiplierBonus = 0;
        let updatedPets = [];
        
        // Add loyalty bonus and level multiplier if user has pets
        if (petResults.length > 0) {
            loyaltyBonus = Math.floor(challenge.points * 0.1); // 10% base loyalty bonus
            
            // Calculate level multiplier bonus based on pet levels
            let totalPetLevel = 0;
            petResults.forEach(pet => {
                totalPetLevel += pet.level_id;
            });
            
            // Higher level pets give more bonus (5% per level above 1)
            levelMultiplierBonus = Math.floor(challenge.points * ((totalPetLevel - petResults.length) * 0.05));
            if (levelMultiplierBonus < 0) levelMultiplierBonus = 0;
            
            pointsEarned += loyaltyBonus + levelMultiplierBonus;
        }

        // Used for updating user points with all bonuses
        const updateUserData = {
            user_id: user.user_id,
            points: user.points + pointsEarned
        };

        // Update user points after challenge completion
        const updateUserCallback = (error, results, fields) => {
            if (error) {
                console.error("Error updatePointsById:", error);
                res.status(500).json(error);
                return;
            } 
            
            // If user has pets, update their hunger
            if (petResults.length > 0) {
                let petsUpdated = 0;
                
                petResults.forEach((pet) => {
                    const newHunger = Math.max(0, pet.hunger - 10); // Decrease hunger by 10
                    
                    userpetModel.updateStatsById({
                        userpet_id: pet.userpet_id,
                        experience: pet.experience,
                        hunger: newHunger
                    }, (petError) => {
                        if (petError) {
                            console.error("Error updating pet hunger:", petError);
                        }
                        
                        // Store updated pet info for response
                        updatedPets.push({
                            pet_name: pet.pet_name,
                            pet_id: pet.pet_id,
                            level_id: pet.level_id,
                            old_hunger: pet.hunger,
                            new_hunger: newHunger
                        });
                        
                        petsUpdated++;
                        
                        // When all pets are updated, insert completion record
                        if (petsUpdated === petResults.length) {
                            completionModel.insertCompletion(data, insertCompletionCallback);
                        }
                    });
                });
            } else {
                // User has no pets, just insert completion record directly
                completionModel.insertCompletion(data, insertCompletionCallback);
            }
        }
        
        const insertCompletionCallback = (error, results, fields) => {
            if (error) {
                console.error("Error createNewCompletion:", error);
                res.status(500).json(error);
            } 
            else 
            {
                const response = {
                    complete_id: results.insertId,
                    challenge_id: data.challenge_id,
                    user_id: data.user_id,
                    details: data.details,
                    challenge_points: challenge.points,
                    loyalty_bonus: loyaltyBonus,
                    level_multiplier_bonus: levelMultiplierBonus,
                    total_points_earned: pointsEarned,
                    user_total_points: updateUserData.points
                };
                
                // Add pets info if user has pets
                if (updatedPets.length > 0) {
                    response.pets_updated = updatedPets;
                }
                
                res.status(201).json(response);
            }
        } 
           
        // Start the transaction by updating user points
        userModel.updatePointsById(updateUserData, updateUserCallback);
    });
}

module.exports.readAllChallengeById = (req, res, next) =>
{
    const data = {
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllChallengeById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "challenge_id does not have any user attempts"
                });
            }
            else res.status(200).json(results);
        }
    }

    completionModel.getAttemptById(data, callback);
}