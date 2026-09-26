// ==========================================================================
// SKN SINHGAD COLLEGE OF ENGINEERING - AI GRIEVANCE REDRESSAL SYSTEM
// File: home.js
// Purpose: Interactive features, quick grievance tracking, FAQ accordion,
//          workflow switcher, and institutional UX enhancements.
// ==========================================================================

document.addEventListener("DOMContentLoaded", function () {
    // ----------------------------------------------------------------------
    // 1. WELCOME LOG & INSTITUTIONAL CONSOLE BANNER
    // ----------------------------------------------------------------------
    const studentName = "Mr. Sanket Survase";
    console.log(
        "%c SKN Sinhgad College of Engineering %c AI Grievance Redressal Portal ",
        "background: #0a1c3d; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 3px 0 0 3px;",
        "background: #2563eb; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 0 3px 3px 0;"
    );
    console.log("Portal Initialized for: " + studentName);

    // ----------------------------------------------------------------------
    // 2. QUICK GRIEVANCE TRACKER FORM
    // ----------------------------------------------------------------------
    const quickTrackForm = document.getElementById("quickTrackForm");
    const quickTrackInput = document.getElementById("quickTrackInput");
    const quickTrackError = document.getElementById("quickTrackError");

    if (quickTrackForm && quickTrackInput) {
        quickTrackForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const trackId = quickTrackInput.value.trim();

            if (!trackId) {
                showQuickTrackError("Please enter your Tracking ID.");
                quickTrackInput.focus();
                return;
            }

            // Clean error if any
            if (quickTrackError) {
                quickTrackError.textContent = "";
                quickTrackError.classList.remove("visible");
            }

            // Save to sessionStorage and navigate with query parameter
            try {
                sessionStorage.setItem("pendingTrackId", trackId);
            } catch (err) {
                console.warn("Session storage inaccessible:", err);
            }

            window.location.href = "../status/Status.html?id=" + encodeURIComponent(trackId);
        });

        // Hide error as user types
        quickTrackInput.addEventListener("input", function () {
            if (quickTrackError && quickTrackError.classList.contains("visible")) {
                quickTrackError.textContent = "";
                quickTrackError.classList.remove("visible");
            }
        });
    }

    function showQuickTrackError(msg) {
        if (quickTrackError) {
            quickTrackError.textContent = msg;
            quickTrackError.classList.add("visible");
        } else {
            alert(msg);
        }
    }

    // ----------------------------------------------------------------------
    // 3. WORKFLOW TABS (ROADMAP vs SLA MATRIX TABLE)
    // ----------------------------------------------------------------------
    const workflowTabs = document.querySelectorAll(".workflow-tab");
    const workflowContents = document.querySelectorAll(".workflow-content");

    workflowTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            const targetId = this.getAttribute("data-target");

            // Update active state on tab buttons
            workflowTabs.forEach(function (t) {
                t.classList.remove("active");
            });
            this.classList.add("active");

            // Show matched content section
            workflowContents.forEach(function (content) {
                if (content.id === targetId) {
                    content.classList.add("active");
                } else {
                    content.classList.remove("active");
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 4. FREQUENTLY ASKED QUESTIONS (ACCORDION)
    // ----------------------------------------------------------------------
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(function (item) {
        const questionBtn = item.querySelector(".faq-question");

        if (questionBtn) {
            questionBtn.addEventListener("click", function () {
                const isActive = item.classList.contains("active");

                // Close other open items for clean accordion UX
                faqItems.forEach(function (otherItem) {
                    if (otherItem !== item) {
                        otherItem.classList.remove("active");
                        const otherBtn = otherItem.querySelector(".faq-question");
                        if (otherBtn) {
                            otherBtn.setAttribute("aria-expanded", "false");
                        }
                    }
                });

                // Toggle the clicked question
                if (isActive) {
                    item.classList.remove("active");
                    questionBtn.setAttribute("aria-expanded", "false");
                } else {
                    item.classList.add("active");
                    questionBtn.setAttribute("aria-expanded", "true");
                }
            });
        }
    });

    // ----------------------------------------------------------------------
    // 5. MOBILE NAVIGATION TOGGLE
    // ----------------------------------------------------------------------
    const navToggle = document.getElementById("navToggle");
    const siteNav = document.getElementById("siteNav");

    if (navToggle && siteNav) {
        navToggle.addEventListener("click", function () {
            const isOpen = siteNav.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            const icon = navToggle.querySelector("i");
            if (icon) {
                icon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
            }
        });

        // Close mobile nav when clicking a link
        const navLinks = siteNav.querySelectorAll("a");
        navLinks.forEach(function (link) {
            link.addEventListener("click", function () {
                siteNav.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
                const icon = navToggle.querySelector("i");
                if (icon) {
                    icon.className = "fa-solid fa-bars";
                }
            });
        });
    }

    // ----------------------------------------------------------------------
    // 6. STICKY HEADER SCROLL SHADOW & BACK TO TOP BUTTON
    // ----------------------------------------------------------------------
    const siteHeader = document.getElementById("siteHeader");
    const backToTopBtn = document.getElementById("backToTop");

    window.addEventListener("scroll", function () {
        const scrollPos = window.scrollY;

        // Sticky header shadow
        if (siteHeader) {
            if (scrollPos > 30) {
                siteHeader.classList.add("scrolled");
            } else {
                siteHeader.classList.remove("scrolled");
            }
        }

        // Back to top appearance
        if (backToTopBtn) {
            if (scrollPos > 350) {
                backToTopBtn.classList.add("visible");
            } else {
                backToTopBtn.classList.remove("visible");
            }
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
});

// ==========================================================================
// 7. GLOBAL REDIRECT HELPERS (FOR INLINE ONCLICK CALLS)
// ==========================================================================
function openRegisterComplaint() {
    window.location.href = "../Complaint Register page/Complaint_register.html";
}

function openComplaintStatus() {
    window.location.href = "../status/Status.html";
}

window.openRegisterComplaint = openRegisterComplaint;
window.openComplaintStatus = openComplaintStatus;