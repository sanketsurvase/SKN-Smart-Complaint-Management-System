// ==============================
// REGISTER COMPLAINT
// ==============================

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("complaintForm");

    // Check if form exists
    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();


        // ==============================
        // GET FORM VALUES
        // ==============================

        const studentName =
            document.getElementById("studentName").value.trim();

        const studentId =
            document.getElementById("studentId").value.trim();

        const department =
            document.getElementById("department").value;

        const category =
            document.getElementById("category").value;

        const title =
            document.getElementById("complaintTitle").value.trim();

        const description =
            document.getElementById("complaintDescription").value.trim();

        const location =
            document.getElementById("location").value.trim();

        const priority =
            document.getElementById("priority").value;


        // ==============================
        // CHECK REQUIRED FIELDS
        // ==============================

        if (
            studentName === "" ||
            studentId === "" ||
            department === "" ||
            category === "" ||
            title === "" ||
            description === ""
        ) {

            alert("Please fill all required fields.");

            return;
        }


        // ==============================
        // GENERATE COMPLAINT ID
        // ==============================

        const complaintId =
            "CMP" +
            Math.floor(1000 + Math.random() * 9000);


        // ==============================
        // GET CURRENT DATE
        // ==============================

        const currentDate = new Date();

        const date =
            currentDate.toLocaleDateString("en-IN", {

                day: "2-digit",
                month: "short",
                year: "numeric"

            });


        // ==============================
        // CREATE COMPLAINT OBJECT
        // ==============================

        const complaint = {

            id: complaintId,

            studentName: studentName,

            studentId: studentId,

            department: department,

            category: category,

            title: title,

            description: description,

            location: location,

            priority: priority,

            status: "Pending",

            date: date

        };


        // ==============================
        // GET EXISTING COMPLAINTS
        // ==============================

        let complaints =
            JSON.parse(localStorage.getItem("complaints")) || [];


        // ==============================
        // ADD NEW COMPLAINT
        // ==============================

        complaints.push(complaint);


        // ==============================
        // SAVE ALL COMPLAINTS
        // ==============================

        localStorage.setItem(
            "complaints",
            JSON.stringify(complaints)
        );


        // ==============================
        // SUCCESS MESSAGE
        // ==============================

        alert(
            "Complaint submitted successfully!\n\n" +

            "Complaint ID : " +
            complaintId +

            "\nStatus : Pending"
        );


        // ==============================
        // RETURN TO HOME
        // ==============================

        window.location.href = "home.html";

    });

});


// ==============================
// GO TO HOME
// ==============================

function goHome() {

    window.location.href = "home.html";

}