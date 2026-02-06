document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const heroAuthButton = document.getElementById("heroAuthButton");

    if (token && heroAuthButton) {
        heroAuthButton.classList.add("d-none");
    }
});