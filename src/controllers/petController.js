const petModel = require("../models/petModel.js");

module.exports.readAllPet = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllPet:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    petModel.selectAll(callback);
}


module.exports.checkPetById = (req, res, next) =>
{

    const data = {
        pet_id: req.body.pet_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkPetById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "pet_id does not exist"
                });
            }
            else {
                req.pet = results[0];
                next();
            }

        }
    }

    petModel.selectById(data, callback);
}

module.exports.deleteUserPetById = (req, res, next) =>
{
    const data = {
        userpet_id: req.params.userpet_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteUserPetById:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "userpet_id not found."
                });
            }
            else res.status(204).send(); // 204 No Content            
        }
    }

    petModel.deleteById(data, callback);
}