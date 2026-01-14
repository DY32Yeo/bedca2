const levelModel = require("../models/levelModel.js");

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