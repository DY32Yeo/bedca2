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

    inventoryModel.selectUserInventory(data, callback);
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

        if (inventoryResults[0].quantity < (req.body.quantity || 1)) {
            res.status(400).json({ 
                message: "Not enough food" 
            });
            return;
        }

        const newHunger = Math.min(100, pet.hunger + food.hunger_restore);
        const newExperience = pet.experience + food.xp_gain;

        // Use food
        inventoryModel.useFromInventory({
            user_id: user.user_id,
            food_id: food.food_id,
            quantity: req.body.quantity || 1
        }, (inventoryError) => {
            if (inventoryError) {
                console.error("Error useFromInventory:", inventoryError);
                res.status(500).json(inventoryError);
                return;
            }

            // Update pet
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

                res.status(200).json({
                    message: "Pet fed!",
                    pet: pet.pet_name,
                    hunger: newHunger,
                    xp: newExperience
                });
            });
        });
    });
}

module.exports.levelUpPet = (req, res, next) =>
{
    const pet = req.pet;

    // Check next level
    levelModel.selectNextLevel({ experience: pet.experience }, (error, results) => {
        if (error) {
            console.error("Error selectNextLevel:", error);
            res.status(500).json(error);
            return;
        }

        if (results.length == 0) {
            res.status(400).json({
                message: "Max level reached"
            });
            return;
        }

        const nextLevel = results[0];
        
        // Level up pet
        userpetModel.updateLevelById({
            userpet_id: pet.userpet_id,
            level_id: nextLevel.level_id
        }, (updateError) => {
            if (updateError) {
                console.error("Error updateLevelById:", updateError);
                res.status(500).json(updateError);
                return;
            }

            res.status(200).json({
                message: "Level up!",
                pet: pet.pet_name,
                level: nextLevel.level_name
            });
        });
    });
}