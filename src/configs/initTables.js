const pool = require("../services/db");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const callback = (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully");
  }
  process.exit();
}

bcrypt.hash('1234', saltRounds, (error, hash) => {
  if (error) {
    console.error("Error hasing password:", error);
  } else {
    console.log("Hashed password:", hash);

    const SQLSTATEMENT = `
DROP TABLE IF EXISTS User;

DROP TABLE IF EXISTS WellnessChallenge;

DROP TABLE IF EXISTS UserCompletion;

DROP TABLE IF EXISTS Pet;

DROP TABLE IF EXISTS UserPet;

DROP TABLE IF EXISTS PetAction;

DROP TABLE IF EXISTS Level;

CREATE TABLE User (
user_id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(255) NOT NULL,
email TEXT NOT NULL,
password TEXT NOT NULL,
points INT DEFAULT 0,
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE WellnessChallenge (
challenge_id INT AUTO_INCREMENT PRIMARY KEY,
creator_id INT NOT NULL,
description TEXT NOT NULL,
points INT NOT NULL
);

CREATE TABLE UserCompletion (
completion_id INT AUTO_INCREMENT PRIMARY KEY,
challenge_id INT NOT NULL,
user_id INT NOT NULL,
details TEXT
);

CREATE TABLE Pet (
pet_id INT AUTO_INCREMENT PRIMARY KEY,
species VARCHAR(255) NOT NULL,
adopt_cost INT NOT NULL
);

CREATE TABLE UserPet (
userpet_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
pet_id INT NOT NULL,
pet_name VARCHAR(255) NOT NULL,
level_id INT DEFAULT 1,
experience INT DEFAULT 0,
hunger INT DEFAULT 100,
adopted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PetAction (
action_id INT AUTO_INCREMENT PRIMARY KEY,
action_name VARCHAR(255) NOT NULL,
action_type ENUM('feed', 'train') NOT NULL,
unlock_cost INT NOT NULL,
experience_gained INT NOT NULL
);

CREATE TABLE Level (
level_id INT AUTO_INCREMENT PRIMARY KEY,
level_name VARCHAR(255) NOT NULL,
experience_required INT NOT NULL
);

INSERT INTO User (username, email, password, points) VALUES
('Captain Rex', 'rex@gmail.com', '${hash}' 501),
('Commander Cody', 'cody@gmail.com', '${hash}', 212),
('Obi-Wan Kenobi', 'obi@gmail.com', '${hash}', 100),
('Anakin Skywalker', 'ani@gmail.com', '${hash}', 150),
('Yoda', 'yoda@gmail.com', '${hash}', 80),
('Mandolorian', 'mando@gmail.com', '${hash}', 123),
('socuser1', 'dit@gmail.com', '${hash}', 0),
('socuser2', 'dcdf@gmail.com', '${hash}', 0),
('socuser3', 'daaa@gmail.com', '${hash}',0);

INSERT INTO WellnessChallenge (creator_id, description, points) VALUES
(1, 'Sleep like a boss - Get 7+ hours of sleep', 10),
(1, 'Stairs over elevator? Respect. - Take the stairs today', 20),
(2, 'Digital detox (mini edition) - No phone for 1 hour', 10),
(2, 'Touch grass IRL - Take a 15-minute walk outside', 10),
(2, 'IRL > DMs - Talk to a friend face-to-face', 20),
(3, 'Declutter your chaos - Clean your desk or room', 20),
(3, 'Help a homie - Assist someone without being asked', 20);

INSERT INTO UserCompletion (challenge_id, user_id, details) VALUES
(1, 2, "Sleep is your brain's way of saying 'BRB, upgrading.' Don't skip the update!"),
(1, 3, "Sleep is for the wise who don't want to look like a zombie in 4K."),
(2, 1, "Climbed 100 levels of stairs"),
(2, 1, "Climb stairs everyday instead of lift"),
(5, 1, "Meet up with friend for coffee"),
(6, 1, "Tidy up my room"),
(7, 1, "Helped someone with their grocery bags");

INSERT INTO Pet (species, adopt_cost) VALUES 
('Dog', 30),
('Cat', 30),
('Ferret', 60),
('Hamster', 100),
('Parrot', 150),
('Seal', 200);

INSERT INTO UserPet (user_id, pet_id, pet_name, level_id, experience, hunger) VALUES 
(1, 1, 'Rex', 5, 520, 80),
(1, 2, 'Fives', 1, 0, 100),
(2, 2, 'Cody', 4, 250, 80),
(3, 1, 'Kenobi', 3, 150, 100),
(4, 3, 'Darth Vader', 4, 320, 70),
(5, 2, 'Jedi', 2, 80, 95),
(6, 1, 'Grogu', 3, 180, 90);

INSERT INTO PetAction (action_name, action_type, unlock_cost, experience_gained) VALUES
('Feed Pet', 'feed', 5, 20),
('Train Pet', 'train', 10, 30);

INSERT INTO Level (level_name, experience_required) VALUES
('Newborn', 0),
('Growing', 100),
('Teen', 200),
('Adult', 400),
('Expert', 800);
`;

    pool.query(SQLSTATEMENT, callback);
  }
});



