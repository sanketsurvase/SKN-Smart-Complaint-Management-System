// ==============================
// AI SMART COMPLAINT MANAGEMENT
// home.js
// ==============================

document.addEventListener("DOMContentLoaded", function () {

    // ---------------------------
    // Welcome Message
    // ---------------------------

    const studentName = "Mr. Sanket Survase";

    console.log("Welcome " + studentName);


    // ---------------------------
    // CARD BUTTONS
    // ---------------------------

    const buttons = document.querySelectorAll(".card button");

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const title =
                this.parentElement
                    .querySelector("h2")
                    .innerText
                    .trim();


            // ---------------------------
            // REGISTER COMPLAINT
            // ---------------------------

            if (title === "Register Complaint") {

                window.location.href =
                    "../Complaint Register page/Complaint_register.html";

            }


            // ---------------------------
            // CHECK COMPLAINT STATUS
            // ---------------------------

            else if (title === "Check Complaint Status") {

                window.location.href =
                    "../status/Status.html";

            }

        });

    });

});