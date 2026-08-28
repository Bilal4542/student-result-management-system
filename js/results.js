/*
   Student Result Management System
   Phase 4: result CRUD, mark entry, calculations, search, filters, and print view.
*/

(function () {
  "use strict";

  var SUBJECTS = ["English", "Mathematics", "Computer", "Physics", "Urdu"];
  var MAX_MARKS = 100;
  var TOTAL_MAX_MARKS = SUBJECTS.length * MAX_MARKS;
  var DEMO_RESULTS = [
    { id: "RES-2026-008", studentId: "SRMS-1008", session: "2026", subjects: [{ name: "English", maxMarks: 100, obtainedMarks: 92 }, { name: "Mathematics", maxMarks: 100, obtainedMarks: 89 }, { name: "Computer", maxMarks: 100, obtainedMarks: 96 }, { name: "Physics", maxMarks: 100, obtainedMarks: 86 }, { name: "Urdu", maxMarks: 100, obtainedMarks: 93 }] },
    { id: "RES-2026-007", studentId: "SRMS-1007", session: "2026", subjects: [{ name: "English", maxMarks: 100, obtainedMarks: 78 }, { name: "Mathematics", maxMarks: 100, obtainedMarks: 82 }, { name: "Computer", maxMarks: 100, obtainedMarks: 80 }, { name: "Physics", maxMarks: 100, obtainedMarks: 75 }, { name: "Urdu", maxMarks: 100, obtainedMarks: 78 }] },
    { id: "RES-2026-006", studentId: "SRMS-1006", session: "2026", subjects: [{ name: "English", maxMarks: 100, obtainedMarks: 84 }, { name: "Mathematics", maxMarks: 100, obtainedMarks: 82 }, { name: "Computer", maxMarks: 100, obtainedMarks: 86 }, { name: "Physics", maxMarks: 100, obtainedMarks: 80 }, { name: "Urdu", maxMarks: 100, obtainedMarks: 88 }] },
    { id: "RES-2026-005", studentId: "SRMS-1005", session: "2026", subjects: [{ name: "English", maxMarks: 100, obtainedMarks: 44 }, { name: "Mathematics", maxMarks: 100, obtainedMarks: 40 }, { name: "Computer", maxMarks: 100, obtainedMarks: 55 }, { name: "Physics", maxMarks: 100, obtainedMarks: 45 }, { name: "Urdu", maxMarks: 100, obtainedMarks: 55 }] },
    { id: "RES-2026-004", studentId: "SRMS-1004", session: "2026", subjects: [{ name: "English", maxMarks: 100, obtainedMarks: 72 }, { name: "Mathematics", maxMarks: 100, obtainedMarks: 76 }, { name: "Computer", maxMarks: 100, obtainedMarks: 78 }, { name: "Physics", maxMarks: 100, obtainedMarks: 74 }, { name: "Urdu", maxMarks: 100, obtainedMarks: 77 }] },
    { id: "RES-2026-003", studentId: "SRMS-1003", session: "2026", subjects: [{ name: "English", maxMarks: 100, obtainedMarks: 64 }, { name: "Mathematics", maxMarks: 100, obtainedMarks: 66 }, { name: "Computer", maxMarks: 100, obtainedMarks: 68 }, { name: "Physics", maxMarks: 100, obtainedMarks: 62 }, { name: "Urdu", maxMarks: 100, obtainedMarks: 72 }] }
  ];

  function normalize(value) { return String(value || "").trim().toLowerCase(); }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character];
    });
  }

  function getStudent(studentId) {
    return window.SRMSStorage.getStudents().find(function (student) { return student.id === studentId; });
  }

  function getSubjectMarks(result) {
    return SUBJECTS.map(function (subjectName) {
      var subject = (result.subjects || []).find(function (item) { return item.name === subjectName; });
      return subject ? Number(subject.obtainedMarks) : 0;
    });
  }

  function calculateTotal(resultOrMarks) {
    var marks = Array.isArray(resultOrMarks) ? resultOrMarks : getSubjectMarks(resultOrMarks);
    return marks.reduce(function (total, mark) { return total + (Number(mark) || 0); }, 0);
  }

  function calculatePercentage(obtainedMarks) {
    return Number(((Number(obtainedMarks) / TOTAL_MAX_MARKS) * 100).toFixed(2));
  }

  function calculateGrade(percentage) {
    var value = Number(percentage);
    if (value >= 90) return "A+";
    if (value >= 80) return "A";
    if (value >= 70) return "B";
    if (value >= 60) return "C";
    if (value >= 50) return "D";
    return "F";
  }

  function calculateResultStatus(percentage, marks) {
    var everySubjectPassed = marks.every(function (mark) { return Number(mark) >= 40; });
    return Number(percentage) >= 50 && everySubjectPassed ? "PASS" : "FAIL";
  }

  function getComputedResult(result) {
    var marks = getSubjectMarks(result);
    var obtainedMarks = calculateTotal(marks);
    var percentage = calculatePercentage(obtainedMarks);
    return {
      totalMarks: TOTAL_MAX_MARKS,
      obtainedMarks: obtainedMarks,
      percentage: percentage,
      grade: calculateGrade(percentage),
      status: calculateResultStatus(percentage, marks)
    };
  }

  function resultWithStudent(result) {
    var student = getStudent(result.studentId) || {};
    return { result: result, student: student, computed: getComputedResult(result) };
  }

  function ensureDemoResults() {
    if (window.SRMSStudents && window.SRMSStudents.ensureDemoStudents) {
      window.SRMSStudents.ensureDemoStudents();
    }
    return window.SRMSStorage.seedResultsIfFirstUse(DEMO_RESULTS);
  }

  function nextResultId() {
    var year = new Date().getFullYear();
    var results = window.SRMSStorage.getResults();
    var number = results.reduce(function (highest, result) {
      var match = String(result.id || "").match(/(\d+)$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0) + 1;
    return "RES-" + year + "-" + String(number).padStart(3, "0");
  }

  function formatPercentage(value) { return Number(value).toFixed(2).replace(/\.00$/, "") + "%"; }
  function formatDate(dateValue) {
    if (!dateValue) return "Not provided";
    var date = new Date(dateValue + "T00:00:00");
    return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function gradeClass(grade) { return grade === "F" ? "grade-badge grade-fail" : "grade-badge"; }
  function statusClass(status) { return status === "PASS" ? "badge badge-pass" : "badge badge-fail"; }

  function getResultFormValue(form, name) {
    var field = form.elements[name];
    return field ? field.value.trim() : "";
  }

  function collectResultFromForm(form) {
    return {
      id: form.getAttribute("data-editing-id") || nextResultId(),
      studentId: getResultFormValue(form, "studentId"),
      session: getResultFormValue(form, "session"),
      subjects: SUBJECTS.map(function (subjectName) {
        var field = form.querySelector("[data-subject-mark='" + subjectName + "']");
        return { name: subjectName, maxMarks: MAX_MARKS, obtainedMarks: field ? field.value.trim() : "" };
      })
    };
  }

  function validateResult(result, results, editingId) {
    var errors = {};
    var student = getStudent(result.studentId);
    if (!student) errors.studentId = "Please select an existing student.";
    if (!result.session) errors.session = "Examination session is required.";
    if (result.session && !/^\d{4}(?:-\d{2})?$/.test(result.session)) errors.session = "Use a session such as 2026 or 2026-27.";
    if (results.some(function (existing) {
      return existing.studentId === result.studentId && existing.session === result.session && existing.id !== editingId;
    })) errors.duplicate = "A result already exists for this student for the selected session.";

    result.subjects.forEach(function (subject, index) {
      var value = subject.obtainedMarks;
      if (value === "") {
        errors["subject" + index] = "Marks are required for " + subject.name + ".";
      } else if (!/^\d+(?:\.\d+)?$/.test(value) || Number(value) < 0 || Number(value) > MAX_MARKS) {
        errors["subject" + index] = "Marks must be between 0 and 100.";
      }
    });
    return errors;
  }

  function clearErrors(form) {
    form.querySelectorAll("[data-field-error]").forEach(function (element) { element.textContent = ""; });
    form.querySelectorAll(".has-error").forEach(function (element) { element.classList.remove("has-error"); });
  }

  function showErrors(form, errors) {
    Object.keys(errors).forEach(function (key) {
      var error = form.querySelector("[data-field-error='" + key + "']");
      if (error) error.textContent = errors[key];
      var field = key.indexOf("subject") === 0 ? form.querySelector("[data-subject-index='" + Number(key.replace("subject", "")) + "']") : form.elements[key];
      if (field) field.classList.add("has-error");
    });
    if (errors.duplicate) {
      var duplicate = form.querySelector("[data-result-form-error]");
      if (duplicate) duplicate.textContent = errors.duplicate;
    }
  }

  function populateStudentOptions(form, selectedId) {
    var select = form.elements.studentId;
    if (!select) return;
    var students = window.SRMSStorage.getStudents();
    select.innerHTML = "<option value=''>Select a student</option>" + students.map(function (student) {
      var selected = student.id === selectedId ? " selected" : "";
      return "<option value='" + escapeHtml(student.id) + "'" + selected + ">" + escapeHtml(student.name) + " · " + escapeHtml(student.rollNumber) + "</option>";
    }).join("");
  }

  function updateSelectedStudent(form) {
    var student = getStudent(getResultFormValue(form, "studentId"));
    var fields = { name: "result-student-name", id: "result-student-id", rollNumber: "result-roll", className: "result-class", section: "result-section" };
    Object.keys(fields).forEach(function (key) {
      var element = document.getElementById(fields[key]);
      if (element) element.value = student ? (key === "name" ? student.name : student[key]) : "";
    });
    var panel = document.querySelector("[data-selected-student]");
    if (panel) panel.hidden = !student;
  }

  function updateLiveSummary(form) {
    var values = SUBJECTS.map(function (subjectName) {
      var field = form.querySelector("[data-subject-mark='" + subjectName + "']");
      return field && field.value !== "" && !Number.isNaN(Number(field.value)) ? Number(field.value) : null;
    });
    var entered = values.filter(function (value) { return value !== null; });
    var obtained = calculateTotal(entered);
    var percentage = calculatePercentage(obtained);
    var complete = entered.length === SUBJECTS.length;
    var summary = {
      total: TOTAL_MAX_MARKS,
      obtained: entered.length ? obtained : "—",
      percentage: entered.length ? formatPercentage(percentage) : "—",
      grade: complete ? calculateGrade(percentage) : "—",
      status: complete ? calculateResultStatus(percentage, values) : "—"
    };
    Object.keys(summary).forEach(function (key) {
      var element = document.querySelector("[data-live-summary='" + key + "']");
      if (element) element.textContent = summary[key];
    });
    var status = document.querySelector("[data-live-summary='status']");
    if (status) status.className = complete ? statusClass(summary.status) : "summary-value";
  }

  function setupResultForm() {
    var form = document.querySelector("[data-result-form]");
    if (!form) return;
    ensureDemoResults();
    var editId = new URLSearchParams(window.location.search).get("edit");
    var existing = editId ? window.SRMSStorage.getResults().find(function (result) { return result.id === editId; }) : null;
    populateStudentOptions(form, existing ? existing.studentId : "");
    if (existing) {
      form.setAttribute("data-editing-id", existing.id);
      form.elements.studentId.value = existing.studentId;
      form.elements.session.value = existing.session;
      existing.subjects.forEach(function (subject) {
        var field = form.querySelector("[data-subject-mark='" + subject.name + "']");
        if (field) field.value = subject.obtainedMarks;
      });
      document.querySelector("[data-form-title]").textContent = "Edit result";
      document.querySelector("[data-form-subtitle]").textContent = "Update marks and recalculate the academic outcome.";
      document.querySelector("[data-submit-label]").textContent = "Update Result";
    }
    updateSelectedStudent(form);
    updateLiveSummary(form);

    form.elements.studentId.addEventListener("change", function () { updateSelectedStudent(form); });
    form.querySelectorAll("input, select").forEach(function (field) {
      field.addEventListener("input", function () {
        field.classList.remove("has-error");
        var error = form.querySelector("[data-field-error='" + field.name + "']");
        if (error) error.textContent = "";
        updateLiveSummary(form);
      });
      field.addEventListener("change", function () { updateLiveSummary(form); });
    });
    form.querySelector("[data-reset-form]").addEventListener("click", function () {
      form.reset();
      form.removeAttribute("data-editing-id");
      populateStudentOptions(form, "");
      updateSelectedStudent(form);
      updateLiveSummary(form);
      clearErrors(form);
      window.SRMS.showToast("Result form reset.");
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(form);
      var result = collectResultFromForm(form);
      var errors = validateResult(result, window.SRMSStorage.getResults(), form.getAttribute("data-editing-id"));
      if (Object.keys(errors).length) {
        showErrors(form, errors);
        var firstError = form.querySelector(".has-error");
        if (firstError) firstError.focus();
        return;
      }
      var saved = form.getAttribute("data-editing-id") ? window.SRMSStorage.updateResult(result.id, result) : window.SRMSStorage.addResult(result);
      if (!saved) return;
      var computed = getComputedResult(result);
      window.sessionStorage.setItem("srmsResultMessage", form.getAttribute("data-editing-id") ? "Result updated successfully." : "Result saved successfully.");
      window.sessionStorage.setItem("srmsResultPreview", JSON.stringify(computed));
      window.location.href = "results.html";
    });
  }

  function getResultFilters() {
    return {
      query: normalize((document.querySelector("[data-result-search]") || {}).value),
      session: (document.querySelector("[data-result-session-filter]") || {}).value || "",
      grade: (document.querySelector("[data-result-grade-filter]") || {}).value || "",
      status: (document.querySelector("[data-result-status-filter]") || {}).value || ""
    };
  }

  function filterResults(results) {
    var filters = getResultFilters();
    return results.filter(function (result) {
      var linked = resultWithStudent(result);
      var searchable = [linked.student.name, linked.student.id, linked.student.rollNumber, result.id].map(normalize).join(" ");
      return (!filters.query || searchable.indexOf(filters.query) !== -1) &&
        (!filters.session || result.session === filters.session) &&
        (!filters.grade || linked.computed.grade === filters.grade) &&
        (!filters.status || linked.computed.status === filters.status);
    });
  }

  function renderResultRows(results, target) {
    var rows = target || document.querySelector("[data-result-rows]");
    var wrap = document.querySelector("[data-results-table-wrap]");
    var empty = document.querySelector("[data-result-empty]");
    var count = document.querySelector("[data-result-count]");
    if (!rows) return;
    rows.innerHTML = "";
    if (count) count.textContent = results.length + (results.length === 1 ? " result" : " results");
    if (!results.length) {
      if (wrap) wrap.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    if (wrap) wrap.hidden = false;
    if (empty) empty.hidden = true;
    results.forEach(function (result) {
      var linked = resultWithStudent(result);
      var computed = linked.computed;
      var row = document.createElement("tr");
      row.innerHTML = "<td>" + escapeHtml(result.id) + "</td><td>" + escapeHtml(linked.student.rollNumber || "Not linked") + "</td><td><span class='cell-title'>" + escapeHtml(linked.student.name || "Unknown student") + "</span><span class='cell-subtitle'>Session " + escapeHtml(result.session) + "</span></td><td>" + computed.totalMarks + "</td><td>" + computed.obtainedMarks + "</td><td>" + formatPercentage(computed.percentage) + "</td><td><span class='" + gradeClass(computed.grade) + "'>" + computed.grade + "</span></td><td><span class='" + statusClass(computed.status) + "'>" + computed.status + "</span></td><td><div class='table-actions'><a class='btn btn-ghost btn-sm' href='view-result.html?id=" + encodeURIComponent(result.id) + "'>View</a><a class='btn btn-ghost btn-sm' href='add-result.html?edit=" + encodeURIComponent(result.id) + "'>Edit</a><button class='btn btn-ghost btn-sm' type='button' data-result-action='delete' data-result-id='" + escapeHtml(result.id) + "'>Delete</button></div></td>";
      rows.appendChild(row);
    });
  }

  function setupFilters() {
    var rows = document.querySelector("[data-result-rows]");
    if (!rows) return;
    ensureDemoResults();
    var sessionField = document.querySelector("[data-result-session-filter]");
    if (sessionField) {
      var sessions = window.SRMSStorage.getResults().map(function (result) { return result.session; }).filter(function (session, index, all) { return session && all.indexOf(session) === index; }).sort().reverse();
      sessionField.innerHTML = "<option value=''>All sessions</option>" + sessions.map(function (session) { return "<option value='" + escapeHtml(session) + "'>" + escapeHtml(session) + "</option>"; }).join("");
    }
    function refresh() { renderResultRows(filterResults(window.SRMSStorage.getResults())); }
    ["[data-result-search]", "[data-result-session-filter]", "[data-result-grade-filter]", "[data-result-status-filter]"].forEach(function (selector) {
      var field = document.querySelector(selector);
      if (field) field.addEventListener(field.tagName === "INPUT" ? "input" : "change", refresh);
    });
    var clear = document.querySelector("[data-clear-result-filters]");
    if (clear) clear.addEventListener("click", function () {
      ["[data-result-search]", "[data-result-session-filter]", "[data-result-grade-filter]", "[data-result-status-filter]"].forEach(function (selector) { var field = document.querySelector(selector); if (field) field.value = ""; });
      refresh();
    });
    rows.addEventListener("click", function (event) {
      var button = event.target.closest("[data-result-action='delete']");
      if (!button) return;
      var resultId = button.getAttribute("data-result-id");
      if (!window.confirm("Are you sure you want to delete this result?")) return;
      if (window.SRMSStorage.deleteResult(resultId)) {
        refresh();
        window.SRMS.showToast("Result deleted successfully.", "success");
      }
    });
    refresh();
    var flash = window.sessionStorage.getItem("srmsResultMessage");
    if (flash) { window.sessionStorage.removeItem("srmsResultMessage"); window.SRMS.showToast(flash, "success"); }
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-result-search-form]");
    var rows = document.querySelector("[data-search-result-rows]");
    if (!form || !rows) return;
    ensureDemoResults();
    var queryField = form.elements.query;
    function render() {
      var query = normalize(queryField.value);
      var results = window.SRMSStorage.getResults().filter(function (result) {
        var linked = resultWithStudent(result);
        return !query || [linked.student.name, linked.student.id, linked.student.rollNumber, result.id].some(function (value) { return normalize(value).indexOf(query) !== -1; });
      });
      var empty = document.querySelector("[data-search-empty]");
      var wrap = document.querySelector("[data-search-table-wrap]");
      renderResultRows(results, rows);
      if (wrap) wrap.hidden = !results.length;
      if (empty) { empty.hidden = Boolean(query && results.length); empty.querySelector("h3").textContent = query ? "No results found." : "Enter a search query"; empty.querySelector("p").textContent = query ? "Try another student name, roll number, ID, or result ID." : "Search the LocalStorage-backed result records by student identity."; }
    }
    form.addEventListener("submit", function (event) { event.preventDefault(); render(); });
    queryField.addEventListener("input", render);
    form.addEventListener("reset", function () { window.setTimeout(render, 0); });
    render();
  }

  function setupViewPage() {
    var card = document.querySelector("[data-result-card]");
    if (!card) return;
    ensureDemoResults();
    var resultId = new URLSearchParams(window.location.search).get("id");
    var result = window.SRMSStorage.getResults().find(function (record) { return record.id === resultId; }) || window.SRMSStorage.getResults()[0];
    if (!result) { card.innerHTML = "<div class='empty-state'><h2>No result found.</h2><p>Create a result before opening the printable result card.</p><a class='btn btn-primary' href='add-result.html'>Add Result</a></div>"; return; }
    var linked = resultWithStudent(result);
    var student = linked.student;
    var computed = linked.computed;
    var subjectRows = result.subjects.map(function (subject) {
      var percentage = Number(subject.obtainedMarks);
      return "<tr><td class='cell-title'>" + escapeHtml(subject.name) + "</td><td>" + subject.maxMarks + "</td><td>" + percentage + "</td><td><span class='" + gradeClass(calculateGrade(percentage)) + "'>" + calculateGrade(percentage) + "</span></td></tr>";
    }).join("");
    card.querySelector("[data-view-session]").textContent = "Academic Session · " + result.session;
    card.querySelector("[data-view-name]").textContent = student.name || "Unknown student";
    card.querySelector("[data-view-father]").textContent = student.fatherName || "Not provided";
    card.querySelector("[data-view-roll]").textContent = student.rollNumber || "Not provided";
    card.querySelector("[data-view-id]").textContent = student.id || result.studentId;
    card.querySelector("[data-view-class]").textContent = student.className || "Not provided";
    card.querySelector("[data-view-section]").textContent = student.section || "Not provided";
    card.querySelector("[data-view-subject-rows]").innerHTML = subjectRows;
    card.querySelector("[data-view-total]").textContent = computed.totalMarks;
    card.querySelector("[data-view-obtained]").textContent = computed.obtainedMarks;
    card.querySelector("[data-view-percentage]").textContent = formatPercentage(computed.percentage);
    card.querySelector("[data-view-grade]").textContent = computed.grade;
    card.querySelector("[data-view-status]").textContent = computed.status;
    card.querySelector("[data-view-status]").className = statusClass(computed.status);
    card.querySelector("[data-view-result-id]").textContent = "Generated from the SRMS result record · Result ID " + result.id;
    document.querySelector("[data-view-topbar]").textContent = "Result · " + result.id;
  }

  window.SRMSResults = {
    subjects: SUBJECTS,
    totalMaxMarks: TOTAL_MAX_MARKS,
    calculateTotal: calculateTotal,
    calculatePercentage: calculatePercentage,
    calculateGrade: calculateGrade,
    calculateResultStatus: calculateResultStatus,
    getComputedResult: getComputedResult,
    validateResult: validateResult,
    ensureDemoResults: ensureDemoResults,
    resultWithStudent: resultWithStudent
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupResultForm();
    setupFilters();
    setupSearchPage();
    setupViewPage();
  });
}());
