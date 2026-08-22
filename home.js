// ==============================
// AI SMART COMPLAINT MANAGEMENT
// home.js
// ==============================


// Wait until the page is fully loaded

document.addEventListener("DOMContentLoaded", function () {


    // ===========================
    // STUDENT INFORMATION
    // ===========================

    const studentName = "Mr. Sanket Survase";

    console.log("Welcome " + studentName);


    // ===========================
    // OPEN DASHBOARD BUTTONS
    // ===========================

    const buttons = document.querySelectorAll(".card button");


    buttons.forEach(function (button) {


        button.addEventListener("click", function () {


            // Get the title of the selected card

            const title =
                this.parentElement.querySelector("h2").innerText;


            // ===========================
            // BUTTON ACTIONS
            // ===========================

            switch (title) {


                // -------------------------
                // REGISTER COMPLAINT
                // -------------------------

                case "Register Complaint":

                    window.location.href = "register.html";

                    break;



                // -------------------------
                // MY COMPLAINTS
                // -------------------------

                case "My Complaints":

                    alert("My Complaints page is coming soon.");

                    break;



                // -------------------------
                // COMPLAINT STATUS
                // -------------------------

                case "Complaint Status":

                    alert("Complaint Status page is coming soon.");

                    break;



                // -------------------------
                // NOTIFICATIONS
                // -------------------------

                case "Notifications":

                    alert("Notifications page is coming soon.");

                    break;



                // -------------------------
                // DEFAULT
                // -------------------------

                default:

                    alert("Feature Coming Soon.");

            }

        });

    });



    // ===========================
    // NOTIFICATION ICON
    // ===========================

    const bell =
        document.querySelector(".fa-bell");


    if (bell) {


        bell.addEventListener("click", function () {


            alert("No New Notifications");


        });

    }



    // ===========================
    // MESSAGE ICON
    // ===========================

    const message =
        document.querySelector(".fa-message");


    if (message) {


        message.addEventListener("click", function () {


            alert("No New Messages");


        });

    }



    // ===========================
    // PROFILE CIRCLE
    // ===========================

    const profile =
        document.querySelector(".user");


    if (profile) {


        profile.addEventListener("click", function () {


            alert(

                "Student Profile\n\n" +

                "Name : " + studentName +

                "\nDepartment : Computer Science & Engineering"

            );


        });

    }


});