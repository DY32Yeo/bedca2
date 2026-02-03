const inventoryModel = require("../models/inventoryModel.js");
const userModel = require("../models/userModel.js");
const userpetModel = require("../models/userpetModel.js");


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
    const userpet = req.userpet;
    const food = req.food;

    const data = {
        user_id: req.user.user_id,
        userpet_id: req.params.userpet_id,
        food_id: food.food_id,
        quantity: req.body.quantity || 1
    }

    // Check if user has this food in inventory
    // First, check inventory
    inventoryModel.checkUserHasFood({
        user_id: data.user_id,
        food_id: data.food_id
    }, (error, inventoryResults) => {
        if (error) {
            console.error("Error checkUserHasFood:", error);
            res.status(500).json(error);
            return;
        }

        if (inventoryResults.length == 0 || inventoryResults[0].quantity < data.quantity) {
            res.status(400).json({ 
                message: "Not enough of this food in your inventory" 
            });
            return;
        }

        const totalHungerRestore = food.hunger_restore * data.quantity;
        const totalXpGain = food.xp_gain * data.quantity;

        const newHunger = Math.min(100, userpet.hunger + totalHungerRestore);
        const newExperience = userpet.experience + totalXpGain;

        const updatePetData = {
            userpet_id: data.userpet_id,
            experience: newExperience,
            hunger: newHunger
        };

        // Used to update pet stats after food is used
        const updateCallback = (error, results, fields) => {
            if (error) {
                console.error("Error useFromInventory:", error);
                res.status(500).json(error);
                return;
            } 
            
            // Clean up inventory (remove items with 0 quantity)
            inventoryModel.cleanupInventory({ user_id: data.user_id }, (error) => {
                if (error) {
                    console.error("Error cleanupInventory:", error);
                }
            });

            // Update pet stats
            userpetModel.updateStatsById(updatePetData, callback);
        }
        
        const callback = (error, results, fields) => {
            if (error) {
                console.error("Error updateStatsById:", error);
                res.status(500).json(error);
            } 
            else 
            {
                res.status(200).json({
                    message: "Pet fed successfully!",
                    pet_name: userpet.pet_name,
                    food_used: food.food_name,
                    quantity_used: data.quantity,
                    hunger_restored: totalHungerRestore,
                    xp_gained: totalXpGain,
                    new_hunger: newHunger,
                    new_experience: newExperience
                });
            }
        } 
           
        // Start the transaction by using food from inventory
        inventoryModel.useFromInventory(data, updateCallback);
    }); 
}