const inventoryModel = require("../models/inventoryModel.js");
const userModel = require("../models/userModel.js");
const userpetModel = require("../models/userpetModel.js");
const levelModel = require("../models/levelModel.js");


module.exports.getUserInventory = (req, res, next) =>
{

    const data = {
        user_id: req.user.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getUserInventory:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    }

    inventoryModel.selectValidUserInventory(data, callback);
}

module.exports.buyFood = (req, res, next) =>
{
    const user = req.user;
    const food = req.food;

    const data = {
        user_id: req.user.user_id,
        food_id: req.body.food_id,
        quantity: req.body.quantity || 1
    }

    const totalCost = food.cost * data.quantity

    // Add validation for insufficient points
    if (user.points < totalCost) {
        return res.status(403).json({
            message: "Not enough points to buy this food"
        });
    }
    
    // Used for updating user points
    const updateUserData = {
        user_id: data.user_id,
        points: user.points - totalCost
    }

    // Used to update inventory after user points are updated
    const updateCallback = (error, results, fields) => {
        if (error) {
            console.error("Error updatePointsById:", error);
            res.status(500).json(error);
            return;
        } 
        
        // Check if user already has this food in inventory
        inventoryModel.checkUserHasFood(data, (error, inventoryResults) => {
            if (error) {
                console.error("Error checkUserHasFood:", error);
                res.status(500).json(error);
                return;
            }

            if (inventoryResults.length > 0) {
                inventoryModel.updateInventoryQuantity(data, callback);
            } else {
                inventoryModel.addToInventory(data, callback);
            }
        });
    }
    
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error inventory operation:", error);
            res.status(500).json(error);
        } 
        else 
        {
            res.status(200).json({
                message: "Food purchased successfully",
                food_name: food.food_name,
                quantity: data.quantity,
                cost: totalCost,
                remaining_points: updateUserData.points
            });
        }
    } 
       
    // Start the transaction by updating user points
    userModel.updatePointsById(updateUserData, updateCallback);

}

module.exports.feedPet = (req, res, next) =>
{
    const user = req.user;
    const pet = req.pet;
    const food = req.food;
    
    const feedQuantity = req.body.quantity || 1;

    // Check food in inventory
    inventoryModel.checkUserHasFood({
        user_id: user.user_id,
        food_id: food.food_id
    }, (error, inventoryResults) => {
        if (error) {
            console.error("Error checkUserHasFood:", error);
            res.status(500).json(error);
            return;
        }

        if (inventoryResults.length == 0) {
            res.status(400).json({ 
                message: "No food in inventory" 
            });
            return;
        }

        const inventoryItem = inventoryResults[0];
        
        if (inventoryItem.quantity < feedQuantity) {
            res.status(400).json({ 
                message: `Not enough food. You have ${inventoryItem.quantity} ${food.food_name}, but trying to feed ${feedQuantity}` 
            });
            return;
        }

        // Calculate total hunger restore and XP gain based on quantity
        const totalHungerRestore = food.hunger_restore * feedQuantity;
        const totalXpGain = food.xp_gain * feedQuantity;
        
        const newHunger = Math.min(100, pet.hunger + totalHungerRestore);
        const newExperience = pet.experience + totalXpGain;

        // Use food
        inventoryModel.useFromInventory({
            user_id: user.user_id,
            food_id: food.food_id,
            quantity: feedQuantity
        }, (inventoryError) => {
            if (inventoryError) {
                console.error("Error useFromInventory:", inventoryError);
                res.status(500).json(inventoryError);
                return;
            }

            // Check if quantity becomes 0 or negative after use
            const newQuantity = inventoryItem.quantity - feedQuantity;
            if (newQuantity <= 0) {
                // Remove the inventory item if quantity is 0 or less
                inventoryModel.cleanupInventory({ user_id: user.user_id }, (cleanupError) => {
                    if (cleanupError) {
                        console.error("Error cleanupInventory:", cleanupError);
                        // Don't fail the request, just log
                    }
                });
            }

            // Check if pet should level up
            levelModel.selectNextLevel({ experience: newExperience }, (levelError, levelResults) => {
                if (levelError) {
                    console.error("Error selectNextLevel:", levelError);
                    res.status(500).json(levelError);
                    return;
                }

                let levelUpMessage = "";
                let newLevelId = pet.level_id;
                
                // If pet can level up
                if (levelResults.length > 0 && newExperience >= levelResults[0].experience_required) {
                    newLevelId = levelResults[0].level_id;
                    levelUpMessage = ` Leveled up to ${levelResults[0].level_name}!`;
                }

                // Update pet stats and level
                userpetModel.updateStatsById({
                    userpet_id: pet.userpet_id,
                    experience: newExperience,
                    hunger: newHunger
                }, (petError) => {
                    if (petError) {
                        console.error("Error updateStatsById:", petError);
                        res.status(500).json(petError);
                        return;
                    }

                    // If level changed, update level
                    if (newLevelId !== pet.level_id) {
                        userpetModel.updateLevelById({
                            userpet_id: pet.userpet_id,
                            level_id: newLevelId
                        }, (levelUpdateError) => {
                            if (levelUpdateError) {
                                console.error("Error updateLevelById:", levelUpdateError);
                                // Don't fail the request, just log the error
                            }
                            
                            // Get level name for response
                            levelModel.selectAll((error, allLevels) => {
                                const levelName = allLevels.find(l => l.level_id === newLevelId)?.level_name || `Level ${newLevelId}`;
                                
                                res.status(200).json({
                                    message: `Pet fed ${feedQuantity} ${food.food_name}!` + levelUpMessage,
                                    pet: pet.pet_name,
                                    hunger: newHunger,
                                    hunger_restored: totalHungerRestore,
                                    xp: newExperience,
                                    xp_gained: totalXpGain,
                                    level_id: newLevelId,
                                    level_name: levelName,
                                    quantity_used: feedQuantity,
                                    remaining_quantity: Math.max(0, newQuantity)
                                });
                            });
                        });
                    } else {
                        res.status(200).json({
                            message: `Pet fed ${feedQuantity} ${food.food_name}!` + levelUpMessage,
                            pet: pet.pet_name,
                            hunger: newHunger,
                            hunger_restored: totalHungerRestore,
                            xp: newExperience,
                            xp_gained: totalXpGain,
                            level_id: newLevelId,
                            quantity_used: feedQuantity,
                            remaining_quantity: Math.max(0, newQuantity)
                        });
                    }
                });
            });
        });
    });
}

