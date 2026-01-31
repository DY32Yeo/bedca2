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

    const userpet = req.userpet;
    const action = req.action;


    const levelData = {
        experience: req.newExperience
    }

    const levelCallback = (error, results, fields) => {
        if (error) {
            console.error("Error selectLevelByExperience:", error);
            res.status(500).json(error);
        } 

        let newLevelId = 1;
        let newLevelName = null;

        if (results.length != 0) {
            newLevelId = results[0].level_id;
            newLevelName = results[0].level_name;
        }

        const updateLevelData = {
            userpet_id: userpet.userpet_id,
            level_id: newLevelId
        }

        const updateLevelCallback = (error, results, fields) => {
            if (error) {
                console.error("Error updateLevelById:", error);
                res.status(500).json(error);
            } else {
                res.status(200).json({
                    message: action.action_type == "train" 
                    ? "Pet trained successfully"
                    : "Pet fed successfully",
                    userpet_id: userpet.userpet_id,
                    experience: req.newExperience,
                    hunger: req.newHunger,
                    level_id: newLevelId,
                    level_name: newLevelName,
                    points: req.newPoints
                });
            }
        }
    userpetModel.updateLevelById(updateLevelData, updateLevelCallback)
    }

    levelModel.selectLevelByExperience(levelData, levelCallback);
}