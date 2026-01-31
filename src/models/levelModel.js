const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM Level;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectLevelByExperience = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT level_id, level_name, experience_required
    FROM Level
    WHERE experience_required <= ?
    ORDER BY experience_required DESC
    LIMIT 1;
    `;

    const VALUES = [data.experience]

    pool.query(SQLSTATMENT, VALUES, callback);
}

