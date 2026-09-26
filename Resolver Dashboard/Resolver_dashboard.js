// =====================================================
// RESOLVER DASHBOARD
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
    onValue,
    update,
    query,
    orderByChild,
    equalTo
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

const auth =
    getAuth(app);

const database =
    getDatabase(app);


// =====================================================
// DATABASE CONNECTIVITY MONITOR
// =====================================================

const connectedRef =
    ref(database, ".info/connected");

onValue(
    connectedRef,
    function (snapshot) {
        if (snapshot.val() === true) {
            console.log("Firebase Realtime Database: Connected successfully.");
        } else {
            console.warn("Firebase Realtime Database: Disconnected / Retrying...");
        }
    }
);


// =====================================================
// LOGIN PAGE
// =====================================================

const LOGIN_PAGE =
    "../Resolver Login/Resolver_login.html";


// =====================================================
// HTML ELEMENTS
// =====================================================

const resolverName =
    document.getElementById(
        "resolverName"
    );

const resolverTypeText =
    document.getElementById(
        "resolverTypeText"
    );

const resolverEmailText =
    document.getElementById(
        "resolverEmailText"
    );

const complaintContainer =
    document.getElementById(
        "complaintContainer"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const searchComplaint =
    document.getElementById(
        "searchComplaint"
    );

const totalComplaints =
    document.getElementById(
        "totalComplaints"
    );

const pendingComplaints =
    document.getElementById(
        "pendingComplaints"
    );

const fixedComplaints =
    document.getElementById(
        "fixedComplaints"
    );


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let currentResolverType =
    localStorage.getItem(
        "resolverType"
    ) || "";

let currentResolverName =
    localStorage.getItem(
        "resolverName"
    ) || "";

let currentResolverEmail =
    localStorage.getItem(
        "resolverEmail"
    ) || "";

let currentResolverUID =
    localStorage.getItem(
        "resolverUID"
    ) || "";

let resolverComplaintList = [];

let complaintsListenerStarted =
    false;

let stopComplaintListener =
    null;


// =====================================================
// DISPLAY CACHED INFORMATION
// =====================================================

if (
    resolverName &&
    currentResolverName
) {

    resolverName.textContent =
        currentResolverName;
}


if (
    resolverTypeText &&
    currentResolverType
) {

    resolverTypeText.textContent =
        currentResolverType;
}


if (
    resolverEmailText &&
    currentResolverEmail
) {

    resolverEmailText.textContent =
        currentResolverEmail;
}


// =====================================================
// PROTECT DASHBOARD
// =====================================================

onAuthStateChanged(
    auth,

    async function (user) {

        if (!user) {

            clearResolverCache();

            window.location.replace(
                LOGIN_PAGE
            );

            return;
        }


        // =================================================
        // FAST LOAD FROM CACHE
        // =================================================

        if (
            currentResolverUID === user.uid &&
            currentResolverType !== "" &&
            !complaintsListenerStarted
        ) {

            complaintsListenerStarted =
                true;

            loadComplaints();
        }


        if (
            !currentResolverType &&
            complaintContainer
        ) {

            complaintContainer.innerHTML = `

                <div class="loading-box">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading your complaints...

                </div>

            `;
        }


        try {

            // =================================================
            // READ RESOLVER PROFILE (resolverUsers/<uid>)
            // =================================================

            const resolverRef = ref(
                database,
                "resolverUsers/" + user.uid
            );

            let snapshot = await get(resolverRef);
            let resolverData = null;

            if (snapshot.exists()) {
                resolverData = cleanObjectKeys(snapshot.val());
            } else if (user.email) {
                // Fallback: Check resolverUsers by email if Auth UID differs from database key
                console.warn(
                    "Resolver UID not found directly in resolverUsers. Checking by email:",
                    user.email
                );

                const emailQuery = query(
                    ref(database, "resolverUsers"),
                    orderByChild("email"),
                    equalTo(user.email.toLowerCase())
                );

                const emailSnapshot = await get(emailQuery);

                if (emailSnapshot.exists()) {
                    emailSnapshot.forEach(function (child) {
                        resolverData = cleanObjectKeys(child.val());
                        currentResolverUID = child.key;
                    });
                }
            }

            if (!resolverData) {
                console.error(
                    "Resolver profile not found for UID:",
                    user.uid,
                    "or email:",
                    user.email
                );

                alert(
                    "Resolver profile not found in database for this account."
                );

                clearResolverCache();

                await signOut(auth);

                window.location.replace(
                    LOGIN_PAGE
                );

                return;
            }

            // =================================================
            // ROLE CHECK
            // =================================================

            const rawRole =
                resolverData.role ||
                resolverData.Role ||
                resolverData.userRole ||
                resolverData.resolverRole ||
                "";

            const role =
                normalizeValue(rawRole);

            const resolverType =
                String(
                    resolverData.resolverType ||
                    resolverData.ResolverType ||
                    ""
                ).trim();

            const isAuthorizedResolver = (
                role === "resolver" ||
                role.includes("resolver") ||
                (resolverType !== "" && role === normalizeValue(resolverType)) ||
                resolverType !== ""
            );

            if (!isAuthorizedResolver) {
                console.error(
                    "Account is not registered as a Resolver:",
                    rawRole
                );

                alert(
                    "Access denied. Resolver authorization required."
                );

                clearResolverCache();

                await signOut(auth);

                window.location.replace(
                    LOGIN_PAGE
                );

                return;
            }

            // =================================================
            // TYPE CHECK
            // =================================================

            if (resolverType === "") {
                console.error(
                    "Resolver Type is not configured."
                );

                alert(
                    "Resolver category/type is not configured for your account."
                );

                return;
            }

            const previousResolverType =
                currentResolverType;

            currentResolverUID =
                user.uid;

            currentResolverName =
                (
                    resolverData.name ||
                    resolverData.resolverName ||
                    resolverData.displayName ||
                    "Resolver"
                ).trim();

            currentResolverType =
                resolverData.resolverType.trim();

            currentResolverEmail =
                (
                    resolverData.email ||
                    user.email ||
                    ""
                ).trim();


            // =================================================
            // DISPLAY RESOLVER INFO
            // =================================================

            if (resolverName) {

                resolverName.textContent =
                    currentResolverName;
            }


            if (resolverTypeText) {

                resolverTypeText.textContent =
                    currentResolverType;
            }


            if (
                resolverEmailText &&
                currentResolverEmail
            ) {

                resolverEmailText.textContent =
                    currentResolverEmail;
            }


            // =================================================
            // SAVE CACHE
            // =================================================

            localStorage.setItem(
                "resolverUID",
                currentResolverUID
            );

            localStorage.setItem(
                "resolverName",
                currentResolverName
            );

            localStorage.setItem(
                "resolverType",
                currentResolverType
            );

            localStorage.setItem(
                "resolverEmail",
                currentResolverEmail
            );


            console.log(
                "Authenticated Resolver:",
                currentResolverName,
                "| Type:",
                currentResolverType,
                "| Email:",
                currentResolverEmail
            );


            // =================================================
            // LOAD COMPLAINTS
            // =================================================

            if (
                !complaintsListenerStarted
            ) {

                complaintsListenerStarted =
                    true;

                loadComplaints();
            }


            else if (
                previousResolverType &&
                normalizeValue(
                    previousResolverType
                )
                !==
                normalizeValue(
                    currentResolverType
                )
            ) {

                if (
                    typeof stopComplaintListener ===
                    "function"
                ) {

                    stopComplaintListener();
                }


                loadComplaints();
            }

        }

        catch (error) {

            console.error(
                "Resolver Verification Error:",
                error
            );


            if (
                !currentResolverType &&
                complaintContainer
            ) {

                complaintContainer.innerHTML = `

                    <div class="no-data">

                        Unable to verify Resolver information.

                        <br><br>

                        Please check your internet and database connection.

                    </div>

                `;
            }
        }
    }
);


// =====================================================
// LOAD COMPLAINTS
// =====================================================

function loadComplaints() {

    if (
        !currentResolverType ||
        currentResolverType.trim() === ""
    ) {

        console.error(
            "Cannot load complaints because Resolver Type is empty."
        );

        return;
    }


    if (
        typeof stopComplaintListener ===
        "function"
    ) {

        stopComplaintListener();
    }


    // =================================================
    // COMPLAINTS REF (REAL-TIME LISTENER)
    // Matches category, assignedResolverType, or assignedResolverUID
    // =================================================

    const complaintsRef =
        ref(
            database,
            "complaints"
        );


    stopComplaintListener =
        onValue(
            complaintsRef,

            function (snapshot) {

                resolverComplaintList =
                    [];


                if (
                    !snapshot.exists()
                ) {

                    displayComplaints([]);

                    updateSummary();

                    return;
                }


                const targetType =
                    normalizeValue(
                        currentResolverType
                    );


                snapshot.forEach(
                    function (
                        childSnapshot
                    ) {

                        const complaint =
                            cleanObjectKeys(
                                childSnapshot.val()
                            );

                        const complaintCategory =
                            normalizeValue(
                                complaint.category
                            );

                        const assignedType =
                            normalizeValue(
                                complaint.assignedResolverType
                            );

                        const assignedUID =
                            complaint.assignedResolverUID ||
                            "";


                        // Match category, assignedResolverType, or assigned UID
                        if (
                            complaintCategory === targetType ||
                            assignedType === targetType ||
                            (assignedUID && assignedUID === currentResolverUID)
                        ) {

                            resolverComplaintList.push(
                                {

                                    firebaseKey:
                                        childSnapshot.key,

                                    ...complaint

                                }
                            );
                        }

                    }
                );


                // =================================================
                // NEWEST FIRST
                // =================================================

                resolverComplaintList.sort(
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


                displayComplaints(
                    resolverComplaintList
                );


                updateSummary();
            },


            function (error) {

                console.error(
                    "Complaint Read Error:",
                    error
                );


                if (
                    complaintContainer
                ) {

                    complaintContainer.innerHTML = `

                        <div class="no-data">

                            Unable to retrieve complaints.

                            <br><br>

                            ${escapeHTML(
                                error.message ||
                                "Database query failed."
                            )}

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

    complaintContainer.innerHTML =
        "";


    if (
        complaints.length === 0
    ) {

        complaintContainer.innerHTML = `

            <div class="no-data">

                No ${escapeHTML(
                    currentResolverType
                )} complaints are currently available.

            </div>

        `;

        return;
    }


    complaints.forEach(
        function (
            complaint,
            index
        ) {

            createComplaintCard(
                complaint,
                index + 1
            );

        }
    );
}


// =====================================================
// CREATE COMPLAINT CARD
// =====================================================

function createComplaintCard(
    complaint,
    complaintNumber
) {

    // =================================================
    // COMPLAINT ID
    // =================================================

    const complaintID =

        complaint.trackingID ||

        complaint.complaintID ||

        complaint.firebaseKey ||

        "-";


    // =================================================
    // STATUS
    // =================================================

    const status =
        complaint.status ||
        "Pending";


    // =================================================
    // DEPARTMENT
    // =================================================

    const complaintDepartment =

        complaint.department ||

        complaint.assignedDepartment ||

        "Not Specified";


    // =================================================
    // SUBMITTED DATE
    // =================================================

    let submittedDate =
        "-";


    if (
        complaint.createdAt
    ) {

        const date =
            new Date(
                complaint.createdAt
            );


        if (
            !isNaN(
                date.getTime()
            )
        ) {

            submittedDate =
                date.toLocaleString();

        }

    }


    // =================================================
    // UPDATED DATE
    // =================================================

    let updatedDate =
        "-";


    if (
        complaint.updatedAt
    ) {

        const date =
            new Date(
                complaint.updatedAt
            );


        if (
            !isNaN(
                date.getTime()
            )
        ) {

            updatedDate =
                date.toLocaleString();

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

        <!-- =========================================
             COMPLAINT NO.
        ========================================== -->

        <div class="complaint-title">


            <div class="complaint-number">

                <i class="fa-solid fa-file-lines"></i>

                Complaint No. ${complaintNumber}

            </div>


            <div class="complaint-title-right">


                <span
                    class="status ${getStatusClass(
                        status
                    )}">

                    ${escapeHTML(
                        status
                    )}

                </span>


                <i
                    class="fa-solid fa-chevron-down complaint-arrow">
                </i>


            </div>


        </div>


        <!-- =========================================
             FULL DETAILS
        ========================================== -->

        <div
            class="complaint-full-details"
            style="display:none;">


            <!-- COMPLAINT ID -->

            <div class="complaint-id-row">

                <strong>
                    Complaint ID:
                </strong>

                <span class="tracking-id">

                    ${escapeHTML(
                        complaintID
                    )}

                </span>

            </div>


            <!-- DETAILS -->

            <div class="complaint-details">


                <!-- DEPARTMENT -->

                <div class="detail-item">

                    <strong>
                        Department:
                    </strong>

                    <span class="department-name">

                        ${escapeHTML(
                            complaintDepartment
                        )}

                    </span>

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


                <!-- SUBMITTED -->

                <div class="detail-item">

                    <strong>
                        Submitted:
                    </strong>

                    ${escapeHTML(
                        submittedDate
                    )}

                </div>


                <!-- LAST UPDATED -->

                <div class="detail-item">

                    <strong>
                        Last Updated:
                    </strong>

                    ${escapeHTML(
                        updatedDate
                    )}

                </div>


            </div>


            <!-- =========================================
                 DESCRIPTION
            ========================================== -->

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


            <!-- =========================================
                 STATUS UPDATE
            ========================================== -->

            <div class="status-update-box">

                <label>

                    <strong>
                        Complaint Status:
                    </strong>

                </label>


                <select class="status-select">


                    <option
                        value="Pending"
                        ${
                            normalizeValue(
                                status
                            ) === "pending"

                            ? "selected"

                            : ""
                        }>

                        Pending

                    </option>


                    <option
                        value="In Progress"
                        ${
                            normalizeValue(
                                status
                            ) === "in progress"

                            ? "selected"

                            : ""
                        }>

                        In Progress

                    </option>


                    <option
                        value="Completed"
                        ${
                            (
                                normalizeValue(
                                    status
                                ) === "completed"

                                ||

                                normalizeValue(
                                    status
                                ) === "resolved"

                                ||

                                normalizeValue(
                                    status
                                ) === "fixed"
                            )

                            ? "selected"

                            : ""
                        }>

                        Completed

                    </option>


                </select>


                <button
                    type="button"
                    class="update-status-btn">

                    <i class="fa-solid fa-floppy-disk"></i>

                    Update Status

                </button>


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

    const complaintTitle =
        card.querySelector(
            ".complaint-title"
        );


    const complaintDetails =
        card.querySelector(
            ".complaint-full-details"
        );


    const complaintArrow =
        card.querySelector(
            ".complaint-arrow"
        );


    const statusSelect =
        card.querySelector(
            ".status-select"
        );


    const updateButton =
        card.querySelector(
            ".update-status-btn"
        );


    // =================================================
    // OPEN / CLOSE COMPLAINT
    // =================================================

    complaintTitle.addEventListener(
        "click",

        function () {

            const isOpen =
                complaintDetails.style.display ===
                "block";


            if (isOpen) {

                complaintDetails.style.display =
                    "none";


                complaintTitle.classList.remove(
                    "active"
                );


                complaintArrow.className =
                    "fa-solid fa-chevron-down complaint-arrow";

            }

            else {

                complaintDetails.style.display =
                    "block";


                complaintTitle.classList.add(
                    "active"
                );


                complaintArrow.className =
                    "fa-solid fa-chevron-up complaint-arrow";

            }

        }
    );


    // =================================================
    // STOP DROPDOWN FROM TOGGLING CARD
    // =================================================

    statusSelect.addEventListener(
        "click",

        function (event) {

            event.stopPropagation();

        }
    );


    // =================================================
    // UPDATE STATUS
    // =================================================

    updateButton.addEventListener(
        "click",

        async function (event) {

            event.stopPropagation();


            await updateComplaintStatus(

                complaint.firebaseKey,

                statusSelect.value,

                updateButton

            );

        }
    );

}


// =====================================================
// UPDATE COMPLAINT STATUS
// =====================================================

async function updateComplaintStatus(
    complaintKey,
    newStatus,
    button
) {

    try {

        button.disabled =
            true;


        button.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';


        const snapshot =
            await get(
                ref(
                    database,
                    "complaints/" +
                    complaintKey
                )
            );


        if (
            !snapshot.exists()
        ) {

            throw new Error(
                "Complaint not found."
            );
        }


        const complaint =
            cleanObjectKeys(
                snapshot.val()
            );


        // =================================================
        // SECURITY CHECK
        // =================================================

        const targetType =
            normalizeValue(
                currentResolverType
            );

        const matchesCategory =
            normalizeValue(
                complaint.category
            ) === targetType;

        const matchesResolverUID =
            Boolean(
                complaint.assignedResolverUID &&
                complaint.assignedResolverUID === currentResolverUID
            );

        const matchesResolverType =
            normalizeValue(
                complaint.assignedResolverType
            ) === targetType;

        if (
            !matchesCategory &&
            !matchesResolverUID &&
            !matchesResolverType
        ) {

            throw new Error(
                "You are not allowed to update this complaint."
            );
        }


        // =================================================
        // UPDATE FIREBASE
        // =================================================

        await update(
            ref(
                database,
                "complaints/" +
                complaintKey
            ),

            {

                status:
                    newStatus,

                updatedAt:
                    new Date()
                        .toISOString(),

                assignedResolver:
                    currentResolverName,

                assignedResolverName:
                    currentResolverName,

                assignedResolverUID:
                    currentResolverUID,

                assignedResolverType:
                    currentResolverType

            }
        );


        button.innerHTML =
            '<i class="fa-solid fa-check"></i> Updated';


        setTimeout(
            function () {

                button.disabled =
                    false;


                button.innerHTML =
                    '<i class="fa-solid fa-floppy-disk"></i> Update Status';

            },

            1000
        );

    }

    catch (error) {

        console.error(
            "Status Update Error:",
            error
        );


        button.disabled =
            false;


        button.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Update Status';


        alert(
            error.message ||
            "Unable to update complaint."
        );
    }
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
        value === "completed" ||
        value === "resolved" ||
        value === "fixed"
    ) {

        return "status-completed";
    }


    if (
        value ===
        "in progress"
    ) {

        return "status-progress";
    }


    return "status-pending";
}


// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary() {

    if (
        totalComplaints
    ) {

        totalComplaints.textContent =
            resolverComplaintList.length;
    }


    // =================================================
    // PENDING
    // =================================================

    const pending =
        resolverComplaintList.filter(
            function (complaint) {

                const status =
                    normalizeValue(
                        complaint.status
                    );


                return (
                    status === "" ||
                    status === "pending"
                );
            }
        ).length;


    if (
        pendingComplaints
    ) {

        pendingComplaints.textContent =
            pending;
    }


    // =================================================
    // COMPLETED
    // =================================================

    const completed =
        resolverComplaintList.filter(
            function (complaint) {

                const status =
                    normalizeValue(
                        complaint.status
                    );


                return (
                    status === "completed" ||
                    status === "resolved" ||
                    status === "fixed"
                );
            }
        ).length;


    if (
        fixedComplaints
    ) {

        fixedComplaints.textContent =
            completed;
    }
}


// =====================================================
// SEARCH
// =====================================================

if (
    searchComplaint
) {

    searchComplaint.addEventListener(
        "input",

        function () {

            const search =
                normalizeValue(
                    searchComplaint.value
                );


            const filtered =
                resolverComplaintList.filter(
                    function (complaint) {


                        const complaintID =
                            normalizeValue(

                                complaint.trackingID ||

                                complaint.complaintID ||

                                complaint.firebaseKey

                            );


                        // =================================================
                        // DEPARTMENT
                        // =================================================

                        const department =
                            normalizeValue(

                                complaint.department ||

                                complaint.assignedDepartment ||

                                ""

                            );


                        const category =
                            normalizeValue(
                                complaint.category
                            );


                        const location =
                            normalizeValue(
                                complaint.location
                            );


                        const subject =
                            normalizeValue(
                                complaint.subject
                            );


                        const description =
                            normalizeValue(
                                complaint.description
                            );


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

if (
    logoutButton
) {

    logoutButton.addEventListener(
        "click",

        async function () {

            try {

                logoutButton.disabled =
                    true;


                if (
                    typeof stopComplaintListener ===
                    "function"
                ) {

                    stopComplaintListener();
                }


                clearResolverCache();


                await signOut(
                    auth
                );


                window.location.replace(
                    LOGIN_PAGE
                );

            }

            catch (error) {

                logoutButton.disabled =
                    false;


                console.error(
                    "Logout Error:",
                    error
                );


                alert(
                    "Unable to logout."
                );
            }
        }
    );
}


// =====================================================
// CLEAR CACHE
// =====================================================

function clearResolverCache() {

    localStorage.removeItem(
        "resolverUID"
    );

    localStorage.removeItem(
        "resolverName"
    );

    localStorage.removeItem(
        "resolverType"
    );

    localStorage.removeItem(
        "resolverEmail"
    );
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
// CLEAN OBJECT KEYS (TRIM SPACES FROM KEYS & VALUES)
// =====================================================

function cleanObjectKeys(rawObj) {

    if (!rawObj || typeof rawObj !== "object") {
        return {};
    }

    const cleaned = {};

    for (const [key, value] of Object.entries(rawObj)) {
        const cleanKey = key.trim();
        cleaned[cleanKey] = (typeof value === "string") ? value.trim() : value;
    }

    return cleaned;

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