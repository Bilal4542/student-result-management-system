/*
   Student Result Management System
   Shared interface behavior for the Phase 2 through Phase 4 modules.
*/

(function () {
  "use strict";

  function showToast(message, type) {
    var region = document.querySelector("[data-toast-region]");
    if (!region) {
      return;
    }

    var toast = document.createElement("div");
    toast.className = "toast" + (type ? " " + type : "");
    toast.setAttribute("role", "status");
    toast.textContent = message;
    region.appendChild(toast);

    window.setTimeout(function () {
      toast.remove();
    }, 3600);
  }

  function setupSidebar() {
    var sidebar = document.querySelector("[data-sidebar]");
    var menuButton = document.querySelector("[data-menu-button]");
    var overlay = document.querySelector("[data-overlay]");

    if (!sidebar || !menuButton) {
      return;
    }

    function closeSidebar() {
      sidebar.classList.remove("is-open");
      if (overlay) {
        overlay.classList.remove("is-visible");
      }
      menuButton.setAttribute("aria-expanded", "false");
    }

    menuButton.addEventListener("click", function () {
      var isOpen = sidebar.classList.toggle("is-open");
      if (overlay) {
        overlay.classList.toggle("is-visible", isOpen);
      }
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    if (overlay) {
      overlay.addEventListener("click", closeSidebar);
    }

    sidebar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 860) {
          closeSidebar();
        }
      });
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) {
        closeSidebar();
      }
    });
  }

  function setupLogout() {
    document.querySelectorAll("[data-logout]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        window.sessionStorage.removeItem("srmsDemoUser");
        window.location.href = "index.html";
      });
    });
  }

  function setupPlaceholderActions() {
    document.querySelectorAll("[data-demo-action]").forEach(function (element) {
      var tagName = element.tagName.toLowerCase();

      if (tagName === "input") {
        return;
      }

      if (tagName === "select") {
        element.addEventListener("change", function () {
          showToast("Filtering will be connected in a later SRMS phase.", "warning");
        });
        return;
      }

      element.addEventListener("click", function (event) {
        if (tagName === "a" && element.getAttribute("href") !== "#") {
          return;
        }
        event.preventDefault();
        showToast("This interface is prepared for a later SRMS phase.", "warning");
      });
    });
  }

  function setupDemoLogin() {
    var form = document.querySelector("[data-login-form]");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var username = form.querySelector("[name='username']");
      var password = form.querySelector("[name='password']");
      var feedback = form.querySelector("[data-login-feedback]");

      if (!username.value.trim() || !password.value.trim()) {
        if (feedback) {
          feedback.textContent = "Please enter both username and password.";
          feedback.className = "form-error";
        }
        return;
      }

      if (username.value.trim() !== "admin" || password.value !== "admin123") {
        if (feedback) {
          feedback.textContent = "Demo login: use admin and admin123.";
          feedback.className = "form-error";
        }
        return;
      }

      window.sessionStorage.setItem("srmsDemoUser", "Administrator");
      window.location.href = "dashboard.html";
    });
  }

  function setupFormPlaceholders() {
    document.querySelectorAll("[data-phase-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        showToast("The form layout is ready. Saving will be connected in a later phase.", "success");
      });

      form.querySelectorAll("[data-reset-form]").forEach(function (button) {
        button.addEventListener("click", function () {
          form.reset();
          showToast("Form reset.");
        });
      });
    });
  }

  function setupPrintButton() {
    document.querySelectorAll("[data-print-result]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.print();
      });
    });
  }

  function setupSearchPlaceholders() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        showToast("Search will be connected to LocalStorage in a later phase.", "warning");
      });
    });
  }

  function updateCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach(function (element) {
      element.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupSidebar();
    setupLogout();
    setupPlaceholderActions();
    setupDemoLogin();
    setupFormPlaceholders();
    setupPrintButton();
    setupSearchPlaceholders();
    updateCurrentYear();
  });

  window.SRMS = window.SRMS || {};
  window.SRMS.showToast = showToast;
}());
