// =====================================================
// STUDENT COMPLAINT STATUS
// =====================================================


// =====================================================
// FIREBASE IMPORTS
// =====================================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {
    getDatabase,
    ref,
    get
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyCQFmDJ9jhbMnID_MxiR0z-bBUjsehRQhw",

    authDomain:
        "smart-complaint-system-ca5fd.firebaseapp.com",

    databaseURL:
        "https://smart-complaint-system-ca5fd-default-rtdb.firebaseio.com",

    projectId:
        "smart-complaint-system-ca5fd",

    storageBucket:
        "smart-complaint-system-ca5fd.firebasestorage.app",

    messagingSenderId:
        "128793473217",

    appId:
        "1:128793473217:web:0d662396adb995cba92440"
};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);


const database =
    getDatabase(app);


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",

    function () {

        console.log(
            "Status.js loaded successfully"
        );


        // =================================================
        // HTML ELEMENTS
        // =================================================

        const trackingId =
            document.getElementById(
                "trackingId"
            );


        const checkStatusButton =
            document.getElementById(
                "checkStatusButton"
            );


        // =================================================
        // ELEMENT CHECK
        // =================================================

        if (!trackingId) {

            console.error(
                "trackingId input not found"
            );

            return;
        }


        if (!checkStatusButton) {

            console.error(
                "checkStatusButton not found"
            );

            return;
        }


        // =================================================
        // CHECK STATUS BUTTON
        // =================================================

        checkStatusButton.addEventListener(
            "click",

            function () {

                checkComplaintStatus();

            }
        );


        // =================================================
        // ENTER KEY
        // =================================================

        trackingId.addEventListener(
            "keydown",

            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    checkComplaintStatus();

                }

            }
        );


        // =================================================
        // AUTO-CHECK IF ID PASSED VIA URL OR SESSION STORAGE
        // =================================================
        try {
            const urlParams =
                new URLSearchParams(window.location.search);

            const passedId =
                urlParams.get("id") ||
                sessionStorage.getItem("pendingTrackId");

            if (passedId && passedId.trim() !== "") {
                trackingId.value = passedId.trim();
                sessionStorage.removeItem("pendingTrackId");
                checkComplaintStatus();
            }
        } catch (e) {
            console.warn("Auto-check error:", e);
        }

    }
);


// =====================================================
// CHECK COMPLAINT STATUS
// =====================================================

async function checkComplaintStatus() {

    const trackingId =
        document.getElementById(
            "trackingId"
        );


    const checkStatusButton =
        document.getElementById(
            "checkStatusButton"
        );


    const statusMessage =
        document.getElementById(
            "statusMessage"
        );


    const complaintResult =
        document.getElementById(
            "complaintResult"
        );


    // =================================================
    // GET TRACKING ID
    // =================================================

    const enteredTrackingID =
        trackingId.value
            .trim()
            .toUpperCase();


    // =================================================
    // CLEAR OLD RESULT
    // =================================================

    statusMessage.textContent =
        "";


    statusMessage.className =
        "message";


    complaintResult.innerHTML =
        "";


    // =================================================
    // EMPTY CHECK
    // =================================================

    if (
        enteredTrackingID === ""
    ) {

        showError(
            "Please enter your Tracking ID."
        );


        trackingId.focus();


        return;
    }


    // =================================================
    // FORMAT CHECK
    // =================================================

    if (
        !enteredTrackingID.startsWith(
            "CMP"
        )
    ) {

        showError(
            "Invalid Tracking ID. Please enter a valid CMP Tracking ID."
        );


        trackingId.focus();


        return;
    }


    // =================================================
    // LOADING
    // =================================================

    checkStatusButton.disabled =
        true;


    checkStatusButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';


    try {

        // =================================================
        // READ SAME COMPLAINTS NODE USED BY RESOLVER
        // =================================================

        const complaintsSnapshot =
            await get(
                ref(
                    database,
                    "complaints"
                )
            );


        // =================================================
        // NO COMPLAINTS
        // =================================================

        if (
            !complaintsSnapshot.exists()
        ) {

            showError(
                "Complaint not found. Please check your Tracking ID."
            );


            return;
        }


        // =================================================
        // FIND COMPLAINT
        // =================================================

        let foundComplaint =
            null;


        complaintsSnapshot.forEach(
            function (childSnapshot) {

                const complaint =
                    childSnapshot.val();


                // SAME ID PRIORITY AS RESOLVER DASHBOARD

                const complaintID =

                    complaint.trackingID ||

                    complaint.complaintID ||

                    childSnapshot.key;


                if (
                    normalizeValue(
                        complaintID
                    )
                    ===
                    normalizeValue(
                        enteredTrackingID
                    )
                ) {

                    foundComplaint = {

                        firebaseKey:
                            childSnapshot.key,

                        ...complaint

                    };

                }

            }
        );


        // =================================================
        // COMPLAINT NOT FOUND
        // =================================================

        if (
            !foundComplaint
        ) {

            showError(
                "Complaint not found. Please check your Tracking ID."
            );


            return;
        }


        // =================================================
        // READ SAME STATUS UPDATED BY RESOLVER
        // =================================================

        const currentStatus =
            foundComplaint.status ||
            "Pending";


        // =================================================
        // DISPLAY ONLY STATUS
        // =================================================

        displayStatus(
            currentStatus
        );

    }


    catch (error) {

        console.error(
            "Complaint Status Error:",
            error
        );


        console.error(
            "Error Code:",
            error.code
        );


        console.error(
            "Error Message:",
            error.message
        );


        // =================================================
        // FIREBASE PERMISSION
        // =================================================

        if (
            error.code ===
            "PERMISSION_DENIED"

            ||

            error.code ===
            "permission-denied"
        ) {

            showError(
                "Unable to access complaint status."
            );

        }


        // =================================================
        // NETWORK
        // =================================================

        else if (
            error.code ===
            "network-request-failed"
        ) {

            showError(
                "Network error. Please check your internet connection."
            );

        }


        // =================================================
        // OTHER ERROR
        // =================================================

        else {

            showError(
                "Unable to check complaint status. Please try again."
            );

        }

    }


    finally {

        // =================================================
        // RESTORE BUTTON
        // =================================================

        checkStatusButton.disabled =
            false;


        checkStatusButton.innerHTML =
            '<i class="fa-solid fa-magnifying-glass"></i> Check Status';

    }

}


// =====================================================
// DISPLAY STATUS
// =====================================================

function displayStatus(
    status
) {

    const statusMessage =
        document.getElementById(
            "statusMessage"
        );


    const complaintResult =
        document.getElementById(
            "complaintResult"
        );


    const displayStatus =
        getDisplayStatus(
            status
        );


    // CLEAR OLD ERROR

    statusMessage.textContent =
        "";


    statusMessage.className =
        "message";


    // =================================================
    // DISPLAY ONLY STATUS
    // =================================================

    complaintResult.innerHTML = `

        <div class="status-result">

            <p class="status-label">
                Complaint Status
            </p>

            <span
                class="status ${getStatusClass(displayStatus)}">

                ${escapeHTML(displayStatus)}

            </span>

        </div>

    `;

}


// =====================================================
// NORMALIZE STATUS FROM RESOLVER
// =====================================================

function getDisplayStatus(
    status
) {

    const value =
        normalizeValue(
            status
        );


    // COMPLETED

    if (
        value === "completed"

        ||

        value === "resolved"

        ||

        value === "fixed"
    ) {

        return "Completed";

    }


    // IN PROGRESS

    if (
        value === "in progress"
    ) {

        return "In Progress";

    }


    // PENDING

    return "Pending";

}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(
    status
) {

    const value =
        normalizeValue(
            status
        );


    if (
        value === "completed"
    ) {

        return "status-completed";

    }


    if (
        value === "in progress"
    ) {

        return "status-progress";

    }


    return "status-pending";

}


// =====================================================
// ERROR MESSAGE
// =====================================================

function showError(
    message
) {

    const statusMessage =
        document.getElementById(
            "statusMessage"
        );


    const complaintResult =
        document.getElementById(
            "complaintResult"
        );


    complaintResult.innerHTML =
        "";


    statusMessage.className =
        "message error";


    statusMessage.textContent =
        message;

}


// =====================================================
// NORMALIZE VALUE
// =====================================================

function normalizeValue(
    value
) {

    return String(
        value || ""
    )
    .trim()
    .toLowerCase();

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

    .replaceAll(
        "&",
        "&amp;"
    )

    .replaceAll(
        "<",
        "&lt;"
    )

    .replaceAll(
        ">",
        "&gt;"
    )

    .replaceAll(
        '"',
        "&quot;"
    )

    .replaceAll(
        "'",
        "&#039;"
    );

}