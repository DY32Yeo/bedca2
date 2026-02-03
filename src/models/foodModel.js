const pool = require('../services/db');

module.exports.selectFood = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM Food;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM Food
    WHERE food_id = ?;
    `;
    const VALUES = [data.food_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}