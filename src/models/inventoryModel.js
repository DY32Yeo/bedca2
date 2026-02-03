const pool = require('../services/db');

module.exports.selectUserInventory = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT 
        Inventory.inventory_id,
        Inventory.food_id,
        Inventory.quantity,
        Food.food_name,
        Food.cost, 
        Food.hunger_restore,
        Food.xp_gain
    FROM Inventory, Food
    WHERE Inventory.food_id = Food.food_id
    AND Inventory.user_id = ?
    `;

    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.addToInventory = (data, callback) =>
{
    const SQLSTATMENT = `
    INSERT INTO Inventory (user_id, food_id, quantity)
    VALUES (?, ?, ?);
    `;
    const VALUES = [data.user_id, data.food_id, data.quantity];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.updateInventoryQuantity = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE Inventory 
    SET quantity = quantity + ? 
    WHERE user_id = ? AND food_id = ?;
    `;
    const VALUES = [data.quantity, data.user_id, data.food_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkUserHasFood = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT 
        Inventory.inventory_id,
        Inventory.food_id,
        Inventory.quantity,
        Food.food_name,
        Food.hunger_restore,
        Food.xp_gain
    FROM Inventory, Food
    WHERE Inventory.food_id = Food.food_id
    AND Inventory.user_id = ? 
    AND Inventory.food_id = ?;
    `;
    const VALUES = [data.user_id, data.food_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.useFromInventory = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE Inventory 
    SET quantity = quantity - ? 
    WHERE user_id = ? AND food_id = ?;
    `;
    const VALUES = [data.quantity, data.user_id, data.food_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.cleanupInventory = (data, callback) =>
{
    const SQLSTATMENT = `
    DELETE FROM Inventory 
    WHERE user_id = ? AND quantity <= 0;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}