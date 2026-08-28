/*
   Student Result Management System
   Phase 3: student CRUD, validation, search, and filters.
*/

(function () {
  "use strict";

  var DEMO_STUDENTS = [
    { id: "SRMS-1008", rollNumber: "DIT-008", name: "Ayesha Khan", fatherName: "Imran Khan", className: "DIT", section: "A", dateOfBirth: "2004-05-12", gender: "Female", phone: "03001234567" },
    { id: "SRMS-1007", rollNumber: "DIT-007", name: "Hamza Malik", fatherName: "Faisal Malik", className: "DIT", section: "B", dateOfBirth: "2003-11-08", gender: "Male", phone: "03111234567" },
    { id: "SRMS-1006", rollNumber: "DIT-006", name: "Mariam Shah", fatherName: "Nadeem Shah", className: "DIT", section: "A", dateOfBirth: "2004-02-18", gender: "Female", phone: "03221234567" },
    { id: "SRMS-1005", rollNumber: "DIT-005", name: "Bilal Ahmed", fatherName: "Rashid Ahmed", className: "DIT", section: "B", dateOfBirth: "2003-09-27", gender: "Male", phone: "03331234567" },
    { id: "SRMS-1004", rollNumber: "DIT-004", name: "Zainab Noor", fatherName: "Asif Noor", className: "DIT", section: "A", dateOfBirth: "2004-07-04", gender: "Female", phone: "03441234567" },
    { id: "SRMS-1003", rollNumber: "DIT-003", name: "Saad Raza", fatherName: "Omar Raza", className: "DIT", section: "B", dateOfBirth: "2003-12-16", gender: "Male", phone: "03551234567" }
  ];

  var currentStudents = [];
  var visibleStudents = [];

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[character];
    });
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not provided";
    }

    var date = new Date(dateValue + "T00:00:00");
    if (Number.isNaN(date.getTime())) {
      return "Not provided";
    }

    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function ensureDemoStudents() {
    return window.SRMSStorage.seedStudentsIfFirstUse(DEMO_STUDENTS);
  }

  function getStudentFormValue(form, name) {
    var field = form.elements[name];
    return field ? field.value.trim() : "";
  }

  function getFormStudent(form) {
    return {
      id: getStudentFormValue(form, "studentId"),
      rollNumber: getStudentFormValue(form, "rollNumber"),
      name: getStudentFormValue(form, "name"),
      fatherName: getStudentFormValue(form, "fatherName"),
      className: getStudentFormValue(form, "className"),
      section: getStudentFormValue(form, "section"),
      dateOfBirth: getStudentFormValue(form, "dateOfBirth"),
      gender: getStudentFormValue(form, "gender"),
      phone: getStudentFormValue(form, "phone").replace(/[\s-]/g, "")
    };
  }

  function validateStudent(student, students, editingId) {
    var errors = {};
    var namePattern = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .'-]*$/;
    var phonePattern = /^(?:\+92|0)3\d{9}$/;
    var today = new Date().toISOString().slice(0, 10);

    if (!student.id) {
      errors.studentId = "Student ID is required.";
    }
    if (!student.rollNumber) {
      errors.rollNumber = "Roll number is required.";
    }
    if (!student.name) {
      errors.name = "Student name is required.";
    } else if (!namePattern.test(student.name) || student.name.replace(/[^A-Za-zÀ-ÿ]/g, "").length < 2) {
      errors.name = "Please enter a valid student name.";
    }
    if (!student.fatherName) {
      errors.fatherName = "Father name is required.";
    } else if (!namePattern.test(student.fatherName) || student.fatherName.replace(/[^A-Za-zÀ-ÿ]/g, "").length < 2) {
      errors.fatherName = "Please enter a valid father name.";
    }
    if (!student.className) {
      errors.className = "Class is required.";
    }
    if (!student.section) {
      errors.section = "Section is required.";
    }
    if (!student.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required.";
    } else if (student.dateOfBirth > today || Number.isNaN(new Date(student.dateOfBirth + "T00:00:00").getTime())) {
      errors.dateOfBirth = "Please enter a valid date of birth.";
    }
    if (!student.gender) {
      errors.gender = "Gender is required.";
    }
    if (!student.phone) {
      errors.phone = "Phone number is required.";
    } else if (!phonePattern.test(student.phone)) {
      errors.phone = "Please enter a valid Pakistani phone number.";
    }

    if (students.some(function (existingStudent) {
      return normalize(existingStudent.id) === normalize(student.id) && existingStudent.id !== editingId;
    })) {
      errors.studentId = "Student ID already exists.";
    }

    if (students.some(function (existingStudent) {
      return normalize(existingStudent.rollNumber) === normalize(student.rollNumber) && existingStudent.id !== editingId;
    })) {
      errors.rollNumber = "Roll number already exists.";
    }

    return errors;
  }

  function clearFormErrors(form) {
    form.querySelectorAll("[data-field-error]").forEach(function (element) {
      element.textContent = "";
    });
    form.querySelectorAll(".has-error").forEach(function (element) {
      element.classList.remove("has-error");
    });
  }

  function showFormErrors(form, errors) {
    Object.keys(errors).forEach(function (fieldName) {
      var field = form.elements[fieldName];
      var error = form.querySelector("[data-field-error='" + fieldName + "']");
      if (field) {
        field.classList.add("has-error");
      }
      if (error) {
        error.textContent = errors[fieldName];
      }
    });
  }

  function renderStudentRows(students) {
    var rows = document.querySelector("[data-student-rows]");
    var tableWrap = document.querySelector("[data-student-table-wrap]");
    var emptyState = document.querySelector("[data-student-empty]");
    var resultCount = document.querySelector("[data-student-result-count]");

    if (!rows) {
      return;
    }

    rows.innerHTML = "";
    if (resultCount) {
      resultCount.textContent = students.length + (students.length === 1 ? " student" : " students");
    }

    if (students.length === 0) {
      if (tableWrap) {
        tableWrap.hidden = true;
      }
      if (emptyState) {
        emptyState.hidden = false;
      }
      return;
    }

    if (tableWrap) {
      tableWrap.hidden = false;
    }
    if (emptyState) {
      emptyState.hidden = true;
    }

    students.forEach(function (student) {
      var row = document.createElement("tr");
      row.innerHTML = "<td>" + escapeHtml(student.id) + "</td>" +
        "<td>" + escapeHtml(student.rollNumber) + "</td>" +
        "<td><span class=\"cell-title\">" + escapeHtml(student.name) + "</span><span class=\"cell-subtitle\">" + escapeHtml(formatDate(student.dateOfBirth)) + "</span></td>" +
        "<td>" + escapeHtml(student.fatherName) + "</td>" +
        "<td>" + escapeHtml(student.className) + "</td>" +
        "<td>" + escapeHtml(student.section) + "</td>" +
        "<td><div class=\"table-actions\"><button class=\"btn btn-ghost btn-sm\" type=\"button\" data-student-action=\"view\" data-student-id=\"" + escapeHtml(student.id) + "\">View</button><a class=\"btn btn-ghost btn-sm\" href=\"add-student.html?edit=" + encodeURIComponent(student.id) + "\">Edit</a><button class=\"btn btn-ghost btn-sm\" type=\"button\" data-student-action=\"delete\" data-student-id=\"" + escapeHtml(student.id) + "\">Delete</button></div></td>";
      rows.appendChild(row);
    });
  }

  function getFilteredStudents() {
    var searchField = document.querySelector("[data-student-search]");
    var classField = document.querySelector("[data-student-class]");
    var sectionField = document.querySelector("[data-student-section]");
    var query = normalize(searchField ? searchField.value : "");
    var className = classField ? classField.value : "";
    var section = sectionField ? sectionField.value : "";

    return currentStudents.filter(function (student) {
      var matchesSearch = !query || [student.name, student.rollNumber, student.id].some(function (value) {
        return normalize(value).indexOf(query) !== -1;
      });
      var matchesClass = !className || student.className === className;
      var matchesSection = !section || student.section === section;
      return matchesSearch && matchesClass && matchesSection;
    });
  }

  function renderStudentList() {
    visibleStudents = getFilteredStudents();
    renderStudentRows(visibleStudents);
  }

  function findStudent(studentId) {
    return currentStudents.find(function (student) {
      return student.id === studentId;
    });
  }

  function openStudentView(studentId) {
    var student = findStudent(studentId);
    var modal = document.querySelector("[data-student-modal]");
    var content = document.querySelector("[data-student-modal-content]");

    if (!student || !modal || !content) {
      return;
    }

    content.innerHTML = "<div class=\"modal-header\"><div><span class=\"eyebrow\">Student profile</span><h2 id=\"student-modal-title\">" + escapeHtml(student.name) + "</h2><p>" + escapeHtml(student.id) + " · " + escapeHtml(student.rollNumber) + "</p></div><button class=\"modal-close\" type=\"button\" data-close-student-modal aria-label=\"Close student details\">×</button></div>" +
      "<div class=\"modal-details\"><div><span>Father name</span><strong>" + escapeHtml(student.fatherName) + "</strong></div><div><span>Class / section</span><strong>" + escapeHtml(student.className) + " / " + escapeHtml(student.section) + "</strong></div><div><span>Date of birth</span><strong>" + escapeHtml(formatDate(student.dateOfBirth)) + "</strong></div><div><span>Gender</span><strong>" + escapeHtml(student.gender) + "</strong></div><div><span>Phone number</span><strong>" + escapeHtml(student.phone) + "</strong></div></div>" +
      "<div class=\"modal-actions\"><a class=\"btn btn-primary\" href=\"add-student.html?edit=" + encodeURIComponent(student.id) + "\">Edit student</a><button class=\"btn btn-secondary\" type=\"button\" data-close-student-modal>Close</button></div>";

    modal.hidden = false;
    document.body.classList.add("modal-open");
    var closeButton = modal.querySelector("[data-close-student-modal]");
    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeStudentView() {
    var modal = document.querySelector("[data-student-modal]");
    if (modal) {
      modal.hidden = true;
    }
    document.body.classList.remove("modal-open");
  }

  function handleStudentAction(event) {
    var actionButton = event.target.closest("[data-student-action]");
    if (!actionButton) {
      return;
    }

    var studentId = actionButton.getAttribute("data-student-id");
    if (actionButton.getAttribute("data-student-action") === "view") {
      openStudentView(studentId);
    }

    if (actionButton.getAttribute("data-student-action") === "delete") {
      handleDeleteStudent(studentId);
    }
  }

  function handleDeleteStudent(studentId) {
    var student = findStudent(studentId);
    if (!student) {
      return;
    }

    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    if (window.SRMSStorage.deleteStudent(studentId)) {
      currentStudents = window.SRMSStorage.getStudents();
      renderStudentList();
      window.SRMS.showToast("Student deleted successfully.", "success");
    }
  }

  function setupStudentList() {
    var rows = document.querySelector("[data-student-rows]");
    var searchField = document.querySelector("[data-student-search]");
    var classField = document.querySelector("[data-student-class]");
    var sectionField = document.querySelector("[data-student-section]");
    var clearButton = document.querySelector("[data-clear-student-filters]");
    var modal = document.querySelector("[data-student-modal]");

    if (!rows) {
      return;
    }

    ensureDemoStudents();
    currentStudents = window.SRMSStorage.getStudents();
    renderStudentList();

    rows.addEventListener("click", handleStudentAction);
    if (searchField) {
      searchField.addEventListener("input", renderStudentList);
    }
    if (classField) {
      classField.addEventListener("change", renderStudentList);
    }
    if (sectionField) {
      sectionField.addEventListener("change", renderStudentList);
    }
    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (searchField) searchField.value = "";
        if (classField) classField.value = "";
        if (sectionField) sectionField.value = "";
        renderStudentList();
      });
    }
    if (modal) {
      modal.addEventListener("click", function (event) {
        if (event.target === modal || event.target.closest("[data-close-student-modal]")) {
          closeStudentView();
        }
      });
    }
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeStudentView();
      }
    });

    var flashMessage = window.sessionStorage.getItem("srmsStudentMessage");
    if (flashMessage) {
      window.sessionStorage.removeItem("srmsStudentMessage");
      window.SRMS.showToast(flashMessage, "success");
    }
  }

  function populateStudentForm(form, student) {
    Object.keys(student).forEach(function (fieldName) {
      var field = form.elements[fieldName === "id" ? "studentId" : fieldName];
      if (field) {
        field.value = student[fieldName];
      }
    });
    form.setAttribute("data-editing-id", student.id);
    document.querySelector("[data-form-title]").textContent = "Edit student";
    document.querySelector("[data-form-subtitle]").textContent = "Update the profile while keeping identity numbers unique.";
    form.querySelector("[data-submit-label]").textContent = "Update Student";
    form.elements.studentId.readOnly = true;
    form.elements.rollNumber.readOnly = true;
  }

  function setupStudentForm() {
    var form = document.querySelector("[data-student-form]");
    if (!form) {
      return;
    }

    ensureDemoStudents();
    var editId = new URLSearchParams(window.location.search).get("edit");
    if (editId) {
      var student = window.SRMSStorage.getStudents().find(function (record) {
        return record.id === editId;
      });
      if (student) {
        populateStudentForm(form, student);
      }
    }

    form.querySelectorAll("input, select").forEach(function (field) {
      field.addEventListener("input", function () {
        field.classList.remove("has-error");
        var error = form.querySelector("[data-field-error='" + field.name + "']");
        if (error) error.textContent = "";
      });
      field.addEventListener("change", function () {
        field.classList.remove("has-error");
        var error = form.querySelector("[data-field-error='" + field.name + "']");
        if (error) error.textContent = "";
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFormErrors(form);

      var student = getFormStudent(form);
      var editingId = form.getAttribute("data-editing-id") || "";
      var students = window.SRMSStorage.getStudents();
      var errors = validateStudent(student, students, editingId);

      if (Object.keys(errors).length > 0) {
        showFormErrors(form, errors);
        var firstErrorField = form.querySelector(".has-error");
        if (firstErrorField) firstErrorField.focus();
        return;
      }

      if (editingId) {
        var existingStudent = students.find(function (record) { return record.id === editingId; });
        student.id = existingStudent.id;
        student.rollNumber = existingStudent.rollNumber;
        window.SRMSStorage.updateStudent(editingId, student);
        window.sessionStorage.setItem("srmsStudentMessage", "Student updated successfully.");
      } else {
        window.SRMSStorage.addStudent(student);
        window.sessionStorage.setItem("srmsStudentMessage", "Student added successfully.");
      }

      window.location.href = "students.html";
    });
  }

  function renderDashboardStudentData() {
    var countElement = document.querySelector("[data-dashboard-student-count]");
    var recentRows = document.querySelector("[data-recent-students]");
    if (!countElement && !recentRows) {
      return;
    }

    ensureDemoStudents();
    var students = window.SRMSStorage.getStudents();
    if (countElement) {
      countElement.textContent = String(students.length);
    }
    if (recentRows) {
      recentRows.innerHTML = "";
      students.slice(0, 4).forEach(function (student) {
        var row = document.createElement("tr");
        row.innerHTML = "<td>" + escapeHtml(student.rollNumber) + "</td><td><span class=\"cell-title\">" + escapeHtml(student.name) + "</span><span class=\"cell-subtitle\">" + escapeHtml(student.id) + "</span></td><td>" + escapeHtml(student.className) + "</td><td>" + escapeHtml(student.section) + "</td>";
        recentRows.appendChild(row);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.SRMSStorage) {
      setupStudentList();
      setupStudentForm();
      renderDashboardStudentData();
    }
  });

  window.SRMSStudents = {
    phase: "Phase 3",
    ready: true,
    validateStudent: validateStudent,
    loadStudents: function () {
      ensureDemoStudents();
      return window.SRMSStorage.getStudents();
    },
    ensureDemoStudents: ensureDemoStudents,
    searchStudents: getFilteredStudents,
    filterStudents: renderStudentList,
    handleAddStudent: setupStudentForm,
    handleEditStudent: setupStudentForm,
    handleDeleteStudent: handleDeleteStudent
  };
}());
