# Starter Repository for Assignment
You are required to build your folder structures for your project.
# Starter Repository for Assignment
You are required to build your folder structures for your project.


<!-- Pet Guardian Gamification System -->
The objective of the Pet Guardian game is to encourage users to complete challenges in order to earn points that can be used to adopt a pet, care for them and to take care of their digital pet.

Users act as pet guardian, earning points from completing wellness challenge.
These points are used as in-game currency to adopt pets, feed them, and train them, encouraging consistent participation and healthy habits.

This backend API allows user to 
    Participate in wellness challenges to earn points
    Adopt, feed and train digital pets,
    Track pet experience and levels
    View a leaderboard

##Prerequisites

Ensure you have the following installed:

Node.js
Express.js
dotenv
nodemon
Postman
mysql2

Install dependencies:

npm install

##Available Scripts

Run scripts using:

npm run <script-name>

1. start
npm start


Starts the server normally using Node.js.

2. dev
npm run dev


Starts the server using nodemon for development.

3. init_tables
npm run init_tables

This script drop and create tables, insert seed data for users, pets, challenges,
actions and levels

Table created:
    User
    Wellness Challenge
    UserCompletion
    Pet
    UserPet
    PetAction
    Level


Create a .env file:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=your_database

All routes 
app.use('/', mainRoutes)

available routes include 
    /users
    /challenges
    /completion
    /pet
    /userpet
    /level
    /action

## Basics 
The following are the most basic endpoints to use in Pet Guardian 

Base URL: http://localhost:3000

1. Pet list
HTTP Method: GET
Endpoint: /pet
Description:
Returns the list of all known pet species that the user can choose from.

2. Delete UserPet
HTTP Method: DELETE
Endpoint: /pet/userpet_id
Description:
Deletes the current pet of the specified user. Returns a success message if deletion succeeds.

3. Pet by Id
HTTP Method: GET
Endpoint: /userpet/user_id
Description:
Returns the list of pets adopted by .

4. Create a Pet adoption
HTTP Method: POST
Endpoint: /userpet/adopt
Request Body:
json

{
  "user_id": 1,
  "pet_id": 1,
  "pet_name: "Buddy"
}

Description:
Creates a pet adoption record for user

5. Change pet name
HTTP Method: PUT
Endpoint: /userpet/userpet_id
Request Body:
json

{
    "pet_name": "Raptor"
    "user_id: 1
}

Description:
Allows user to change their pet's name.

6. Performing either feeding pet or training pet
HTTP Method: POST
Endpoint: /userpet/userpet_id/action
Request Body:
json

{
  "user_id": 1,
  "action_id": 1
}

7. User Leaderboard
HTTP Method: GET
Endpoint: /users/leaderboard
Description:
Returns the list of all users with Pets ranked based on level_id followed by experience if there are users with the same level_id

8. Level List
HTTP Method: GET
Endpoint: /level
Description:
Returns the list of all available level

9. Action List 
HTTP Method: GET
Endpoint: /action
Description:
Returns the list of all available action


