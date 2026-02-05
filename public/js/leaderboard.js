document.addEventListener("DOMContentLoaded", function () 
{

    const leaderboardBody= document.getElementById("leaderboardBody");

    const callback = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);

        leaderboardBody.innerHTML = "";

        if (responseStatus != 200 || !responseData || responseData.length == 0) {
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-muted">No Leaderboard data yet.</td>
                </tr>
            `;
            return;
        }

        for (let i = 0; i < responseData.length; i++) {

            const user = responseData[i];

            const petDisplay = user.pet_name ? user.pet_name : "-";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>#${i + 1}</td>
                <td>${user.username}</td>
                <td>${petDisplay}</td>
                <td>${user.total_completed}</td>
                <td>${user.total_points_earned}</td>
            `;

            leaderboardBody.appendChild(tr)
        
        }
    }
    // Perform login request
    fetchMethod(currentUrl + "/api/users/leaderboard", callback, "GET");
});