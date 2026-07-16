// ==============================
// AI SMART COMPLAINT MANAGEMENT
// script.js
// ==============================

// Wait until page loads
document.addEventListener("DOMContentLoaded", function () {

    // ---------------------------
    // Welcome Message
    // ---------------------------
    const studentName = "Mr. Sanket Survase";

    console.log("Welcome " + studentName);

    // ---------------------------
    // Open Buttons
    // ---------------------------
    const buttons = document.querySelectorAll(".card button");

    buttons.forEach(function(button){

        button.addEventListener("click", function(){

            let title = this.parentElement.querySelector("h2").innerText;

            switch(title){

                case "Register Complaint":
                    alert("Opening Register Complaint Page...");
                    // window.location.href="register.html";
                    break;

                case "My Complaints":
                    alert("Opening My Complaints...");
                    // window.location.href="mycomplaints.html";
                    break;

                case "Complaint Status":
                    alert("Opening Complaint Status...");
                    // window.location.href="status.html";
                    break;

                case "Notifications":
                    alert("Opening Notifications...");
                    // window.location.href="notifications.html";
                    break;

                default:
                    alert("Feature Coming Soon");
            }

        });

    });

    // ---------------------------
    // Notification Icon
    // ---------------------------
    const bell = document.querySelector(".fa-bell");

    if(bell){

        bell.addEventListener("click",function(){

            alert("No New Notifications");

        });

    }

    // ---------------------------
    // Message Icon
    // ---------------------------
    const message = document.querySelector(".fa-message");

    if(message){

        message.addEventListener("click",function(){

            alert("No New Messages");

        });

    }

    // ---------------------------
    // Profile Circle
    // ---------------------------
    const profile = document.querySelector(".user");

    if(profile){

        profile.addEventListener("click",function(){

            alert(
                "Student Profile\n\n" +
                "Name : " + studentName +
                "\nDepartment : Computer Science & Engineering"
            );

        });

    }

});