const pool = require('../services/db');


module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM UserPet
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.updateById = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE UserPet 
    SET pet_name = ?
    WHERE userpet_id = ? AND user_id = ?;
    `;
    const VALUES = [data.pet_name, data.userpet_id, data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.insertSingle = (data, callback) =>
{
    const SQLSTATMENT = `
    INSERT INTO UserPet (user_id, pet_id, pet_name)
    VALUES (?, ?, ?);
    `;
    const VALUES = [data.user_id, data.pet_id, data.pet_name];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM UserPet
    WHERE userpet_id = ? AND user_id = ?;
    `;
    const VALUES = [data.userpet_id, data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectByPetId = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM UserPet
    WHERE user_id = ? AND pet_id = ?;
    `;
    const VALUES = [data.user_id, data.pet_id];
    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.updateStatsById = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE UserPet 
    SET experience  = ?, hunger = ?
    WHERE userpet_id = ?;
    `;
    const VALUES = [data.experience, data.hunger, data.userpet_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.updateLevelById = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE UserPet 
    SET level_id = ?
    WHERE userpet_id = ?;
    `;
    const VALUES = [data.level_id, data.userpet_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

// module.exports.checkByPetId = (data, callback) =>
// {
//     const SQLSTATMENT = `
//     SELECT * FROM UserPet
//     WHERE user_id = ? AND pet_id = ?;
//     `;
//     const VALUES = [data.user_id, data.pet_id];

//     pool.query(SQLSTATMENT, VALUES, callback);
// }
