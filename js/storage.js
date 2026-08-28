/*
   Student Result Management System
   LocalStorage helpers shared by the application.

   Phase 4 adds result CRUD while preserving the Phase 3 student helpers.
*/

(function () {
  "use strict";

  var KEYS = {
    students: "students",
    results: "results",
    settings: "settings"
  };

  function readValue(key, fallback) {
    var storedValue = window.localStorage.getItem(key);
    if (storedValue === null) return fallback;
    try {
      return JSON.parse(storedValue);
    } catch (error) {
      return fallback;
    }
  }

  function readList(key) {
    var value = readValue(key, []);
    return Array.isArray(value) ? value : [];
  }

  function writeValue(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function findIndex(records, id) {
    return records.findIndex(function (record) { return record.id === id; });
  }

  function addRecord(key, record) {
    var records = readList(key);
    records.push(record);
    writeValue(key, records);
    return record;
  }

  function updateRecord(key, id, updatedRecord) {
    var records = readList(key);
    var index = findIndex(records, id);
    if (index === -1) return false;
    records[index] = updatedRecord;
    writeValue(key, records);
    return true;
  }

  function deleteRecord(key, id) {
    var records = readList(key);
    var updatedRecords = records.filter(function (record) { return record.id !== id; });
    if (updatedRecords.length === records.length) return false;
    writeValue(key, updatedRecords);
    return true;
  }

  window.SRMSStorage = {
    keys: KEYS,
    getStudents: function () { return readList(KEYS.students); },
    saveStudents: function (students) { writeValue(KEYS.students, students); },
    addStudent: function (student) { return addRecord(KEYS.students, student); },
    updateStudent: function (studentId, updatedStudent) { return updateRecord(KEYS.students, studentId, updatedStudent); },
    deleteStudent: function (studentId) { return deleteRecord(KEYS.students, studentId); },

    getResults: function () { return readList(KEYS.results); },
    saveResults: function (results) { writeValue(KEYS.results, results); },
    addResult: function (result) { return addRecord(KEYS.results, result); },
    updateResult: function (resultId, updatedResult) { return updateRecord(KEYS.results, resultId, updatedResult); },
    deleteResult: function (resultId) { return deleteRecord(KEYS.results, resultId); },

    getSettings: function () { return readValue(KEYS.settings, {}); },
    saveSettings: function (settings) { writeValue(KEYS.settings, settings); },
    hasStudentStore: function () { return window.localStorage.getItem(KEYS.students) !== null; },
    hasResultStore: function () { return window.localStorage.getItem(KEYS.results) !== null; },
    seedStudentsIfFirstUse: function (demoStudents) {
      if (!this.hasStudentStore()) {
        this.saveStudents(demoStudents);
        return true;
      }
      return false;
    },
    seedResultsIfFirstUse: function (demoResults) {
      if (!this.hasResultStore()) {
        this.saveResults(demoResults);
        return true;
      }
      return false;
    }
  };
}());
