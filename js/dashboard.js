/*
   Student Result Management System
   Phase 5: dashboard statistics and analytics.
*/

(function () {
  "use strict";

  var GRADES = ["A+", "A", "B", "C", "D", "F"];

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character];
    });
  }

  function formatPercentage(value) {
    return Number(value || 0).toFixed(2).replace(/\.00$/, "") + "%";
  }

  function getData() {
    if (window.SRMSStudents && window.SRMSStudents.ensureDemoStudents) window.SRMSStudents.ensureDemoStudents();
    if (window.SRMSResults && window.SRMSResults.ensureDemoResults) window.SRMSResults.ensureDemoResults();
    var students = window.SRMSStorage.getStudents();
    var results = window.SRMSStorage.getResults();
    return { students: students, results: results };
  }

  function getComputedResult(result) {
    return window.SRMSResults && window.SRMSResults.getComputedResult ? window.SRMSResults.getComputedResult(result) : { obtainedMarks: 0, percentage: 0, grade: "F", status: "FAIL" };
  }

  function calculatePassCount(results) {
    return results.filter(function (result) { return getComputedResult(result).status === "PASS"; }).length;
  }

  function calculateFailCount(results) {
    return results.filter(function (result) { return getComputedResult(result).status === "FAIL"; }).length;
  }

  function calculatePassPercentage(passCount, totalResults) {
    return totalResults ? (passCount / totalResults) * 100 : 0;
  }

  function calculateGradeDistribution(results) {
    var distribution = {};
    GRADES.forEach(function (grade) { distribution[grade] = 0; });
    results.forEach(function (result) {
      var grade = getComputedResult(result).grade;
      if (distribution[grade] !== undefined) distribution[grade] += 1;
    });
    return distribution;
  }

  function updateDashboardStats(data) {
    var passCount = calculatePassCount(data.results);
    var failCount = calculateFailCount(data.results);
    var totalResults = data.results.length;
    var average = totalResults ? data.results.reduce(function (sum, result) { return sum + getComputedResult(result).percentage; }, 0) / totalResults : 0;
    var values = {
      studentCount: data.students.length,
      resultCount: totalResults,
      passCount: passCount,
      failCount: failCount,
      passPercentage: formatPercentage(calculatePassPercentage(passCount, totalResults)),
      averagePercentage: formatPercentage(average)
    };
    Object.keys(values).forEach(function (key) {
      document.querySelectorAll("[data-dashboard-" + key.replace(/[A-Z]/g, function (letter) { return "-" + letter.toLowerCase(); }) + "]").forEach(function (element) {
        element.textContent = values[key];
      });
    });
    var resultFoot = document.querySelector("[data-dashboard-result-foot]");
    if (resultFoot) resultFoot.textContent = totalResults ? "Prepared from LocalStorage records" : "Add a result to begin tracking";
    var passFoot = document.querySelector("[data-dashboard-pass-foot]");
    if (passFoot) passFoot.textContent = totalResults ? values.passPercentage + " of recorded results" : "No results recorded yet";
    var failFoot = document.querySelector("[data-dashboard-fail-foot]");
    if (failFoot) failFoot.textContent = failCount ? "Needs academic attention" : "No failed results recorded";
    var averageFoot = document.querySelector("[data-dashboard-average-foot]");
    if (averageFoot) averageFoot.textContent = totalResults ? "Average across recorded results" : "No results recorded yet";
  }

  function renderRecentStudents(students) {
    var rows = document.querySelector("[data-recent-students]");
    var wrap = document.querySelector("[data-recent-students-wrap]");
    var empty = document.querySelector("[data-recent-students-empty]");
    if (!rows) return;
    rows.innerHTML = students.slice(0, 4).map(function (student) {
      return "<tr><td>" + escapeHtml(student.id) + "</td><td>" + escapeHtml(student.rollNumber) + "</td><td class='cell-title'>" + escapeHtml(student.name) + "</td><td>" + escapeHtml(student.className) + "</td><td>" + escapeHtml(student.section) + "</td></tr>";
    }).join("");
    if (wrap) wrap.hidden = !students.length;
    if (empty) empty.hidden = Boolean(students.length);
  }

  function renderRecentResults(results, students) {
    var rows = document.querySelector("[data-recent-results]");
    var wrap = document.querySelector("[data-recent-results-wrap]");
    var empty = document.querySelector("[data-recent-results-empty]");
    if (!rows) return;
    var ordered = results.slice(0, 4);
    rows.innerHTML = ordered.map(function (result) {
      var student = students.find(function (item) { return item.id === result.studentId; }) || {};
      var computed = getComputedResult(result);
      var statusClass = computed.status === "PASS" ? "badge badge-pass" : "badge badge-fail";
      return "<tr><td class='cell-title'>" + escapeHtml(student.name || "Unknown Student") + "<span class='cell-subtitle'>" + escapeHtml(student.rollNumber || result.studentId || "Not linked") + "</span></td><td>" + escapeHtml(result.session) + "</td><td>" + formatPercentage(computed.percentage) + "</td><td><span class='grade-badge" + (computed.grade === "F" ? " grade-fail" : "") + "'>" + computed.grade + "</span></td><td><span class='" + statusClass + "'>" + computed.status + "</span></td></tr>";
    }).join("");
    if (wrap) wrap.hidden = !ordered.length;
    if (empty) empty.hidden = Boolean(ordered.length);
  }

  function renderGradeDistribution(results) {
    var distribution = calculateGradeDistribution(results);
    var list = document.querySelector("[data-grade-distribution]");
    var empty = document.querySelector("[data-grade-distribution-empty]");
    if (!list) return;
    var maximum = Math.max.apply(null, GRADES.map(function (grade) { return distribution[grade]; }).concat([1]));
    list.innerHTML = GRADES.map(function (grade) {
      var count = distribution[grade];
      var width = count ? Math.max((count / maximum) * 100, 6) : 0;
      return "<li class='distribution-row'><span class='distribution-label'>" + grade + "</span><span class='distribution-track' role='progressbar' aria-label='" + grade + " grade count' aria-valuemin='0' aria-valuemax='" + results.length + "' aria-valuenow='" + count + "'><span class='distribution-bar grade-bar-" + grade.replace("+", "plus") + "' style='width: " + width + "%'></span></span><strong class='distribution-count'>" + count + "</strong></li>";
    }).join("");
    if (empty) empty.hidden = Boolean(results.length);
  }

  function loadDashboard() {
    var data = getData();
    updateDashboardStats(data);
    renderRecentStudents(data.students);
    renderRecentResults(data.results, data.students);
    renderGradeDistribution(data.results);
  }

  window.SRMSDashboard = {
    loadDashboard: loadDashboard,
    updateDashboardStats: updateDashboardStats,
    calculatePassCount: calculatePassCount,
    calculateFailCount: calculateFailCount,
    calculatePassPercentage: calculatePassPercentage,
    calculateGradeDistribution: calculateGradeDistribution,
    renderRecentStudents: renderRecentStudents,
    renderRecentResults: renderRecentResults,
    renderGradeDistribution: renderGradeDistribution
  };

  document.addEventListener("DOMContentLoaded", loadDashboard);
}());
