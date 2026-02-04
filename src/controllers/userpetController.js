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
    if(req.body.pet_name == undefined) {
        res.status(400).json({
            message: "pet_name missing"
        });
        return;
    }

    const user_id = res.locals.userId; // Get from JWT
    const userpet_id = req.params.userpet_id;

    // First check if pet belongs to user
    userpetModel.checkById({ userpet_id: userpet_id, user_id: user_id }, (error, results) => {
        if (error) {
            console.error("Error checkById:", error);
            res.status(500).json(error);
            return;
        }

        if (results.length == 0) {
            res.status(404).json({
                message: "Pet not found or you don't own this pet"
            });
            return;
        }

        const data = {
            userpet_id: userpet_id,
            pet_name: req.body.pet_name,
            user_id: user_id
        }

        const callback = (error, results, fields) => {
            if (error) {
                console.error("Error updatePetNameById:", error);
                res.status(500).json(error);
            } else {
                res.status(200).json({
                    userpet_id: data.userpet_id,
                    pet_name: data.pet_name,
                    user_id: data.user_id
                }); 
            }
        }

        userpetModel.updateById(data, callback);
    });

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

module.exports.checkPetOwnership = (req, res, next) =>
{
    const data = {
        user_id: res.locals.userId,
        pet_id: req.body.pet_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkPetOwnership:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "Pet not found"
                });
                return;
            }
        }
        
        req.pet = results[0];
        next();
    }

    userpetModel.selectByPetId(data, callback);
}