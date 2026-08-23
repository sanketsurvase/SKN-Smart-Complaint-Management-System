// =====================================================
// HOD LOGIN
// SMART COMPLAINT MANAGEMENT SYSTEM
// =====================================================


// =====================================================
// FIREBASE IMPORTS
// =====================================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserLocalPersistence
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    getDatabase,
    ref,
    get
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


console.log(
    "Firebase connected successfully"
);


// =====================================================
// DASHBOARD PAGE
// =====================================================

const DASHBOARD_PAGE =
    "../HOD Dashboard/HOD_dashboard.html";


// =====================================================
// GET HTML ELEMENTS
// =====================================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


const loginEmail =
    document.getElementById(
        "loginEmail"
    );


const loginPassword =
    document.getElementById(
        "loginPassword"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );


const loginButton =
    document.getElementById(
        "loginButton"
    );


const toggleLoginPassword =
    document.getElementById(
        "toggleLoginPassword"
    );


const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );


// =====================================================
// SHOW / HIDE PASSWORD
// =====================================================

if (toggleLoginPassword) {

    toggleLoginPassword.addEventListener(
        "click",

        function () {

            if (
                loginPassword.type ===
                "password"
            ) {

                loginPassword.type =
                    "text";


                toggleLoginPassword.innerHTML =
                    '<i class="fa-solid fa-eye-slash"></i>';

            }

            else {

                loginPassword.type =
                    "password";


                toggleLoginPassword.innerHTML =
                    '<i class="fa-solid fa-eye"></i>';
            }
        }
    );
}


// =====================================================
// FORGOT PASSWORD
// =====================================================
// We will connect this to Firebase Password Reset later.
// =====================================================

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",

        function (event) {

            event.preventDefault();


            loginMessage.className =
                "message";


            loginMessage.textContent =
                "Forgot Password feature will be available soon.";
        }
    );
}


// =====================================================
// HOD LOGIN
// =====================================================

loginForm.addEventListener(
    "submit",

    async function (event) {

        event.preventDefault();


        // =================================================
        // GET LOGIN DETAILS
        // =================================================

        const email =
            loginEmail.value
                .trim()
                .toLowerCase();


        const password =
            loginPassword.value;


        // =================================================
        // RESET MESSAGE
        // =================================================

        loginMessage.className =
            "message";


        loginMessage.textContent =
            "";


        // =================================================
        // EMPTY FIELD CHECK
        // =================================================

        if (
            email === "" ||
            password === ""
        ) {

            showLoginError(
                "Please enter email and password."
            );

            return;
        }


        // =================================================
        // OFFICIAL COLLEGE EMAIL CHECK
        // =================================================

        if (
            !email.endsWith(
                "@sknscoe.ac.in"
            )
        ) {

            showLoginError(
                "Only official @sknscoe.ac.in HOD accounts are allowed."
            );

            return;
        }


        // =================================================
        // DISABLE LOGIN BUTTON
        // =================================================

        loginButton.disabled =
            true;


        loginButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';


        try {

            // =================================================
            // KEEP HOD LOGGED IN
            // =================================================
            // Login remains active even after refresh/reopening
            // until Logout is pressed.
            // =================================================

            await setPersistence(
                auth,
                browserLocalPersistence
            );


            // =================================================
            // FIREBASE AUTHENTICATION
            // =================================================

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            console.log(
                "Authentication successful:",
                user.uid
            );


            // =================================================
            // GET HOD PROFILE
            // =================================================

            const snapshot =
                await get(
                    ref(
                        database,
                        "users/" +
                        user.uid
                    )
                );


            // =================================================
            // HOD PROFILE MUST EXIST
            // =================================================

            if (
                !snapshot.exists()
            ) {

                await signOut(
                    auth
                );


                clearHODCache();


                showLoginError(
                    "HOD profile not found."
                );


                return;
            }


            const userData =
                snapshot.val();


            console.log(
                "HOD Profile:",
                userData
            );


            // =================================================
            // CHECK HOD ROLE
            // =================================================

            if (
                normalizeValue(
                    userData.role
                ) !== "hod"
            ) {

                await signOut(
                    auth
                );


                clearHODCache();


                showLoginError(
                    "Access denied. HOD authorization required."
                );


                return;
            }


            // =================================================
            // CHECK HOD NAME
            // =================================================

            if (
                !userData.name ||
                userData.name.trim() === ""
            ) {

                await signOut(
                    auth
                );


                clearHODCache();


                showLoginError(
                    "HOD name is not configured."
                );


                return;
            }


            // =================================================
            // CHECK DEPARTMENT
            // =================================================

            if (
                !userData.department ||
                userData.department.trim() === ""
            ) {

                await signOut(
                    auth
                );


                clearHODCache();


                showLoginError(
                    "HOD department is not configured."
                );


                return;
            }


            // =================================================
            // SAVE HOD INFORMATION LOCALLY
            // =================================================
            // This allows the dashboard to display the
            // HOD information immediately.
            // =================================================

            localStorage.setItem(
                "hodUID",
                user.uid
            );


            localStorage.setItem(
                "hodName",
                userData.name
            );


            localStorage.setItem(
                "hodDepartment",
                userData.department
            );


            localStorage.setItem(
                "hodEmail",
                userData.email ||
                email
            );


            // =================================================
            // LOGIN SUCCESS
            // =================================================

            loginMessage.textContent =
                "Login successful. Opening dashboard...";


            loginMessage.classList.add(
                "success"
            );


            // =================================================
            // OPEN HOD DASHBOARD
            // =================================================

            setTimeout(
                function () {

                    window.location.replace(
                        DASHBOARD_PAGE
                    );

                },

                200
            );
        }


        // =================================================
        // LOGIN ERROR
        // =================================================

        catch (error) {

            console.error(
                "HOD Login Error:",
                error
            );


            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                showLoginError(
                    "Invalid email or password."
                );
            }


            else if (
                error.code ===
                "auth/invalid-email"
            ) {

                showLoginError(
                    "Invalid email address."
                );
            }


            else if (
                error.code ===
                "auth/user-disabled"
            ) {

                showLoginError(
                    "This HOD account has been disabled."
                );
            }


            else if (
                error.code ===
                "auth/too-many-requests"
            ) {

                showLoginError(
                    "Too many login attempts. Try again later."
                );
            }


            else if (
                error.code ===
                "auth/network-request-failed"
            ) {

                showLoginError(
                    "Network error. Check your internet connection."
                );
            }


            else {

                showLoginError(
                    "Login failed: " +
                    (
                        error.code ||
                        error.message
                    )
                );
            }
        }


        // =================================================
        // ENABLE LOGIN BUTTON
        // =================================================

        finally {

            loginButton.disabled =
                false;


            loginButton.innerHTML =
                '<i class="fa-solid fa-right-to-bracket"></i> Login';
        }
    }
);


// =====================================================
// SHOW LOGIN ERROR
// =====================================================

function showLoginError(
    message
) {

    loginMessage.className =
        "message error";


    loginMessage.textContent =
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
// CLEAR HOD CACHE
// =====================================================

function clearHODCache() {

    localStorage.removeItem(
        "hodUID"
    );


    localStorage.removeItem(
        "hodName"
    );


    localStorage.removeItem(
        "hodDepartment"
    );


    localStorage.removeItem(
        "hodEmail"
    );
}