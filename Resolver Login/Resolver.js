// =====================================================
// RESOLVER LOGIN
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
    sendPasswordResetEmail,
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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);


// =====================================================
// DASHBOARD PATH
// =====================================================

const DASHBOARD_PAGE =
    "../Resolver Dashboard/Resolver_dashboard.html";


// =====================================================
// HTML ELEMENTS
// =====================================================

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginMessage =
    document.getElementById("loginMessage");

const loginButton =
    document.getElementById("loginButton");

const toggleLoginPassword =
    document.getElementById("toggleLoginPassword");

const forgotPassword =
    document.getElementById("forgotPassword");


// =====================================================
// NORMALIZE VALUE
// =====================================================

function normalizeValue(value) {

    return String(value || "")
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
// SHOW ERROR
// =====================================================

function showLoginError(message) {

    loginMessage.className = "message error";

    loginMessage.textContent = message;

}


// =====================================================
// SHOW SUCCESS
// =====================================================

function showLoginSuccess(message) {

    loginMessage.className = "message success";

    loginMessage.textContent = message;

}


// =====================================================
// CLEAR RESOLVER DATA
// =====================================================

function clearResolverCache() {

    localStorage.removeItem("resolverUID");
    localStorage.removeItem("resolverName");
    localStorage.removeItem("resolverType");
    localStorage.removeItem("resolverEmail");

}


// =====================================================
// SHOW / HIDE PASSWORD
// =====================================================

if (toggleLoginPassword) {

    toggleLoginPassword.addEventListener(
        "click",
        function () {

            if (loginPassword.type === "password") {

                loginPassword.type = "text";

                toggleLoginPassword.innerHTML =
                    '<i class="fa-solid fa-eye-slash"></i>';

            }

            else {

                loginPassword.type = "password";

                toggleLoginPassword.innerHTML =
                    '<i class="fa-solid fa-eye"></i>';

            }

        }
    );

}


// =====================================================
// RESOLVER LOGIN
// =====================================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ---------------------------------------------
        // GET EMAIL AND PASSWORD
        // ---------------------------------------------

        const email =
            loginEmail.value
                .trim()
                .toLowerCase();

        const password =
            loginPassword.value;


        loginMessage.className = "message";

        loginMessage.textContent = "";


        // ---------------------------------------------
        // EMPTY CHECK
        // ---------------------------------------------

        if (
            email === "" ||
            password === ""
        ) {

            showLoginError(
                "Please enter email and password."
            );

            return;
        }


        // ---------------------------------------------
        // COLLEGE EMAIL CHECK
        // ---------------------------------------------

        if (
            !email.endsWith("@sknscoe.ac.in")
        ) {

            showLoginError(
                "Only official @sknscoe.ac.in Resolver accounts are allowed."
            );

            return;
        }


        // ---------------------------------------------
        // DISABLE BUTTON
        // ---------------------------------------------

        loginButton.disabled = true;

        loginButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';


        try {

            // =========================================
            // LOGIN PERSISTENCE
            // =========================================

            await setPersistence(
                auth,
                browserLocalPersistence
            );


            // =========================================
            // FIREBASE AUTHENTICATION
            // =========================================

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            console.log(
                "Authentication successful."
            );

            console.log(
                "UID:",
                user.uid
            );


            // =========================================
            // GET RESOLVER PROFILE
            // =========================================

            const resolverReference =
                ref(
                    database,
                    "resolverUsers/" + user.uid
                );


            const snapshot =
                await get(
                    resolverReference
                );


            // =========================================
            // PROFILE DOES NOT EXIST
            // =========================================

            if (!snapshot.exists()) {

                console.error(
                    "Resolver profile not found."
                );

                await signOut(auth);

                clearResolverCache();

                showLoginError(
                    "Resolver profile not found."
                );

                return;
            }


            // =========================================
            // GET RESOLVER DATA
            // =========================================

            const rawData =
                snapshot.val();

            const resolverData =
                cleanObjectKeys(
                    rawData
                );


            console.log(
                "Resolver Raw Data:",
                rawData
            );

            console.log(
                "Cleaned Resolver Data:",
                resolverData
            );


            console.log(
                "Resolver Role:",
                resolverData.role
            );


            console.log(
                "Resolver Type:",
                resolverData.resolverType
            );


            // =========================================
            // CHECK ROLE
            // =========================================

            const rawRole =
                resolverData.role ||
                resolverData.Role ||
                resolverData.userRole ||
                resolverData.resolverRole ||
                "";

            const role =
                normalizeValue(
                    rawRole
                );

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
                    "Invalid Resolver role:",
                    rawRole,
                    "Resolver Data:",
                    resolverData
                );

                await signOut(auth);

                clearResolverCache();

                showLoginError(
                    "Access denied. Resolver authorization required."
                );

                return;
            }


            // =========================================
            // CHECK RESOLVER TYPE
            // =========================================

            if (resolverType === "") {

                await signOut(auth);

                clearResolverCache();

                showLoginError(
                    "Resolver Type is not configured in database."
                );

                return;
            }


            // =========================================
            // CHECK NAME
            // =========================================

            const resolverName =
                String(
                    resolverData.name ||
                    resolverData.resolverName ||
                    resolverData.displayName ||
                    "Resolver"
                ).trim();


            // =========================================
            // OPTIONAL EMAIL VERIFICATION
            // =========================================

            const databaseEmail =
                normalizeValue(
                    resolverData.email
                );


            if (
                databaseEmail &&
                databaseEmail !== email
            ) {

                await signOut(auth);

                clearResolverCache();

                showLoginError(
                    "Resolver email does not match the registered account."
                );

                return;
            }


            // =========================================
            // SAVE RESOLVER INFORMATION
            // =========================================

            localStorage.setItem(
                "resolverUID",
                user.uid
            );


            localStorage.setItem(
                "resolverName",
                resolverName
            );


            localStorage.setItem(
                "resolverType",
                resolverType
            );


            localStorage.setItem(
                "resolverEmail",
                resolverData.email || email
            );


            // =========================================
            // LOGIN SUCCESS
            // =========================================

            console.log(
                "Resolver Authorized Successfully"
            );


            showLoginSuccess(
                "Login successful. Opening Resolver Dashboard..."
            );


            // =========================================
            // REDIRECT
            // =========================================

            setTimeout(
                function () {

                    window.location.href =
                        DASHBOARD_PAGE;

                },
                500
            );

        }


        // =================================================
        // ERRORS
        // =================================================

        catch (error) {

            console.error(
                "Resolver Login Error:",
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
                    "This Resolver account has been disabled."
                );

            }


            else if (
                error.code ===
                "auth/too-many-requests"
            ) {

                showLoginError(
                    "Too many login attempts. Please try again later."
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


            else if (
                error.code ===
                "PERMISSION_DENIED" ||
                String(error.message)
                    .includes("PERMISSION_DENIED")
            ) {

                showLoginError(
                    "Database permission denied. Check Firebase Database Rules."
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
        // ENABLE BUTTON
        // =================================================

        finally {

            loginButton.disabled = false;

            loginButton.innerHTML =
                '<i class="fa-solid fa-right-to-bracket"></i> Login';

        }

    }
);


// =====================================================
// FORGOT PASSWORD
// =====================================================

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            const email =
                loginEmail.value
                    .trim()
                    .toLowerCase();


            if (email === "") {

                showLoginError(
                    "Please enter your Resolver email first."
                );

                loginEmail.focus();

                return;
            }


            if (
                !email.endsWith("@sknscoe.ac.in")
            ) {

                showLoginError(
                    "Please enter a valid @sknscoe.ac.in email."
                );

                return;
            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                showLoginSuccess(
                    "Password reset link has been sent to your email."
                );

            }

            catch (error) {

                console.error(
                    "Password Reset Error:",
                    error
                );


                if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    showLoginError(
                        "Invalid email address."
                    );

                }

                else if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    showLoginError(
                        "Too many requests. Try again later."
                    );

                }

                else {

                    showLoginError(
                        "Unable to send password reset email."
                    );

                }

            }

        }
    );

}