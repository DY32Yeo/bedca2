const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM Level;
    `;

    pool.query(SQLSTATMENT, callback);
}