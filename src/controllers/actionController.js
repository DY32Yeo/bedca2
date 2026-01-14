const actionModel = require("../models/actionModel.js");

module.exports.readAllAction = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllAction:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    actionModel.selectAll(callback);
}

module.exports.checkActionById = (req, res, next) =>
{

    const data = {
        action_id: req.body.action_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkActionById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                return res.status(404).json({
                    message: "action_id does not exist"
                });
            }
        }
        req.action = results[0];
        next();

    }

    actionModel.selectById(data, callback);
}
