const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM PetAction;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM PetAction
    WHERE action_id = ?;
    `;
    const VALUES = [data.action_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}