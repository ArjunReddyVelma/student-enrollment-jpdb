/**
 * Student Enrollment Management System
 * Main Application Controller (app.js)
 *
 * Implements full 5-state academic workflow:
 * - State 1: Initial Page Load (Roll-No enabled & focused, all others disabled)
 * - State 2: Primary Key Validation (Lookup Roll-No in SCHOOL-DB / STUDENT-TABLE)
 * - State 3: Save New Record (Validate, createPUTRequest, /api/iml)
 * - State 4: Update Existing Record (Validate, createUPDATERecordRequest, /api/iml)
 * - State 5: Reset Form (Clear, restore initial state)
 */

(function ($) {
  "use strict";

  // =========================================================================
  // Configuration Manager
  // =========================================================================
  var AppConfig = {
    defaults: {
      baseUrl: "http://api.login2explore.com:5577",
      irlEndpoint: "/api/irl",
      imlEndpoint: "/api/iml",
      dbName: "SCHOOL-DB",
      relName: "STUDENT-TABLE",
      primaryKey: "Roll-No",
      connToken: ""
    },

    get: function () {
      // 1. Check window.JPDB_CONFIG from config.js if present
      var externalConfig = window.JPDB_CONFIG || {};

      // 2. Check localStorage for user-saved settings
      var localToken = localStorage.getItem("jpdb_connToken") || "";
      var localBaseUrl = localStorage.getItem("jpdb_baseUrl") || "";

      return {
        baseUrl: localBaseUrl || externalConfig.baseUrl || this.defaults.baseUrl,
        irlEndpoint: externalConfig.irlEndpoint || this.defaults.irlEndpoint,
        imlEndpoint: externalConfig.imlEndpoint || this.defaults.imlEndpoint,
        dbName: externalConfig.dbName || this.defaults.dbName,
        relName: externalConfig.relName || this.defaults.relName,
        primaryKey: externalConfig.primaryKey || this.defaults.primaryKey,
        connToken: localToken || externalConfig.connToken || this.defaults.connToken
      };
    },

    save: function (token, baseUrl) {
      if (token !== undefined) {
        localStorage.setItem("jpdb_connToken", token.trim());
      }
      if (baseUrl !== undefined) {
        localStorage.setItem("jpdb_baseUrl", baseUrl.trim());
      }
      this.syncMetadataUI();
    },

    syncMetadataUI: function () {
      var cfg = this.get();
      $("#metaDbName").text(cfg.dbName);
      $("#metaRelName").text(cfg.relName);
      $("#metaPrimaryKey").text(cfg.primaryKey);

      if (cfg.connToken) {
        $("#dbStatusBadge").removeClass("badge-warning").addClass("badge-status");
        $("#dbStatusDot").css("background", "#16a34a");
        $("#dbStatusText").text("Connected / Ready");
      } else {
        $("#dbStatusBadge").removeClass("badge-status").addClass("badge-warning");
        $("#dbStatusDot").css("background", "#d97706");
        $("#dbStatusText").text("Token Not Configured");
      }
    }
  };

  // =========================================================================
  // Application State
  // =========================================================================
  var AppState = {
    currentRecNo: null,
    lastValidatedRollNo: null,
    isSubmitting: false,
    mode: "INITIAL" // INITIAL | NEW | EXISTING
  };

  // =========================================================================
  // DOM Elements Cache
  // =========================================================================
  var DOM = {};

  function initDOMCache() {
    DOM.$form = $("#studentEnrollmentForm");
    DOM.$rollNo = $("#rollNo");
    DOM.$fullName = $("#fullName");
    DOM.$studentClass = $("#studentClass");
    DOM.$birthDate = $("#birthDate");
    DOM.$enrollmentDate = $("#enrollmentDate");
    DOM.$address = $("#address");

    DOM.$btnSave = $("#btnSave");
    DOM.$btnUpdate = $("#btnUpdate");
    DOM.$btnReset = $("#btnReset");

    DOM.$rollNoSpinner = $("#rollNoSpinner");
    DOM.$formStateBadge = $("#formStateBadge");
    DOM.$alertBox = $("#alertBox");
    DOM.$alertIcon = $("#alertIcon");
    DOM.$alertContent = $("#alertContent");
    DOM.$btnAlertClose = $("#btnAlertClose");

    // Modal elements
    DOM.$settingsModal = $("#settingsModal");
    DOM.$btnSettingsModal = $("#btnSettingsModal");
    DOM.$btnSettingsClose = $("#btnSettingsClose");
    DOM.$btnSaveSettings = $("#btnSaveSettings");
    DOM.$btnTestConn = $("#btnTestConn");
    DOM.$cfgConnToken = $("#cfgConnToken");
    DOM.$cfgBaseUrl = $("#cfgBaseUrl");
    DOM.$cfgDbName = $("#cfgDbName");
    DOM.$cfgRelName = $("#cfgRelName");
    DOM.$cfgTestFeedback = $("#cfgTestFeedback");
  }

  // =========================================================================
  // JPDB Command Dispatcher Helper
  // =========================================================================
  function dispatchJPDBCommand(reqString, baseUrl, endpoint) {
    if (typeof window !== "undefined" && typeof window.executeCommandAtGivenBaseUrl === "function") {
      return window.executeCommandAtGivenBaseUrl(reqString, baseUrl, endpoint);
    }
    return executeCommandAtGivenBaseUrl(reqString, baseUrl, endpoint);
  }

  // =========================================================================
  // Alert & Notification Helper
  // =========================================================================
  function showAlert(message, type, duration) {
    var icons = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      danger: "❌"
    };

    DOM.$alertBox
      .removeClass("alert-info alert-success alert-warning alert-danger alert-hidden")
      .addClass("alert-" + (type || "info"));

    DOM.$alertIcon.text(icons[type] || "ℹ️");
    DOM.$alertContent.html(message);

    if (duration) {
      setTimeout(function () {
        DOM.$alertBox.addClass("alert-hidden");
      }, duration);
    }
  }

  function hideAlert() {
    DOM.$alertBox.addClass("alert-hidden");
  }

  // =========================================================================
  // Form State Handlers (Phase 4 Specification)
  // =========================================================================

  /**
   * STATE 1: INITIAL PAGE LOAD
   * - Display empty form
   * - Enable ONLY Roll-No
   * - Focus Roll-No
   * - Disable remaining fields
   * - Disable Save and Update buttons
   * - Disable Reset button
   */
  function initFormState() {
    // Clear inputs
    DOM.$rollNo.val("");
    DOM.$fullName.val("");
    DOM.$studentClass.val("");
    DOM.$birthDate.val("");
    DOM.$enrollmentDate.val("");
    DOM.$address.val("");

    // Remove validation states
    $(".form-control").removeClass("is-invalid is-valid");
    $(".invalid-feedback").hide();

    // Field states
    DOM.$rollNo.prop("disabled", false);
    DOM.$fullName.prop("disabled", true);
    DOM.$studentClass.prop("disabled", true);
    DOM.$birthDate.prop("disabled", true);
    DOM.$enrollmentDate.prop("disabled", true);
    DOM.$address.prop("disabled", true);

    // Button states
    DOM.$btnSave.prop("disabled", true);
    DOM.$btnUpdate.prop("disabled", true);
    DOM.$btnReset.prop("disabled", true);

    // Reset internal state
    AppState.currentRecNo = null;
    AppState.lastValidatedRollNo = null;
    AppState.isSubmitting = false;
    AppState.mode = "INITIAL";
    localStorage.removeItem("rec_no");

    // UI Badges
    DOM.$rollNoSpinner.hide();
    DOM.$formStateBadge
      .text("Initial State")
      .css({ background: "var(--gray-100)", color: "var(--gray-600)" });

    // Focus primary key
    DOM.$rollNo.trigger("focus");
  }

  /**
   * STATE 2: PRIMARY KEY VALIDATION
   * Triggered when user enters Roll-No and changes/blurs field
   */
  function handleRollNoValidation() {
    var rollNo = DOM.$rollNo.val().trim();

    // If empty, restore initial state
    if (rollNo === "") {
      initFormState();
      return;
    }

    // Avoid duplicate requests if same Roll-No is already active
    if (rollNo === AppState.lastValidatedRollNo && AppState.mode !== "INITIAL") {
      return;
    }

    var cfg = AppConfig.get();

    // Verify token presence
    if (!cfg.connToken) {
      showAlert(
        "<strong>JPDB Connection Token required:</strong> Please click <em>'⚙️ Database Settings'</em> to enter your token before querying.",
        "warning"
      );
      // Enable fields in local preview mode so user is not blocked
      enableFieldsForNewRecord(rollNo);
      return;
    }

    // Show spinner during lookup
    DOM.$rollNoSpinner.show();
    DOM.$rollNo.prop("disabled", true);

    try {
      // Build GET_BY_KEY request
      var keyJsonObj = JSON.stringify({ "Roll-No": rollNo });
      var getRequest = createGET_BY_KEYRequest(
        cfg.connToken,
        cfg.dbName,
        cfg.relName,
        keyJsonObj,
        false,
        false
      );

      // Execute retrieval command via JPDB IRL endpoint
      var res = dispatchJPDBCommand(getRequest, cfg.baseUrl, cfg.irlEndpoint);

      DOM.$rollNoSpinner.hide();

      if (res && res.status === 400) {
        // RECORD DOES NOT EXIST -> Enable for new record entry
        enableFieldsForNewRecord(rollNo);
      } else if (res && res.status === 200) {
        // RECORD ALREADY EXISTS -> Populate data for update
        populateFieldsForExistingRecord(rollNo, res);
      } else {
        // Error or unexpected status
        DOM.$rollNo.prop("disabled", false);
        var errMsg = (res && res.message) ? res.message : "Unable to query JSONPowerDB.";
        showAlert("Database Query Error (" + (res ? res.status : "Network") + "): " + errMsg, "danger");
      }
    } catch (err) {
      DOM.$rollNoSpinner.hide();
      DOM.$rollNo.prop("disabled", false);
      showAlert("Exception while querying JSONPowerDB: " + err.message, "danger");
      console.error("JPDB Lookup Error:", err);
    }
  }

  /**
   * Transition to New Student Entry Mode
   */
  function enableFieldsForNewRecord(rollNo) {
    AppState.mode = "NEW";
    AppState.lastValidatedRollNo = rollNo;
    AppState.currentRecNo = null;
    localStorage.removeItem("rec_no");

    // Form controls
    DOM.$rollNo.prop("disabled", false);
    DOM.$fullName.prop("disabled", false).val("");
    DOM.$studentClass.prop("disabled", false).val("");
    DOM.$birthDate.prop("disabled", false).val("");
    DOM.$enrollmentDate.prop("disabled", false).val("");
    DOM.$address.prop("disabled", false).val("");

    // Buttons
    DOM.$btnSave.prop("disabled", false);
    DOM.$btnUpdate.prop("disabled", true);
    DOM.$btnReset.prop("disabled", false);

    // Focus full name
    DOM.$fullName.trigger("focus");

    // UI Badges
    DOM.$formStateBadge
      .text("New Record (Insert)")
      .css({ background: "var(--primary-light)", color: "var(--primary)" });

    showAlert(
      "Roll-No <strong>" + rollNo + "</strong> is not registered. Please enter student details and click <strong>Save</strong>.",
      "info"
    );
  }

  /**
   * Transition to Existing Student Record Mode
   */
  function populateFieldsForExistingRecord(rollNo, res) {
    AppState.mode = "EXISTING";
    AppState.lastValidatedRollNo = rollNo;

    var dataObj = res.data;
    if (typeof dataObj === "string") {
      try {
        dataObj = JSON.parse(dataObj);
      } catch (e) {
        console.error("Failed to parse response data JSON:", e);
      }
    }

    var record = (dataObj && dataObj.record) ? dataObj.record : {};
    var recNo = (dataObj && dataObj.rec_no) ? dataObj.rec_no : null;

    AppState.currentRecNo = recNo;
    if (recNo) {
      localStorage.setItem("rec_no", recNo);
    }

    // Populate form fields
    DOM.$fullName.val(record["Full-Name"] || record.fullName || "");
    DOM.$studentClass.val(record["Class"] || record.class || "");
    DOM.$birthDate.val(record["Birth-Date"] || record.birthDate || "");
    DOM.$enrollmentDate.val(record["Enrollment-Date"] || record.enrollmentDate || "");
    DOM.$address.val(record["Address"] || record.address || "");

    // Keep Roll-No disabled (Primary Key cannot be altered)
    DOM.$rollNo.prop("disabled", true);

    // Enable remaining editable fields
    DOM.$fullName.prop("disabled", false);
    DOM.$studentClass.prop("disabled", false);
    DOM.$birthDate.prop("disabled", false);
    DOM.$enrollmentDate.prop("disabled", false);
    DOM.$address.prop("disabled", false);

    // Button states
    DOM.$btnSave.prop("disabled", true);
    DOM.$btnUpdate.prop("disabled", false);
    DOM.$btnReset.prop("disabled", false);

    // Focus full name
    DOM.$fullName.trigger("focus");

    // UI Badges
    DOM.$formStateBadge
      .text("Existing Record (Update)")
      .css({ background: "var(--warning-light)", color: "var(--warning)" });

    showAlert(
      "Found existing record for Roll-No <strong>" + rollNo + "</strong> (Record #" + (recNo || "N/A") + "). Modify fields and click <strong>Update</strong>.",
      "success"
    );
  }

  // =========================================================================
  // Validation Engine (Phase 6 Specification)
  // =========================================================================
  function validateFormData(isUpdate) {
    var isValid = true;
    $(".form-control").removeClass("is-invalid");
    $(".invalid-feedback").hide();

    var rollNo = DOM.$rollNo.val().trim();
    var fullName = DOM.$fullName.val().trim();
    var studentClass = DOM.$studentClass.val().trim();
    var birthDate = DOM.$birthDate.val().trim();
    var enrollmentDate = DOM.$enrollmentDate.val().trim();
    var address = DOM.$address.val().trim();

    // 1. Roll-No validation (always required, must not be empty)
    if (!rollNo) {
      DOM.$rollNo.addClass("is-invalid");
      $("#rollNoError").text("Roll-No is required.").show();
      if (isValid) DOM.$rollNo.trigger("focus");
      isValid = false;
    }

    // 2. Full-Name validation (min 2 chars)
    if (!fullName || fullName.length < 2) {
      DOM.$fullName.addClass("is-invalid");
      $("#fullNameError").show();
      if (isValid) DOM.$fullName.trigger("focus");
      isValid = false;
    }

    // 3. Class validation
    if (!studentClass) {
      DOM.$studentClass.addClass("is-invalid");
      $("#classError").show();
      if (isValid) DOM.$studentClass.trigger("focus");
      isValid = false;
    }

    // 4. Birth-Date validation
    if (!birthDate) {
      DOM.$birthDate.addClass("is-invalid");
      $("#birthDateError").text("Birth-Date is required.").show();
      if (isValid) DOM.$birthDate.trigger("focus");
      isValid = false;
    } else {
      var bDate = new Date(birthDate);
      var today = new Date();
      if (isNaN(bDate.getTime()) || bDate >= today) {
        DOM.$birthDate.addClass("is-invalid");
        $("#birthDateError").text("Birth-Date must be a valid date in the past.").show();
        if (isValid) DOM.$birthDate.trigger("focus");
        isValid = false;
      }
    }

    // 5. Enrollment-Date validation
    if (!enrollmentDate) {
      DOM.$enrollmentDate.addClass("is-invalid");
      $("#enrollmentDateError").text("Enrollment-Date is required.").show();
      if (isValid) DOM.$enrollmentDate.trigger("focus");
      isValid = false;
    } else {
      var eDate = new Date(enrollmentDate);
      if (isNaN(eDate.getTime())) {
        DOM.$enrollmentDate.addClass("is-invalid");
        $("#enrollmentDateError").text("Please enter a valid Enrollment-Date.").show();
        if (isValid) DOM.$enrollmentDate.trigger("focus");
        isValid = false;
      }
    }

    // 6. Address validation
    if (!address || address.length < 3) {
      DOM.$address.addClass("is-invalid");
      $("#addressError").show();
      if (isValid) DOM.$address.trigger("focus");
      isValid = false;
    }

    return isValid ? {
      "Roll-No": rollNo,
      "Full-Name": fullName,
      "Class": studentClass,
      "Birth-Date": birthDate,
      "Address": address,
      "Enrollment-Date": enrollmentDate
    } : null;
  }

  // =========================================================================
  // STATE 3: SAVE NEW RECORD
  // =========================================================================
  function saveStudent(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (AppState.isSubmitting) return;

    var data = validateFormData(false);
    if (!data) return;

    var cfg = AppConfig.get();
    if (!cfg.connToken) {
      showAlert(
        "<strong>Cannot Save:</strong> JSONPowerDB connection token is missing. Configure it in <em>'⚙️ Database Settings'</em>.",
        "danger"
      );
      return;
    }

    AppState.isSubmitting = true;
    DOM.$btnSave.prop("disabled", true).html("<span>⏳</span> Saving...");

    try {
      // Create PUT request payload using jpdb-commons helper
      var putRequest = createPUTRequest(
        cfg.connToken,
        JSON.stringify(data),
        cfg.dbName,
        cfg.relName
      );

      // Dispatch to JPDB IML endpoint
      var res = dispatchJPDBCommand(putRequest, cfg.baseUrl, cfg.imlEndpoint);

      DOM.$btnSave.html("<span>💾</span> Save");
      AppState.isSubmitting = false;

      if (res && res.status === 200) {
        showAlert(
          "Student record for Roll-No <strong>" + data["Roll-No"] + "</strong> saved successfully in <strong>" + cfg.dbName + "</strong>!",
          "success"
        );
        initFormState();
      } else {
        var msg = (res && res.message) ? res.message : "Database write failed.";
        showAlert("Failed to save record: " + msg, "danger");
        DOM.$btnSave.prop("disabled", false);
      }
    } catch (err) {
      DOM.$btnSave.html("<span>💾</span> Save").prop("disabled", false);
      AppState.isSubmitting = false;
      showAlert("Error saving record to JSONPowerDB: " + err.message, "danger");
      console.error("Save error:", err);
    }
  }

  // =========================================================================
  // STATE 4: UPDATE EXISTING RECORD
  // =========================================================================
  function updateStudent(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (AppState.isSubmitting) return;

    var recNo = AppState.currentRecNo || localStorage.getItem("rec_no");
    if (!recNo) {
      showAlert("No existing record reference found to update. Please re-enter Roll-No.", "danger");
      return;
    }

    var fullData = validateFormData(true);
    if (!fullData) return;

    // Roll-No remains unchanged; update remaining fields
    var updatePayload = {
      "Full-Name": fullData["Full-Name"],
      "Class": fullData["Class"],
      "Birth-Date": fullData["Birth-Date"],
      "Address": fullData["Address"],
      "Enrollment-Date": fullData["Enrollment-Date"]
    };

    var cfg = AppConfig.get();
    if (!cfg.connToken) {
      showAlert("Cannot update: Missing JSONPowerDB connection token.", "danger");
      return;
    }

    AppState.isSubmitting = true;
    DOM.$btnUpdate.prop("disabled", true).html("<span>⏳</span> Updating...");

    try {
      // Create UPDATE request payload using jpdb-commons helper
      var updateRequest = createUPDATERecordRequest(
        cfg.connToken,
        JSON.stringify(updatePayload),
        cfg.dbName,
        cfg.relName,
        recNo
      );

      // Dispatch to JPDB IML endpoint
      var res = dispatchJPDBCommand(updateRequest, cfg.baseUrl, cfg.imlEndpoint);

      DOM.$btnUpdate.html("<span>✏️</span> Update");
      AppState.isSubmitting = false;

      if (res && res.status === 200) {
        showAlert(
          "Student record for Roll-No <strong>" + fullData["Roll-No"] + "</strong> updated successfully!",
          "success"
        );
        initFormState();
      } else {
        var msg = (res && res.message) ? res.message : "Database update failed.";
        showAlert("Failed to update record: " + msg, "danger");
        DOM.$btnUpdate.prop("disabled", false);
      }
    } catch (err) {
      DOM.$btnUpdate.html("<span>✏️</span> Update").prop("disabled", false);
      AppState.isSubmitting = false;
      showAlert("Error updating record in JSONPowerDB: " + err.message, "danger");
      console.error("Update error:", err);
    }
  }

  // =========================================================================
  // STATE 5: RESET
  // =========================================================================
  function resetForm(e) {
    if (e && e.preventDefault) e.preventDefault();
    initFormState();
    showAlert("Form has been reset to initial state.", "info", 3500);
  }

  // =========================================================================
  // Settings Modal & Live Test
  // =========================================================================
  function openSettingsModal() {
    var cfg = AppConfig.get();
    DOM.$cfgConnToken.val(cfg.connToken);
    DOM.$cfgBaseUrl.val(cfg.baseUrl);
    DOM.$cfgDbName.val(cfg.dbName);
    DOM.$cfgRelName.val(cfg.relName);
    DOM.$cfgTestFeedback.addClass("alert-hidden").empty();
    DOM.$settingsModal.addClass("active");
  }

  function closeSettingsModal() {
    DOM.$settingsModal.removeClass("active");
  }

  function saveSettings() {
    var token = DOM.$cfgConnToken.val().trim();
    var baseUrl = DOM.$cfgBaseUrl.val().trim();

    AppConfig.save(token, baseUrl);
    closeSettingsModal();
    showAlert("Database configuration saved successfully.", "success", 4000);

    // If Roll-No already has a value, trigger lookup with the new token
    if (DOM.$rollNo.val().trim() !== "") {
      handleRollNoValidation();
    }
  }

  function testDatabaseConnection() {
    var token = DOM.$cfgConnToken.val().trim();
    var baseUrl = DOM.$cfgBaseUrl.val().trim() || "http://api.login2explore.com:5577";
    var dbName = DOM.$cfgDbName.val().trim() || "SCHOOL-DB";
    var relName = DOM.$cfgRelName.val().trim() || "STUDENT-TABLE";

    if (!token) {
      DOM.$cfgTestFeedback
        .removeClass("alert-hidden alert-success")
        .addClass("alert-warning")
        .html("Please enter a Connection Token before testing.");
      return;
    }

    DOM.$btnTestConn.prop("disabled", true).html("<span>⏳</span> Testing...");
    DOM.$cfgTestFeedback.addClass("alert-hidden");

    try {
      // Query sample key to test connectivity
      var testReq = createGET_BY_KEYRequest(
        token,
        dbName,
        relName,
        JSON.stringify({ "Roll-No": "test-ping-0" }),
        false,
        false
      );

      var res = dispatchJPDBCommand(testReq, baseUrl, "/api/irl");
      DOM.$btnTestConn.prop("disabled", false).html("<span>⚡</span> Test Connection");

      if (res && (res.status === 200 || res.status === 400)) {
        // 200 (found) or 400 (not found) confirms authentication and endpoint work!
        DOM.$cfgTestFeedback
          .removeClass("alert-hidden alert-danger alert-warning")
          .addClass("alert-success")
          .html("✅ Connection Successful! Connected to " + dbName + " &gt; " + relName);
      } else {
        var msg = (res && res.message) ? res.message : "Unexpected response from JPDB server.";
        DOM.$cfgTestFeedback
          .removeClass("alert-hidden alert-success")
          .addClass("alert-danger")
          .html("❌ Connection Failed (" + (res ? res.status : "Err") + "): " + msg);
      }
    } catch (err) {
      DOM.$btnTestConn.prop("disabled", false).html("<span>⚡</span> Test Connection");
      DOM.$cfgTestFeedback
        .removeClass("alert-hidden alert-success")
        .addClass("alert-danger")
        .html("❌ Network Error: " + err.message);
    }
  }

  // =========================================================================
  // Event Listeners Binding
  // =========================================================================
  function bindEvents() {
    // Primary key validation triggers
    DOM.$rollNo.on("change blur", handleRollNoValidation);
    DOM.$rollNo.on("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleRollNoValidation();
      }
    });

    // Form Action Buttons
    DOM.$btnSave.on("click", saveStudent);
    DOM.$btnUpdate.on("click", updateStudent);
    DOM.$btnReset.on("click", resetForm);

    // Prevent default form submission on enter
    DOM.$form.on("submit", function (e) {
      e.preventDefault();
    });

    // Alert close
    DOM.$btnAlertClose.on("click", hideAlert);

    // Modal Events
    DOM.$btnSettingsModal.on("click", openSettingsModal);
    DOM.$btnSettingsClose.on("click", closeSettingsModal);
    DOM.$btnSaveSettings.on("click", saveSettings);
    DOM.$btnTestConn.on("click", testDatabaseConnection);

    // Close modal on click outside
    DOM.$settingsModal.on("click", function (e) {
      if ($(e.target).is(DOM.$settingsModal)) {
        closeSettingsModal();
      }
    });

    // Close modal on Escape
    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && DOM.$settingsModal.hasClass("active")) {
        closeSettingsModal();
      }
    });
  }

  // =========================================================================
  // Application Bootstrap
  // =========================================================================
  $(document).ready(function () {
    initDOMCache();
    AppConfig.syncMetadataUI();
    bindEvents();
    initFormState();

    // Export test hooks for automated verification
    window._StudentApp = {
      config: AppConfig,
      state: AppState,
      initFormState: initFormState,
      handleRollNoValidation: handleRollNoValidation,
      validateFormData: validateFormData,
      saveStudent: saveStudent,
      updateStudent: updateStudent,
      resetForm: resetForm
    };
  });

})(jQuery);
