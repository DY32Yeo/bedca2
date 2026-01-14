const challengeModel = require("../models/challengeModel.js");
const userModel = require('../models/userModel.js');

module.exports.createNewChallenge = (req, res, next) =>
{
    if(req.body.description == undefined || req.body.user_id == undefined)
    {
        res.status(400).json({
            message: "Error: missing question or user_id"
        });
        return;
    }

    const data = {
        description: req.body.description,
        creator_id: req.body.user_id,
        points: req.body.points
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewChallenge:", error);
            res.status(500).json(error);
        } else {
            res.status(201).json({
                challenge_id: results.insertId,
                description: data.description,
                creator_id: data.creator_id,
                points: data.points
            });
        }
    }

    challengeModel.insertSingle(data, callback);
}

module.exports.readAllChallenge = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllChallenge:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    challengeModel.selectChallenge(callback);
}

module.exports.deleteChallengeById = (req, res, next) =>
{
    const data = {
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteChallengeById:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "challenge_id does not exist"
                });
            }
            else res.status(204).send(); // 204 No Content            
        }
    }

    challengeModel.deleteById(data, callback);
}

module.exports.updateChallengeById = (req, res, next) =>
{
    if(req.body.user_id == undefined || req.body.description == undefined || req.body.points == undefined)
    {
        res.status(400).json({
            message: "Error: missing challenge description, points or user_id"
        });
        return;
    }

    const challengeId = req.params.challenge_id;
    
    // cause model is where challenge_id = ? if not error 404
    const selectData = {
        challenge_id: challengeId 
    }

    // to check if challenge exist and belongs to owner
    challengeModel.selectById(selectData, (error, results) => {
        if (error) {
            console.error("Error selectById:", error);
            res.status(500).json(error);
            return;
            
        }

        if (results.length == 0) {
            res.status(404).json({
                message: "challenge_id does not exist"
            });
            return;
        }

        
        const challenge = results[0];

        // used to check if they user_id is same as the creator_id as they are supposed to be the same
        if (req.body.user_id != challenge.creator_id) {
            res.status(403).json({
                message: "Forbidden: Not correct owner"
            });

            return;
        }
        
        const updateData = {
            challenge_id : challengeId,
            description: req.body.description,
            points: req.body.points
        };

        // used to update the challenge
        challengeModel.updateById(updateData, (error, results) => {
            if (error) {
                console.error("Error updateChallengeById:", error);
                res.status(500).json(error);
                return;
            }

            res.status(200).json({
                challenge_id: challengeId,
                description: updateData.description,
                creator_id: challenge.creator_id,
                points: updateData.points
            });
        });
    });

}

module.exports.checkChallengeById = (req, res, next) =>
{
    const data = {
        challenge_id: req.params.challenge_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkChallengeById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                return res.status(404).json({
                    message: "challenge_id does not exist"
                });
            }  
        } 
        req.challenge = results[0];
        next();
    }
    challengeModel.selectById(data, callback);
}

