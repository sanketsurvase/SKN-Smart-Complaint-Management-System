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
    get,
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
// DASHBOARD PATH
// =====================================================

const DASHBOARD_PAGE =
    "../Resolver Dashboard/Resolver_dashboard.html";


// =====================================================
// HTML ELEMENTS
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
// SHOW / HIDE PASSWORD
// =====================================================

if (
    toggleLoginPassword
) {

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

if (
    forgotPassword
) {

    forgotPassword.addEventListener(
        "click",

        async function (event) {

            event.preventDefault();


            // =================================================
            // GET EMAIL
            // =================================================

            const email =
                loginEmail.value
                    .trim()
                    .toLowerCase();


            // =================================================
            // CLEAR OLD MESSAGE
            // =================================================

            loginMessage.className =
                "message";

            loginMessage.textContent =
                "";


            // =================================================
            // EMPTY EMAIL CHECK
            // =================================================

            if (
                email === ""
            ) {

                loginMessage.className =
                    "message error";


                loginMessage.textContent =
                    "Please enter your registered Resolver email first.";


                loginEmail.focus();


                return;

            }


            // =================================================
            // OFFICIAL EMAIL CHECK
            // =================================================

            if (
                !email.endsWith(
                    "@sknscoe.ac.in"
                )
            ) {

                loginMessage.className =
                    "message error";


                loginMessage.textContent =
                    "Please enter your official @sknscoe.ac.in Resolver email.";


                loginEmail.focus();


                return;

            }


            // =================================================
            // START CHECKING
            // =================================================

            forgotPassword.style.pointerEvents =
                "none";


            forgotPassword.style.opacity =
                "0.6";


            forgotPassword.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';


            try {

                // =================================================
                // CHECK EMAIL IN resolverUsers
                // =================================================

                const resolverEmailQuery =
                    query(

                        ref(
                            database,
                            "resolverUsers"
                        ),

                        orderByChild(
                            "email"
                        ),

                        equalTo(
                            email
                        )

                    );


                const emailSnapshot =
                    await get(
                        resolverEmailQuery
                    );


                // =================================================
                // EMAIL NOT FOUND
                // =================================================

                if (
                    !emailSnapshot.exists()
                ) {

                    loginMessage.className =
                        "message error";


                    loginMessage.textContent =
                        "This Resolver email is not registered in the database.";


                    return;

                }


                // =================================================
                // CHECK RESOLVER ROLE
                // =================================================

                let validResolver =
                    false;


                emailSnapshot.forEach(
                    function (childSnapshot) {

                        const resolverData =
                            childSnapshot.val();


                        if (
                            normalizeValue(
                                resolverData.role
                            ) === "resolver"
                        ) {

                            validResolver =
                                true;

                        }

                    }
                );


                // =================================================
                // NOT A RESOLVER
                // =================================================

                if (
                    !validResolver
                ) {

                    loginMessage.className =
                        "message error";


                    loginMessage.textContent =
                        "This email is not registered as a Resolver.";


                    return;

                }


                // =================================================
                // SEND RESET EMAIL
                // =================================================

                forgotPassword.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';


                await sendPasswordResetEmail(
                    auth,
                    email
                );


                // =================================================
                // SUCCESS
                // =================================================

                loginMessage.className =
                    "message success";


                loginMessage.textContent =
                    "Password reset link has been sent to your registered email. Please check your inbox.";

            }


            catch (error) {

                console.error(
                    "Resolver Password Reset Error:",
                    error
                );


                loginMessage.className =
                    "message error";


                // =================================================
                // INVALID EMAIL
                // =================================================

                if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    loginMessage.textContent =
                        "Please enter a valid email address.";

                }


                // =================================================
                // TOO MANY REQUESTS
                // =================================================

                else if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    loginMessage.textContent =
                        "Too many password reset attempts. Please try again later.";

                }


                // =================================================
                // NETWORK ERROR
                // =================================================

                else if (
                    error.code ===
                    "auth/network-request-failed"
                ) {

                    loginMessage.textContent =
                        "Network error. Please check your internet connection.";

                }


                // =================================================
                // OTHER ERROR
                // =================================================

                else {

                    loginMessage.textContent =
                        "Unable to check the Resolver email or send the password reset email.";

                }

            }


            finally {

                // =================================================
                // RESTORE FORGOT PASSWORD LINK
                // =================================================

                forgotPassword.style.pointerEvents =
                    "auto";


                forgotPassword.style.opacity =
                    "1";


                forgotPassword.innerHTML =
                    '<i class="fa-solid fa-key"></i> Forgot Password?';

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


        // =================================================
        // GET LOGIN VALUES
        // =================================================

        const email =
            loginEmail.value
                .trim()
                .toLowerCase();


        const password =
            loginPassword.value;


        // =================================================
        // CLEAR OLD MESSAGE
        // =================================================

        loginMessage.className =
            "message";


        loginMessage.textContent =
            "";


        // =================================================
        // EMPTY CHECK
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
        // OFFICIAL EMAIL CHECK
        // =================================================

        if (
            !email.endsWith(
                "@sknscoe.ac.in"
            )
        ) {

            showLoginError(
                "Only official @sknscoe.ac.in Resolver accounts are allowed."
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
            // KEEP LOGIN UNTIL LOGOUT
            // =================================================

            await setPersistence(
                auth,
                browserLocalPersistence
            );


            // =================================================
            // FIREBASE AUTH LOGIN
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
                "Resolver authentication successful:",
                user.uid
            );


            // =================================================
            // READ RESOLVER PROFILE
            // =================================================

            const resolverSnapshot =
                await get(
                    ref(
                        database,
                        "resolverUsers/" +
                        user.uid
                    )
                );


            // =================================================
            // PROFILE REQUIRED
            // =================================================

            if (
                !resolverSnapshot.exists()
            ) {

                await signOut(
                    auth
                );


                clearResolverCache();


                showLoginError(
                    "Resolver profile not found."
                );


                return;

            }


            const resolver =
                resolverSnapshot.val();


            // =================================================
            // ROLE CHECK
            // =================================================

            if (
                normalizeValue(
                    resolver.role
                ) !== "resolver"
            ) {

                await signOut(
                    auth
                );


                clearResolverCache();


                showLoginError(
                    "Access denied. Resolver authorization required."
                );


                return;

            }


            // =================================================
            // RESOLVER TYPE CHECK
            // =================================================

            if (
                !resolver.resolverType ||
                resolver.resolverType
                    .trim() === ""
            ) {

                await signOut(
                    auth
                );


                clearResolverCache();


                showLoginError(
                    "Resolver Type is not configured."
                );


                return;

            }


            // =================================================
            // RESOLVER NAME CHECK
            // =================================================

            if (
                !resolver.name ||
                resolver.name.trim() === ""
            ) {

                await signOut(
                    auth
                );


                clearResolverCache();


                showLoginError(
                    "Resolver name is not configured."
                );


                return;

            }


            // =================================================
            // CACHE RESOLVER DETAILS
            // =================================================

            localStorage.setItem(
                "resolverUID",
                user.uid
            );


            localStorage.setItem(
                "resolverName",
                resolver.name
            );


            localStorage.setItem(
                "resolverType",
                resolver.resolverType
            );


            localStorage.setItem(
                "resolverEmail",
                resolver.email ||
                email
            );


            // =================================================
            // LOGIN SUCCESS
            // =================================================

            loginMessage.textContent =
                "Login successful. Opening Resolver Dashboard...";


            loginMessage.classList.add(
                "success"
            );


            // =================================================
            // REDIRECT
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
// CLEAR RESOLVER CACHE
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