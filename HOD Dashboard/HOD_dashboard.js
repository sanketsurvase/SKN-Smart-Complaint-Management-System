// =====================================================
// HOD DASHBOARD
// =====================================================


// =====================================================
// FIREBASE IMPORTS
// =====================================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {
    getAuth,
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    getDatabase,
    ref,
    get,
    onValue
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


// =====================================================
// FIREBASE CONFIGURATION
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

const auth =
    getAuth(app);

const database =
    getDatabase(app);


// =====================================================
// LOGIN PAGE
// =====================================================

const LOGIN_PAGE =
    "../HOD Login/HOD_login.html";


// =====================================================
// HTML ELEMENTS
// =====================================================

const hodName =
    document.getElementById("hodName");

const hodDepartment =
    document.getElementById("hodDepartment");

const complaintContainer =
    document.getElementById("complaintContainer");

const totalComplaints =
    document.getElementById("totalComplaints");

const pendingComplaints =
    document.getElementById("pendingComplaints");

const progressComplaints =
    document.getElementById("progressComplaints");

const resolvedComplaints =
    document.getElementById("resolvedComplaints");

const searchComplaint =
    document.getElementById("searchComplaint");

const logoutButton =
    document.getElementById("logoutButton");


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let complaintList = [];

let resolverMap = {};

let currentHodDepartment = "";

let complaintsListenerStarted = false;


// =====================================================
// CHECK HOD LOGIN
// =====================================================

onAuthStateChanged(
    auth,

    async function (user) {

        // -----------------------------------------
        // USER NOT LOGGED IN
        // -----------------------------------------

        if (!user) {

            window.location.replace(
                LOGIN_PAGE
            );

            return;
        }


        try {

            // =====================================
            // GET HOD PROFILE
            // =====================================

            const hodSnapshot =
                await get(

                    ref(
                        database,
                        "users/" + user.uid
                    )

                );


            // =====================================
            // PROFILE NOT FOUND
            // =====================================

            if (!hodSnapshot.exists()) {

                alert(
                    "HOD profile not found."
                );

                await signOut(auth);

                window.location.replace(
                    LOGIN_PAGE
                );

                return;
            }


            const hod =
                hodSnapshot.val();


            // =====================================
            // VERIFY ROLE
            // =====================================

            if (
                normalizeValue(
                    hod.role
                ) !== "hod"
            ) {

                alert(
                    "This account is not authorized as HOD."
                );

                await signOut(auth);

                window.location.replace(
                    LOGIN_PAGE
                );

                return;
            }


            // =====================================
            // DISPLAY HOD NAME
            // =====================================

            if (hodName) {

                hodName.textContent =
                    hod.name || "HOD";

            }


            // =====================================
            // GET HOD DEPARTMENT
            // =====================================

            currentHodDepartment =
                String(
                    hod.department || ""
                )
                .trim();


            if (!currentHodDepartment) {

                alert(
                    "Department is not assigned to this HOD."
                );

                return;
            }


            // =====================================
            // DISPLAY HOD DEPARTMENT
            // =====================================

            if (hodDepartment) {

                hodDepartment.textContent =
                    currentHodDepartment +
                    " Department";

            }


            console.log(
                "Logged-in HOD:",
                hod.name
            );


            console.log(
                "HOD Department:",
                currentHodDepartment
            );


            // =====================================
            // LOAD RESOLVERS
            // =====================================

            await loadResolvers();


            // =====================================
            // LOAD COMPLAINTS
            // =====================================

            if (!complaintsListenerStarted) {

                complaintsListenerStarted =
                    true;

                loadComplaints();

            }

        }

        catch (error) {

            console.error(
                "HOD Verification Error:",
                error
            );


            if (complaintContainer) {

                complaintContainer.innerHTML = `

                    <div class="no-data">

                        Unable to verify HOD account.

                    </div>

                `;

            }

        }

    }
);


// =====================================================
// LOAD RESOLVERS
// =====================================================

async function loadResolvers() {

    try {

        const resolverSnapshot =
            await get(

                ref(
                    database,
                    "resolverUsers"
                )

            );


        resolverMap = {};


        if (!resolverSnapshot.exists()) {

            console.log(
                "No resolver accounts found."
            );

            return;
        }


        resolverSnapshot.forEach(

            function (childSnapshot) {

                const resolver =
                    childSnapshot.val();


                // Only resolver accounts

                if (
                    normalizeValue(
                        resolver.role
                    ) !== "resolver"
                ) {

                    return;

                }


                if (!resolver.resolverType) {

                    return;

                }


                // -------------------------------------
                // CATEGORY → RESOLVER
                //
                // Electrical → Electrician
                // Plumbing   → Plumber
                // -------------------------------------

                resolverMap[
                    normalizeValue(
                        resolver.resolverType
                    )
                ] =
                    resolver.name ||
                    "Resolver";

            }

        );


        console.log(
            "Resolver Map:",
            resolverMap
        );

    }

    catch (error) {

        console.error(
            "Resolver Loading Error:",
            error
        );

    }

}


// =====================================================
// LOAD COMPLAINTS
// =====================================================

function loadComplaints() {

    const complaintsRef =
        ref(
            database,
            "complaints"
        );


    onValue(

        complaintsRef,


        // =============================================
        // SUCCESS
        // =============================================

        function (snapshot) {

            complaintList = [];


            // -----------------------------------------
            // NO COMPLAINTS
            // -----------------------------------------

            if (!snapshot.exists()) {

                displayComplaints([]);

                updateSummary();

                return;

            }


            // -----------------------------------------
            // READ COMPLAINTS
            // -----------------------------------------

            snapshot.forEach(

                function (childSnapshot) {

                    const complaint =
                        childSnapshot.val();


                    // =================================
                    // GET COMPLAINT DEPARTMENT
                    // =================================

                    const complaintDepartment =

                        complaint.department ||

                        complaint.assignedDepartment ||

                        "";


                    console.log(
                        "Complaint:",
                        childSnapshot.key,
                        "Department:",
                        complaintDepartment
                    );


                    // =================================
                    // ONLY CURRENT HOD DEPARTMENT
                    // =================================

                    if (
                        normalizeValue(
                            complaintDepartment
                        )
                        ===
                        normalizeValue(
                            currentHodDepartment
                        )
                    ) {

                        complaintList.push({

                            firebaseKey:
                                childSnapshot.key,

                            ...complaint

                        });

                    }

                }

            );


            // =========================================
            // NEWEST COMPLAINT FIRST
            // =========================================

            complaintList.sort(

                function (a, b) {

                    return (

                        new Date(
                            b.createdAt || 0
                        )

                        -

                        new Date(
                            a.createdAt || 0
                        )

                    );

                }

            );


            console.log(
                "Complaints for",
                currentHodDepartment,
                ":",
                complaintList
            );


            // =========================================
            // DISPLAY
            // =========================================

            displayComplaints(
                complaintList
            );


            // =========================================
            // SUMMARY
            // =========================================

            updateSummary();

        },


        // =============================================
        // ERROR
        // =============================================

        function (error) {

            console.error(
                "Complaint Read Error:",
                error
            );


            if (complaintContainer) {

                complaintContainer.innerHTML = `

                    <div class="no-data">

                        Unable to load complaints.

                    </div>

                `;

            }

        }

    );

}


// =====================================================
// DISPLAY COMPLAINTS
// =====================================================

function displayComplaints(
    complaints
) {

    if (!complaintContainer) {

        console.error(
            "complaintContainer not found in HTML."
        );

        return;

    }


    complaintContainer.innerHTML =
        "";


    // =================================================
    // NO COMPLAINT
    // =================================================

    if (complaints.length === 0) {

        complaintContainer.innerHTML = `

            <div class="no-data">

                No complaints found for
                ${escapeHTML(
                    currentHodDepartment
                )}
                Department.

            </div>

        `;

        return;

    }


    // =================================================
    // CREATE COMPLAINT 1, 2, 3...
    // =================================================

    complaints.forEach(

        function (
            complaint,
            index
        ) {

            createComplaintCard(
                complaint,
                index
            );

        }

    );

}


// =====================================================
// CREATE COMPLAINT CARD
// =====================================================

function createComplaintCard(
    complaint,
    index
) {

    // =================================================
    // TRACKING ID
    // =================================================

    const complaintID =

        complaint.trackingID ||

        complaint.complaintID ||

        complaint.firebaseKey ||

        "-";


    // =================================================
    // DEPARTMENT
    // =================================================

    const complaintDepartment =

        complaint.department ||

        complaint.assignedDepartment ||

        "-";


    // =================================================
    // DATE
    // =================================================

    let formattedDate =
        "-";


    if (complaint.createdAt) {

        const date =
            new Date(
                complaint.createdAt
            );


        if (
            !isNaN(
                date.getTime()
            )
        ) {

            formattedDate =
                date.toLocaleString();

        }

    }


    // =================================================
    // STATUS
    // =================================================

    const status =
        normalizeValue(
            complaint.status
        );


    let displayStatus =
        complaint.status ||
        "Pending";


    let statusClass =
        "status-pending";


    if (
        status ===
        "in progress"
    ) {

        displayStatus =
            "In Progress";

        statusClass =
            "status-progress";

    }


    else if (
        status === "completed" ||
        status === "resolved" ||
        status === "fixed"
    ) {

        displayStatus =
            "Resolved";

        statusClass =
            "status-resolved";

    }


    // =================================================
    // RESOLVER
    // =================================================

    let assignedResolverName =
        "Not Assigned";


    // Saved resolver name

    if (
        complaint.assignedResolverName &&
        normalizeValue(
            complaint.assignedResolverName
        ) !== "not assigned" &&
        normalizeValue(
            complaint.assignedResolverName
        ) !== "pending ai assignment"
    ) {

        assignedResolverName =
            complaint.assignedResolverName;

    }


    // Old resolver field

    else if (
        complaint.assignedResolver &&
        normalizeValue(
            complaint.assignedResolver
        ) !== "not assigned" &&
        normalizeValue(
            complaint.assignedResolver
        ) !== "pending ai assignment"
    ) {

        assignedResolverName =
            complaint.assignedResolver;

    }


    // Find from category

    else {

        const category =
            normalizeValue(
                complaint.category
            );


        if (resolverMap[category]) {

            assignedResolverName =
                resolverMap[category];

        }

    }


    // =================================================
    // CREATE CARD
    // =================================================

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "complaint-card";


    card.innerHTML = `

        <!-- ==========================================
             ONLY COMPLAINT NAME VISIBLE INITIALLY
        =========================================== -->

        <div class="complaint-title">


            <span>

                <i class="fa-solid fa-file-lines"></i>

                Complaint ${index + 1}

            </span>


            <i
                class="fa-solid fa-chevron-down complaint-arrow">
            </i>


        </div>


        <!-- ==========================================
             DETAILS HIDDEN INITIALLY
        =========================================== -->

        <div class="complaint-full-details">


            <div class="complaint-details">


                <!-- TRACKING ID -->

                <div class="detail-item">

                    <strong>
                        Tracking ID:
                    </strong>

                    <span class="tracking-value">

                        ${escapeHTML(
                            complaintID
                        )}

                    </span>

                </div>


                <!-- DEPARTMENT -->

                <div class="detail-item">

                    <strong>
                        Department:
                    </strong>

                    ${escapeHTML(
                        complaintDepartment
                    )}

                </div>


                <!-- CATEGORY -->

                <div class="detail-item">

                    <strong>
                        Category:
                    </strong>

                    ${escapeHTML(
                        complaint.category ||
                        "-"
                    )}

                </div>


                <!-- LOCATION -->

                <div class="detail-item">

                    <strong>
                        Location:
                    </strong>

                    ${escapeHTML(
                        complaint.location ||
                        "-"
                    )}

                </div>


                <!-- SUBJECT -->

                <div class="detail-item">

                    <strong>
                        Subject:
                    </strong>

                    ${escapeHTML(
                        complaint.subject ||
                        "-"
                    )}

                </div>


                <!-- STATUS -->

                <div class="detail-item">

                    <strong>
                        Status:
                    </strong>


                    <span
                        class="status ${statusClass}">

                        ${escapeHTML(
                            displayStatus
                        )}

                    </span>

                </div>


                <!-- ASSIGNED RESOLVER -->

                <div class="detail-item">

                    <strong>
                        Assigned To:
                    </strong>

                    ${escapeHTML(
                        assignedResolverName
                    )}

                </div>


                <!-- DATE -->

                <div class="detail-item">

                    <strong>
                        Date:
                    </strong>

                    ${escapeHTML(
                        formattedDate
                    )}

                </div>


            </div>


            <!-- ======================================
                 DESCRIPTION
            ======================================= -->

            <div class="description-box">

                <strong>
                    Complaint Description
                </strong>


                <p>

                    ${escapeHTML(
                        complaint.description ||
                        "-"
                    )}

                </p>

            </div>


        </div>

    `;


    // =================================================
    // ADD CARD
    // =================================================

    complaintContainer.appendChild(
        card
    );


    // =================================================
    // ELEMENTS
    // =================================================

    const title =
        card.querySelector(
            ".complaint-title"
        );


    const details =
        card.querySelector(
            ".complaint-full-details"
        );


    const arrow =
        card.querySelector(
            ".complaint-arrow"
        );


    // =================================================
    // CLICK COMPLAINT 1 / 2 / 3
    // =================================================

    title.addEventListener(

        "click",

        function () {

            const alreadyOpen =
                details.classList.contains(
                    "active"
                );


            // =========================================
            // CLOSE ALL OTHER COMPLAINT DETAILS
            // =========================================

            document
                .querySelectorAll(
                    ".complaint-full-details.active"
                )
                .forEach(

                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }

                );


            // =========================================
            // REMOVE ACTIVE TITLES
            // =========================================

            document
                .querySelectorAll(
                    ".complaint-title.active"
                )
                .forEach(

                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }

                );


            // =========================================
            // RESET ALL ARROWS
            // =========================================

            document
                .querySelectorAll(
                    ".complaint-arrow"
                )
                .forEach(

                    function (icon) {

                        icon.className =
                            "fa-solid fa-chevron-down complaint-arrow";

                    }

                );


            // =========================================
            // OPEN SELECTED COMPLAINT
            // =========================================

            if (!alreadyOpen) {

                details.classList.add(
                    "active"
                );


                title.classList.add(
                    "active"
                );


                arrow.className =
                    "fa-solid fa-chevron-up complaint-arrow";

            }

        }

    );

}


// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary() {

    if (totalComplaints) {

        totalComplaints.textContent =
            complaintList.length;

    }


    let pending =
        0;

    let progress =
        0;

    let resolved =
        0;


    complaintList.forEach(

        function (complaint) {

            const status =
                normalizeValue(
                    complaint.status
                );


            // PENDING

            if (
                status === "" ||
                status === "pending"
            ) {

                pending++;

            }


            // IN PROGRESS

            else if (
                status ===
                "in progress"
            ) {

                progress++;

            }


            // RESOLVED

            else if (
                status === "completed" ||
                status === "resolved" ||
                status === "fixed"
            ) {

                resolved++;

            }

        }

    );


    if (pendingComplaints) {

        pendingComplaints.textContent =
            pending;

    }


    if (progressComplaints) {

        progressComplaints.textContent =
            progress;

    }


    if (resolvedComplaints) {

        resolvedComplaints.textContent =
            resolved;

    }

}


// =====================================================
// SEARCH
// =====================================================

if (searchComplaint) {

    searchComplaint.addEventListener(

        "input",

        function () {

            const search =
                normalizeValue(
                    searchComplaint.value
                );


            const filtered =
                complaintList.filter(

                    function (complaint) {


                        // ---------------------------------
                        // TRACKING ID
                        // ---------------------------------

                        const complaintID =
                            normalizeValue(

                                complaint.trackingID ||

                                complaint.complaintID ||

                                complaint.firebaseKey ||

                                ""

                            );


                        // ---------------------------------
                        // DEPARTMENT
                        // ---------------------------------

                        const department =
                            normalizeValue(

                                complaint.department ||

                                complaint.assignedDepartment ||

                                ""

                            );


                        // ---------------------------------
                        // CATEGORY
                        // ---------------------------------

                        const category =
                            normalizeValue(
                                complaint.category
                            );


                        // ---------------------------------
                        // LOCATION
                        // ---------------------------------

                        const location =
                            normalizeValue(
                                complaint.location
                            );


                        // ---------------------------------
                        // SUBJECT
                        // ---------------------------------

                        const subject =
                            normalizeValue(
                                complaint.subject
                            );


                        // ---------------------------------
                        // DESCRIPTION
                        // ---------------------------------

                        const description =
                            normalizeValue(
                                complaint.description
                            );


                        // ---------------------------------
                        // RESOLVER
                        // ---------------------------------

                        const resolver =
                            normalizeValue(

                                complaint.assignedResolverName ||

                                complaint.assignedResolver ||

                                ""

                            );


                        // ---------------------------------
                        // SEARCH
                        // ---------------------------------

                        return (

                            complaintID.includes(
                                search
                            )

                            ||

                            department.includes(
                                search
                            )

                            ||

                            category.includes(
                                search
                            )

                            ||

                            location.includes(
                                search
                            )

                            ||

                            subject.includes(
                                search
                            )

                            ||

                            description.includes(
                                search
                            )

                            ||

                            resolver.includes(
                                search
                            )

                        );

                    }

                );


            displayComplaints(
                filtered
            );

        }

    );

}


// =====================================================
// LOGOUT
// =====================================================

if (logoutButton) {

    logoutButton.addEventListener(

        "click",

        async function () {

            try {

                logoutButton.disabled =
                    true;


                await signOut(
                    auth
                );


                window.location.replace(
                    LOGIN_PAGE
                );

            }

            catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                logoutButton.disabled =
                    false;


                alert(
                    "Unable to logout."
                );

            }

        }

    );

}


// =====================================================
// NORMALIZE VALUE
// =====================================================

function normalizeValue(value) {

    return String(
        value || ""
    )
    .trim()
    .toLowerCase();

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

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