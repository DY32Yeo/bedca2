const pool = require('../services/db');

module.exports.insertSingle = (data, callback) =>
{
    const SQLSTATMENT = `
    INSERT INTO WellnessChallenge (description, creator_id, points)
    VALUES (?, ?, ?);
    `;
    const VALUES = [data.description, data.creator_id, data.points];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectChallenge = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM WellnessChallenge;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.deleteById = (data, callback) =>
{
    const SQLSTATMENT = `
    DELETE FROM WellnessChallenge 
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.updateById = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE WellnessChallenge 
    SET description = ?, points = ?
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.description, data.points, data.challenge_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM WellnessChallenge
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}
