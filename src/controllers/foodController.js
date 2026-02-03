const foodModel = require("../models/foodModel.js");

module.exports.readAllFood = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllFood:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    foodModel.selectFood(callback);
}

module.exports.checkFoodById = (req, res, next) =>
{
    const data = {
        food_id: req.body.food_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checkFoodById:", error);
            res.status(500).json(error);
        } else {
            if(results.length == 0) 
            {
                return res.status(404).json({
                    message: "Food not found"
                });
            }
        }
        req.food = results[0];
        next();
    }

    foodModel.selectById(data, callback);
}