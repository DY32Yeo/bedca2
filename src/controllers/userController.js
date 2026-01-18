const userModel = require("../models/userModel.js");

module.exports.checkAllUser = (req, res, next) =>
{   
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkAllUser:", error);
            res.status(500).json(error);
        } 
        else {
            // store all the username in an array
            nameStore = results;
            next();
        }
    }

    userModel.selectAll(callback);
}

module.exports.createNewUser = (req, res, next) =>
{
    if(req.body.username == undefined)
    {
        return res.status(400).json({
            message: "Error: username is missing"
        });
    }

    // it will loop thru the array of username and check for duplicate username if it exists the error will be triggered
    for (let i = 0; i < nameStore.length; i++) {
        if(req.body.username == nameStore[i].username)
        {
            return res.status(409).json({
                message: "Error: username is already associated with another user"
            });
        } 
    }

    const data = {
        username: req.body.username,
        points: 0
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewUser:", error);
            res.status(500).json(error);
        } else {
            res.status(201).json({
                user_id: results.insertId,
                username: data.username,
                points: data.points
            });
        }
    }

    userModel.insertSingle(data, callback);
}

module.exports.readAllUser = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllUser:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    userModel.selectUser(callback);
}

module.exports.readUserById = (req, res, next) =>
{
    const data = {
        user_id: req.params.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readUserById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "user_id does not exist"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    userModel.selectById(data, callback);
}

module.exports.updateUserById = (req, res, next) =>
{
    if(req.body.username == undefined)
    {
        return res.status(400).json({
            message: "Error: username is missing"
        });
    }

    // loops thru the array of username to check for duplicated username, if it exists the error will be triggered
    for (let i = 0; i < nameStore.length; i++) {
        if(req.body.username == nameStore[i].username)
        {
            return res.status(409).json({
                message: "Error: username is already associated with another user"
            });
        } 
    }

    const data = {
        user_id: req.params.user_id,
        username: req.body.username,
        points: req.body.points
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateUserById:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows == 0) 
            {
                res.status(404).json({
                    message: "user_id does not exist"
                });
            }
            else res.status(200).json({
                user_id: data.user_id,
                username: data.username,
                points: data.points
            });
        }
    }

    userModel.updateById(data, callback);
}

module.exports.checkUserById = (req, res, next) =>
{

    const data = {
        user_id: req.body.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkUserById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                return res.status(404).json({
                    message: "user_id does not exist"
                });
            }
        }
        req.user = results[0];
        next();

    }

    userModel.selectById(data, callback);
}

module.exports.getLeaderboard = (req, res, next) =>
{

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error getLeaderboard:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                res.status(404).json({
                    message: "No user with pet found."
                });
            }
            else res.status(200).json(results);
        }
    }

    userModel.selectRank(callback);
}

module.exports.login = (req, res, next) => {
    try { 
        const requiredFields = ['username', 'password'];

        for (const field of requiredFields) {
            if (req.body[field] === undefined || req.body[field] === "") {
                res.status(400).json({ message: `${field} is undefined or empty` });
                return;
            }
        };

        const data = {
            username: req.body.username,
            password: res.locals.hash
        };

        const callback = (error, results) => {
            if(error){
                console.error("Error login callback: ", error);
                res.status(500).json(error);
            } else {
                if(results.length == 0){
                    res.status(404).json({message: "User not found"}); 
                } else {
                    res.locals.userId = results[0].id
                    res.locals.hash = results[0].password
                    next();
                }
            }
        };

        userModel.login(data, callback);

    } catch (error) {
        console.error("Error login: ", error);
        res.status(500).json(error);
    }
}