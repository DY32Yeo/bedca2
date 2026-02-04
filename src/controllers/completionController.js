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
            let updatedPets = [];
            let hasHungryPet = false;
            
            // Check if user has pets and their hunger levels
            if (petResults.length > 0) {
                for (let i = 0; i < petResults.length; i++) {
                    // Check if any pet has 0 hunger
                    if (petResults[i].hunger <= 10) {
                        hasHungryPet = true;
                    }
                }
                
                // If any pet has 0 hunger, block challenge completion
                if (hasHungryPet) {
                    res.status(403).json({
                        message: "Cannot complete challenge. One or more pets have 10 or less hunger. Please feed your pets first."
                    });
                    return;
                }
                
                // Calculate bonus based on pet levels (5% per level)
                let totalBonus = 0;
                for (let i = 0; i < petResults.length; i++) {
                    // Higher level pets give more bonus (5% per level)
                    let petBonus = Math.floor(challenge.points * (petResults[i].level_id * 0.05));
                    totalBonus += petBonus;
                    
                    // Calculate pet XP gain (50% of challenge points)
                    const petXpGain = Math.floor(challenge.points * 0.5);
                    const newExperience = petResults[i].experience + petXpGain;
                    
                    // Decrease pet hunger by 10
                    const newHunger = Math.max(0, petResults[i].hunger - 10);
                    
                    // Store pet update info
                    updatedPets.push({
                        pet_id: petResults[i].pet_id,
                        pet_name: petResults[i].pet_name,
                        hunger: newHunger,
                        level_id: petResults[i].level_id,
                        experience: newExperience,
                        bonus_given: petBonus,
                        xp_gained: petXpGain
                    });
                    
                    // Update pet hunger and experience in database
                    userpetModel.updateStatsById({
                        userpet_id: petResults[i].userpet_id,
                        experience: newExperience,
                        hunger: newHunger
                    }, (hungerError) => {
                        if (hungerError) {
                            console.error("Error updating pet stats:", hungerError);
                        }
                    });
                }
                
                bonusPoints = totalBonus;
                pointsEarned += totalBonus;
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
                        pets_updated: updatedPets,
                        message: petResults.length > 0 
                            ? `Challenge completed! Earned ${pointsEarned} points (${challenge.points} base + ${bonusPoints} pet bonus). Pet hunger decreased by 10 and gained XP.` 
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