const levelModel = require("../models/levelModel.js");
const userpetModel = require("../models/userpetModel.js");

module.exports.readAllLevel = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllLevel:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    levelModel.selectAll(callback);
}

module.exports.levelUpPet = (req, res, next) =>
{
    const pet = req.pet;

    // Check next level
    levelModel.selectLevelByExperience({ experience: pet.experience }, (error, results) => {
        if (error) {
            console.error("Error selectLevelByExperience:", error);
            res.status(500).json(error);
            return;
        }

        if (results.length == 0) {
            res.status(400).json({
                message: "Unable to level up pet"
            });
            return;
        }

        const nextLevel = results[0];

        // Check if pet is already at or above this level
        if (pet.level_id >= nextLevel.level_id) {
            return res.status(400).json({
                message: "Pet is already at the max level for its experience",
                level_id: nextLevel.level_id,
                level_name: nextLevel.level_name,
                experience: pet.experience
            });
        }
        
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
                message: "Level up successfully!",
                pet_id: pet.pet_id,
                pet_name: pet.pet_name,
                level: nextLevel.level_name,
                experience: pet.experience
            });
        });
    });
}