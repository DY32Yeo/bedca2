// dom to load
document.addEventListener("DOMContentLoaded", function () {
    // getting token 
    const token = localStorage.getItem("token");
    // get reference to hero section buttons
    const heroAuthButton = document.getElementById("heroAuthButton");
    // checks if user is logged in and button container exist
    if (token && heroAuthButton) {
        // button isnt displayed when user is logged in because of d-none
        heroAuthButton.classList.add("d-none");
    }
});