const completionModel = require("../models/completionModel.js");
const userModel = require('../models/userModel.js');
const userpetModel = require('../models/userpetModel.js');

module.exports.createNewCompletion = (req, res, next) => 
{
    const challenge = req.challenge;
    
    // From JWT token (already verified)
    const user_id = res.locals.userId;
    
    if(req.body.details == undefined) {
        res.status(400).json({
            message: "Error: missing details"
        });
        return;
    }

    // Get user info
    userModel.selectById({ user_id: user_id }, (error, userResults) => {
        if (error) {
            console.error("Error selectById:", error);
            res.status(500).json(error);
            return;
        }

        if (userResults.length == 0) {
            res.status(404).json({
                message: "user_id does not exist"
            });
            return;
        }

        const user = userResults[0];

        // Check user pets
        userpetModel.selectById({ user_id: user_id }, (petError, petResults) => {
            if (petError) {
                console.error("Error checking pets:", petError);
                res.status(500).json(petError);
                return;
            }

            let pointsEarned = challenge.points;
            let bonusPoints = 0;
            let petUpdated; 
            let hasHungryPet = false;
            let petXpGain = 0;
            
            // Check if user has pets and their hunger levels
            if (petResults.length > 0) {
                const pet = petResults[0]; // only 1 pet 
                
                if (pet.hunger <= 10) {
                    hasHungryPet = true;
                }
                // If any pet has 0 hunger, block challenge completion
                if (hasHungryPet) {
                    res.status(403).json({
                        message: "Cannot complete challenge. Your pet have 10 or less hunger. Please feed your pets first."
                    });
                    return;
                }
                
                // Calculate bonus based on pet levels (10% per level)
                bonusPoints = Math.floor(challenge.points * (pet.level_id * 0.1));
                pointsEarned += bonusPoints;

                // Calculate pet XP gain (50% of challenge points)
                const petXpGain = Math.floor(challenge.points * 0.5);
                const newExperience = pet.experience + petXpGain;

                // Decrease pet hunger by 10
                const newHunger = Math.max(0, pet.hunger - 10);

                    
                // Store pet update info
                petUpdated = {
                    pet_id: pet.pet_id,
                    pet_name: pet.pet_name,
                    hunger: newHunger,
                    level_id: pet.level_id,
                    experience: newExperience,
                    bonus_given: bonusPoints,
                    xp_gained: petXpGain
                }
                    
                // Update pet hunger and experience in database
                userpetModel.updateStatsById({
                    userpet_id: pet.userpet_id,
                    experience: newExperience,
                    hunger: newHunger
                }, (hungerError) => {
                    if (hungerError) {
                        console.error("Error updating pet stats:", hungerError);
                    }
                });
            }

            // Update user points
            const newPoints = user.points + pointsEarned;
            
            userModel.updatePointsById({
                user_id: user_id,
                points: newPoints
            }, (pointsError) => {
                if (pointsError) {
                    console.error("Error updatePointsById:", pointsError);
                    res.status(500).json(pointsError);
                    return;
                }

                const data = {
                    challenge_id: req.params.challenge_id,
                    user_id: user_id,
                    details: req.body.details
                }

                // Save completion
                completionModel.insertCompletion(data, (completionError, results) => {
                    if (completionError) {
                        console.error("Error insertCompletion:", completionError);
                        res.status(500).json(completionError);
                        return;
                    }

                    res.status(201).json({
                        complete_id: results.insertId,
                        challenge_id: data.challenge_id,
                        user_id: data.user_id,
                        details: data.details,
                        points_earned: challenge.points,
                        bonus_points: bonusPoints,
                        total_points_earned: pointsEarned,
                        new_total_points: newPoints,
                        pets_updated: petUpdated,
                        message: petResults.length > 0 
                            ? `Challenge completed! Earned ${pointsEarned} points (${challenge.points} base + ${bonusPoints} pet bonus). Pet hunger decreased by 10 and gained ${petXpGain} XP.` 
                            : `Challenge completed! Earned ${pointsEarned} points.`
                    });
                });
            });
        });
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

module.exports.getUserCompletions = (req, res, next) =>
{   
    const user_id = res.locals.userId;

    const data = {
        user_id: user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getUserCompletions:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    }

    completionModel.getCompletionById(data, callback);
}