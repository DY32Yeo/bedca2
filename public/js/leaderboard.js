// waiting for dom to be fully loaded before executing
document.addEventListener("DOMContentLoaded", function () 
{
    // gets refernce to table body where leaderboard will be inserted
    const leaderboardBody= document.getElementById("leaderboardBody");

    const callback = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);

        // clears any exising content in leaderboard table
        leaderboardBody.innerHTML = "";

        // checking if reponse is invalid or has no data
        if (responseStatus != 200 || !responseData || responseData.length == 0) {
            // displays no data if no leaderboard data
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-muted">No Leaderboard data yet.</td>
                </tr>
            `;
            return;
        }

        // loops through each user in the reponseData
        for (let i = 0; i < responseData.length; i++) {
            // get current user object
            const user = responseData[i];
            // display pets name
            const petDisplay = user.pet_name ? user.pet_name : "-";
            // handling different fields names for points
            const totalPoints = user.total_points_earned || user.points || 0; // Handle both field names

            // creating table row
            const tr = document.createElement("tr");
            // filling the row with user data
            tr.innerHTML = `
                <td>#${i + 1}</td>
                <td>${user.username}</td>
                <td>${petDisplay}</td>
                <td>${user.total_completed}</td>
                <td>${totalPoints}</td> <!-- Show actual total points -->
            `;
            // append the new row to the table body
            leaderboardBody.appendChild(tr)
        
        }
    }
    // GET request to leaderboard API endpoint
    fetchMethod(currentUrl + "/api/users/leaderboard", callback, "GET");
});