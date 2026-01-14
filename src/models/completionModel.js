const pool = require('../services/db');

module.exports.insertCompletion = (data, callback) =>
{
    const SQLSTATMENT = `
    INSERT INTO UserCompletion (challenge_id, user_id, details)
    VALUES (?, ?, ?);
    `;
    const VALUES = [data.challenge_id, data.user_id, data.details];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.getAttemptById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT user_id, details
    FROM UserCompletion
    WHERE challenge_id = ?;
    `;
    const VALUES = [data.challenge_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}