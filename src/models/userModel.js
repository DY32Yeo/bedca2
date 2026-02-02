const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM User;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.insertSingle = (data, callback) =>
{
    const SQLSTATMENT = `
    INSERT INTO User (username, points)
    VALUES (?, ?);
    `;
    const VALUES = [data.username, data.points];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectUser = (callback) =>
{
    const SQLSTATMENT = `
    SELECT user_id, username, points, created_on
    FROM User;
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT user_id, username, points, created_on
    FROM User
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.updateById = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE User 
    SET username = ?, points = ?
    WHERE user_id = ?;
    `;
    const VALUES = [data.username, data.points, data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.updatePointsById = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE User 
    SET points = ?
    WHERE user_id = ?;
    `;
    const VALUES = [data.points, data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectByIdPet = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM UserPet
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
} 

module.exports.selectRank = (callback) =>
{
    const SQLSTATMENT = `
    SELECT 
        User.user_id,
        User.username,
        UserPet.pet_name,
        Pet.species,
        Level.level_name, 
        Userpet.level_id,
        Userpet.experience
    FROM User, UserPet, Pet, Level
    WHERE User.user_id = UserPet.user_id
    AND UserPet.pet_id = Pet.pet_id
    AND UserPet.level_id = Level.level_id
    ORDER BY UserPet.level_id DESC, UserPet.experience DESC
    `;
    pool.query(SQLSTATMENT, callback);
}

module.exports.login = (data, callback) => {

    const SQLSTATEMENT = `
        SELECT *
        FROM User
        WHERE username = ?;
    `;

    VALUES = [data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.readUserByEmailAndUsername = (data, callback) => {

    const SQLSTATEMENT = `
        SELECT user_id, email, username
        From User
        where email = ? OR username = ?;
    `;

    VALUES = [data.email, data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.register = (data, callback) => {

    const SQLSTATEMENT = `
        INSERT INTO User (username, email, password)
        VALUES (?, ?, ?);
    `;

    VALUES = [data.username, data.email, data.password];

    pool.query(SQLSTATEMENT, VALUES, callback);
}   