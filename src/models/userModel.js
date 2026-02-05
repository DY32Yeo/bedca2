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
    SET username = ?
    WHERE user_id = ?;
    `;
    const VALUES = [data.username, data.user_id];

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

// module.exports.selectByIdPet = (data, callback) =>
// {
//     const SQLSTATMENT = `
//     SELECT * FROM UserPet
//     WHERE user_id = ?;
//     `;
//     const VALUES = [data.user_id];

//     pool.query(SQLSTATMENT, VALUES, callback);
// } 

module.exports.selectRank = (callback) =>
{
    const SQLSTATMENT = `
    SELECT 
        User.user_id,
        User.username,

        (
            SELECT COUNT(*)
            From UserCompletion
            WHERE UserCompletion.user_id = User.user_id
        ) AS total_completed,

        (
            SELECT IFNULL(SUM(WellnessChallenge.points), 0)
            FROM UserCompletion, WellnessChallenge
            WHERE UserCompletion.challenge_id = WellnessChallenge.challenge_id
            AND UserCompletion.user_id = User.user_id
        ) AS total_points_earned,

        (
            SELECT UserPet.pet_name 
            FROM UserPet 
            WHERE UserPet.user_id = User.user_id
            LIMIT 1
        ) AS pet_name,

        (
            SELECT Pet.species 
            FROM UserPet, Pet
            WHERE UserPet.pet_id = Pet.pet_id
            AND UserPet.user_id = User.user_id
            Limit 1
        ) AS pet_species

    FROM User
    WHERE EXISTS (
        SELECT 1 
        FROM UserPet
        WHERE UserPet.user_id = User.user_id
    )

    AND EXISTS (
        SELECT 1
        FROM UserCompletion
        WHERE UserCompletion.user_id = User.user_id
    )
    ORDER BY total_points_earned DESC, total_completed DESC, User.user_id ASC
    LIMIT 5
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

module.exports.deleteById = (data, callback) =>
{
    const SQLSTATMENT = `
    DELETE 
    FROM User
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}
