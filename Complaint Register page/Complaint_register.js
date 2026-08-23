// ==========================================
// FIREBASE IMPORTS
// ==========================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {
    getDatabase,
    ref,
    set,
    get,
    runTransaction
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

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
        "1:128793473217:web:0d662396adb995cba92440",

    measurementId:
        "G-SRD822XEM0"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app =
    initializeApp(firebaseConfig);

const database =
    getDatabase(app);


console.log(
    "Firebase Realtime Database connected successfully"
);


// ==========================================
// NORMALIZE VALUE
// ==========================================

function normalizeValue(value) {

    return String(
        value || ""
    )
    .trim()
    .toLowerCase();
}


// ==========================================
// FIND RESOLVER BY CATEGORY
// ==========================================

async function findResolverByCategory(category) {

    try {

        const resolverSnapshot =
            await get(
                ref(
                    database,
                    "resolverUsers"
                )
            );


        if (!resolverSnapshot.exists()) {

            console.log(
                "No resolver accounts found."
            );

            return null;
        }


        let matchedResolver =
            null;


        resolverSnapshot.forEach(
            function (childSnapshot) {

                const resolver =
                    childSnapshot.val();


                const resolverRole =
                    normalizeValue(
                        resolver.role
                    );


                const resolverType =
                    normalizeValue(
                        resolver.resolverType
                    );


                const complaintCategory =
                    normalizeValue(
                        category
                    );


                if (
                    resolverRole === "resolver" &&
                    resolverType === complaintCategory
                ) {

                    matchedResolver = {

                        uid:
                            childSnapshot.key,

                        name:
                            resolver.name ||
                            "Resolver",

                        email:
                            resolver.email ||
                            "",

                        resolverType:
                            resolver.resolverType ||
                            category
                    };
                }
            }
        );


        console.log(
            "Selected Category:",
            category
        );


        console.log(
            "Matched Resolver:",
            matchedResolver
        );


        return matchedResolver;

    }

    catch (error) {

        console.error(
            "Resolver Lookup Error:",
            error
        );

        return null;
    }
}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",

    function () {


        // ======================================
        // ELEMENTS
        // ======================================

        const complaintForm =
            document.getElementById(
                "complaintForm"
            );


        const formBox =
            document.getElementById(
                "formBox"
            );


        const successBox =
            document.getElementById(
                "successBox"
            );


        const tickCircle =
            document.getElementById(
                "tickCircle"
            );


        const trackingSection =
            document.getElementById(
                "trackingSection"
            );


        const complaintIDElement =
            document.getElementById(
                "complaintID"
            );


        const copyButton =
            document.getElementById(
                "copyButton"
            );


        const anotherComplaint =
            document.getElementById(
                "anotherComplaint"
            );


        const submitButton =
            document.getElementById(
                "submitButton"
            );


        if (
            !complaintForm ||
            !formBox ||
            !successBox ||
            !complaintIDElement ||
            !submitButton
        ) {

            console.error(
                "Required complaint register HTML elements are missing."
            );

            return;
        }


        // ======================================
        // TRACKING ID
        //
        // CMP2608230001
        // CMP2608230002
        // ======================================

        async function generateTrackingID() {

            const now =
                new Date();


            const year =
                String(
                    now.getFullYear()
                )
                .slice(-2);


            const month =
                String(
                    now.getMonth() + 1
                )
                .padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    now.getDate()
                )
                .padStart(
                    2,
                    "0"
                );


            const dateCode =
                year +
                month +
                day;


            // DAILY FIREBASE COUNTER

            const counterRef =
                ref(
                    database,
                    "complaintCounters/" +
                    dateCode
                );


            const result =
                await runTransaction(
                    counterRef,

                    function (currentValue) {

                        return (
                            currentValue || 0
                        ) + 1;
                    }
                );


            const serialNumber =
                String(
                    result.snapshot.val()
                )
                .padStart(
                    4,
                    "0"
                );


            return (
                "CMP" +
                dateCode +
                serialNumber
            );
        }


        // ======================================
        // SUBMIT COMPLAINT
        // ======================================

        complaintForm.addEventListener(
            "submit",

            async function (event) {

                event.preventDefault();


                // ==================================
                // VALUES
                // ==================================

                const department =
                    document
                        .getElementById(
                            "department"
                        )
                        .value;


                const category =
                    document
                        .getElementById(
                            "category"
                        )
                        .value;


                const location =
                    document
                        .getElementById(
                            "location"
                        )
                        .value
                        .trim();


                const subject =
                    document
                        .getElementById(
                            "subject"
                        )
                        .value
                        .trim();


                const description =
                    document
                        .getElementById(
                            "description"
                        )
                        .value
                        .trim();


                const fileInput =
                    document.getElementById(
                        "file"
                    );


                // ==================================
                // VALIDATION
                // ==================================

                if (
                    department === "" ||
                    category === "" ||
                    location === "" ||
                    subject === "" ||
                    description === ""
                ) {

                    alert(
                        "Please fill all required complaint details."
                    );

                    return;
                }


                // ==================================
                // LOADING BUTTON
                // ==================================

                submitButton.disabled =
                    true;


                submitButton.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';


                try {

                    // ==================================
                    // GENERATE CMP ID
                    // ==================================

                    const trackingID =
                        await generateTrackingID();


                    // ==================================
                    // FILE NAME
                    // ==================================

                    let supportingFile =
                        "";


                    if (
                        fileInput &&
                        fileInput.files &&
                        fileInput.files.length > 0
                    ) {

                        supportingFile =
                            fileInput
                                .files[0]
                                .name;
                    }


                    // ==================================
                    // DATE
                    // ==================================

                    const currentTime =
                        new Date()
                            .toISOString();


                    // ==================================
                    // CATEGORY → RESOLVER
                    // ==================================

                    const assignedResolver =
                        await findResolverByCategory(
                            category
                        );


                    // ==================================
                    // COMPLAINT OBJECT
                    // ==================================

                    const complaint = {

                        trackingID:
                            trackingID,


                        // Department → HOD

                        department:
                            department,


                        // Category → Resolver

                        category:
                            category,


                        location:
                            location,


                        subject:
                            subject,


                        description:
                            description,


                        supportingFile:
                            supportingFile,


                        status:
                            "Pending",


                        assignedResolver:
                            assignedResolver
                                ? assignedResolver.name
                                : "Not Assigned",


                        assignedResolverName:
                            assignedResolver
                                ? assignedResolver.name
                                : "Not Assigned",


                        assignedResolverUID:
                            assignedResolver
                                ? assignedResolver.uid
                                : "",


                        assignedResolverEmail:
                            assignedResolver
                                ? assignedResolver.email
                                : "",


                        assignedResolverType:
                            assignedResolver
                                ? assignedResolver.resolverType
                                : category,


                        // HOD routing

                        assignedDepartment:
                            department,


                        createdAt:
                            currentTime,


                        updatedAt:
                            currentTime
                    };


                    // ==================================
                    // SAVE COMPLAINT TO FIREBASE
                    // ==================================

                    const complaintRef =
                        ref(
                            database,
                            "complaints/" +
                            trackingID
                        );


                    await set(
                        complaintRef,
                        complaint
                    );


                    console.log(
                        "Complaint saved successfully:",
                        complaint
                    );


                    // ==================================
                    // IMPORTANT:
                    // SUCCESS ONLY AFTER FIREBASE SAVE
                    // ==================================


                    // SHOW GENERATED CMP ID

                    complaintIDElement.textContent =
                        trackingID;


                    // HIDE FORM

                    formBox.style.display =
                        "none";


                    // SHOW SUCCESS BOX

                    successBox.style.display =
                        "block";


                    // RESET TICK

                    if (tickCircle) {

                        tickCircle
                            .classList
                            .remove(
                                "tick-animation"
                            );


                        // Force browser animation reset

                        void tickCircle.offsetWidth;
                    }


                    // RESET TRACKING ANIMATION

                    if (trackingSection) {

                        trackingSection
                            .classList
                            .remove(
                                "tracking-show"
                            );
                    }


                    // HIDE COPY BUTTON INITIALLY

                    if (copyButton) {

                        copyButton.style.display =
                            "none";
                    }


                    // ==================================
                    // STEP 1:
                    // GREEN TICK ANIMATION
                    // ==================================

                    setTimeout(
                        function () {

                            if (tickCircle) {

                                tickCircle
                                    .classList
                                    .add(
                                        "tick-animation"
                                    );
                            }

                        },
                        100
                    );


                    // ==================================
                    // STEP 2:
                    // SHOW CMP TRACKING ID
                    // ==================================

                    setTimeout(
                        function () {

                            if (trackingSection) {

                                trackingSection
                                    .classList
                                    .add(
                                        "tracking-show"
                                    );
                            }


                            if (copyButton) {

                                copyButton.style.display =
                                    "inline-block";
                            }

                        },
                        700
                    );


                    // ==================================
                    // SCROLL TO SUCCESS
                    // ==================================

                    successBox.scrollIntoView(
                        {

                            behavior:
                                "smooth",

                            block:
                                "start"
                        }
                    );

                }

                catch (error) {

                    console.error(
                        "Firebase Complaint Error:",
                        error
                    );


                    alert(
                        "Complaint could not be submitted.\n\n" +
                        error.message
                    );
                }

                finally {

                    submitButton.disabled =
                        false;


                    submitButton.innerHTML =
                        '<i class="fa-solid fa-paper-plane"></i> Submit Complaint';
                }
            }
        );


        // ======================================
        // COPY TRACKING ID
        // ======================================

        if (copyButton) {

            copyButton.addEventListener(
                "click",

                async function () {

                    const trackingID =
                        complaintIDElement
                            .textContent;


                    try {

                        await navigator
                            .clipboard
                            .writeText(
                                trackingID
                            );


                        copyButton.innerHTML =
                            '<i class="fa-solid fa-check"></i> Copied';


                        setTimeout(
                            function () {

                                copyButton.innerHTML =
                                    '<i class="fa-solid fa-copy"></i> Copy Tracking ID';

                            },
                            2000
                        );

                    }

                    catch (error) {

                        alert(
                            "Tracking ID: " +
                            trackingID
                        );
                    }
                }
            );
        }


        // ======================================
        // REGISTER ANOTHER COMPLAINT
        // ======================================

        if (anotherComplaint) {

            anotherComplaint.addEventListener(
                "click",

                function () {

                    // RESET FORM

                    complaintForm.reset();


                    // CLEAR OLD CMP ID

                    complaintIDElement.textContent =
                        "";


                    // HIDE SUCCESS

                    successBox.style.display =
                        "none";


                    // SHOW FORM

                    formBox.style.display =
                        "block";


                    // REMOVE TICK ANIMATION

                    if (tickCircle) {

                        tickCircle
                            .classList
                            .remove(
                                "tick-animation"
                            );
                    }


                    // REMOVE TRACKING ANIMATION

                    if (trackingSection) {

                        trackingSection
                            .classList
                            .remove(
                                "tracking-show"
                            );
                    }


                    // HIDE COPY BUTTON

                    if (copyButton) {

                        copyButton.style.display =
                            "none";

                        copyButton.innerHTML =
                            '<i class="fa-solid fa-copy"></i> Copy Tracking ID';
                    }


                    // GO TO TOP

                    window.scrollTo(
                        {

                            top:
                                0,

                            behavior:
                                "smooth"
                        }
                    );
                }
            );
        }

    }
);