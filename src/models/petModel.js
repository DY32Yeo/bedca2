const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM Pet;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM Pet 
    WHERE pet_id = ?;
    `;
    const VALUES = [data.pet_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.deleteById = (data, callback) =>
{
    const SQLSTATMENT = `
    DELETE FROM UserPet 
    WHERE userpet_id = ?;
    `;
    const VALUES = [data.userpet_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}