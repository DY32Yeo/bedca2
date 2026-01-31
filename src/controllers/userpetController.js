const userModel = require("../models/userModel.js");
const userpetModel = require("../models/userpetModel.js")

module.exports.getUserPetById = (req, res, next) =>
{
    const data = {
        user_id: req.params.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getUserPetById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "user_id does not exist"
                });
            }
            else res.status(200).json(results);
        }
    }

    userpetModel.selectById(data, callback);
}

module.exports.updatePetNameById = (req, res, next) =>
{
    if(req.body.pet_name == undefined || req.body.user_id == undefined)
    {
        res.status(400).json({
            message: "pet_name or user_id missing"
        });
        return;
    }

    const data = {
        userpet_id: req.params.userpet_id,
        pet_name: req.body.pet_name,
        user_id: req.body.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updatePetNameById:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "Pet not found."
                });
            }
            else res.status(200).json({
                userpet_id: data.userpet_id,
                pet_name: data.pet_name,
                user_id: data.user_id
            }); 
        }
    }

    userpetModel.updateById(data, callback);
}

module.exports.adoptPet = (req, res, next) =>
{
    if (req.body.pet_name == undefined)
    {
        return res.status(400).json({
            message: "Error: missing pet_name"
        });
    }

    const user = req.user;
    const pet = req.pet;

    // used to check if the user have sufficient points 
    if (user.points < pet.adopt_cost) 
    {
        return res.status(403).json({
            message: "Not enough points to adopt pet"
        });
    }

    // created 2 diff data as i made 2 different callback for 2 different model
    const updateUserData = {
        user_id: user.user_id,
        username: user.username,
        points: user.points - pet.adopt_cost
    }

    const userPetData = {
        user_id: user.user_id,
        pet_id: pet.pet_id,
        pet_name: req.body.pet_name
    }

    const insertPetCallback = (error, results, fields) => {
        if (error) {
            console.error("Error adoptPet:", error);
            res.status(500).json(error);
        } else {
                res.status(201).json({
                    userpet_id: results.insertId,
                    pet_name: userPetData.pet_name,
                    level_id: 1,
                    experience: 0,
                    hunger: 100,
                    points: updateUserData.points
                });

        }
    }

    const updateUserCallback = (error, results, fields) => {
        if (error) {
            console.error("Error updateUserpoints :", error);
            res.status(500).json(error);
        } else {
            // this inserts user_id, pet_id and pet_name into Pet
            userpetModel.insertSingle(userPetData, insertPetCallback);
        }
    }
    // this updates the user points by deducting for adopting a pet
    userModel.updateById(updateUserData, updateUserCallback);
}

module.exports.checkUserPetById = (req, res, next) =>
{

    const data = {
        userpet_id: req.params.userpet_id,
        user_id: res.locals.userId
    }
    

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkUserPetById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                return res.status(404).json({
                    message: "userpet_id does not exist"
                });
            }
        }
        
        req.userpet = results[0];
        next();

    }

    userpetModel.checkById(data, callback);
}

module.exports.performPetAction = (req, res, next) =>
{

    const user = req.user;
    const userpet = req.userpet;
    const action = req.action;

    // to check if user have succificent points to unlock the ability
    if (user.points < action.unlock_cost) 
    {
        return res.status(403).json({
            message: "Not enough points to perform action"
        });
    }

    // used to update the xp and hunger
    let newExperience = userpet.experience + action.experience_gained;
    let newHunger = userpet.hunger;

    // only wrote 1 if since i am going to use tenary operator from FOP
    if (action.action_type == "feed") {
        newHunger = Math.min(100, Math.max(0, userpet.hunger + 20));
    } else if (action.action_type == "train") {
        if (userpet.hunger < 10) {
            return res.status(400).json({
                message: "Pet is too hungry to train"
            });
        }
        newHunger = Math.max(0, userpet.hunger - 20);
    }

    

    // 2 different data for 2 different callback for 2 different model
    const updateUserData = {
        user_id: user.user_id,
        username: user.username,
        points: user.points - action.unlock_cost
    }

    const updatePetData = {
        userpet_id: userpet.userpet_id,
        experience: newExperience,
        hunger: newHunger
    }

    req.newExperience = newExperience;
    req.newHunger = newHunger;
    req.newPoints = updateUserData.points;


    const updatePetCallback = (error, results, fields) => {
        if (error) {
            console.error("Error updatePetStats:", error);
            res.status(500).json(error);
        } else {
            // res.status(201).json({
            //     message: action.action_type == "train" 
            //     ? "Pet trained successfully"
            //     : "Pet fed successfully",
            //     userpet_id: userpet.userpet_id,
            //     experience: newExperience,
            //     hunger: newHunger,
            //     points: updateUserData.points
            // });
            next();
        }
    }

    const updateUserCallback = (error, results, fields) => {
        if (error) {
            console.error("Error updateUserPoints :", error);
            res.status(500).json(error);
        } else {
            // this updates the pet stats like the experience and the hunger
            userpetModel.updateStatsById(updatePetData, updatePetCallback);
        }
        }
        // this updates the user stats like deducting point for action
    userModel.updatePointsById(updateUserData, updateUserCallback);
    // if updatePointsById error updateStatsById wont even run
}
