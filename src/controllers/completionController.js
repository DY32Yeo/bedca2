const completionModel = require("../models/completionModel.js");
const userModel = require('../models/userModel.js');

module.exports.createNewCompletion = (req, res, next) =>
{

    const user = req.user;
    const challenge = req.challenge;

    // used for updating
    const updateData = {
       user_id: user.user_id,
       username: user.username,
       points: user.points + challenge.points
    };

    const data = {
        challenge_id: req.params.challenge_id,
        user_id: req.body.user_id,
        details: req.body.details
    }

    // used to update in completionModel
    const updateCallback = (error, results, fields) => {
        if (error) {
            console.error("Error updateUserById:", error);
            res.status(500).json(error);
            return;
        } 
        completionModel.insertCompletion(data, callback);
    }
    
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewCompletion:", error);
            res.status(500).json(error);
        } 
            else 
            {
                res.status(201).json({
                    complete_id: results.insertId,
                    challenge_id: data.challenge_id,
                    user_id: data.user_id,
                    details: data.details,
                    points: updateData.points
                });
            } 
    } 
       
    // used to update the user points from completing challenges
    userModel.updateById(updateData, updateCallback);

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