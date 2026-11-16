/**
 * Student Enrollment Management System - Automated Test Suite
 * Senior QA Engineer Test Runner
 *
 * Verifies all 12 Functional Test Cases and Quality Checks
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '..');
console.log("==================================================================");
console.log(" STUDENT ENROLLMENT MANAGEMENT SYSTEM - QA TEST SUITE");
console.log("==================================================================");

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    testsFailed++;
  }
}

// -------------------------------------------------------------------------
// Load and Validate Static Files
// -------------------------------------------------------------------------
const htmlContent = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(projectRoot, 'css/style.css'), 'utf8');
const jpdbCommonsContent = fs.readFileSync(path.join(projectRoot, 'js/jpdb-commons.js'), 'utf8');
const appJsContent = fs.readFileSync(path.join(projectRoot, 'js/app.js'), 'utf8');

// -------------------------------------------------------------------------
// Test 1: Project Structure and Requirements Check
// -------------------------------------------------------------------------
runTest("Verify all 6 required form fields exist in HTML with correct attributes", () => {
  const requiredFields = [
    { id: 'rollNo', label: 'Roll-No', name: 'Roll-No' },
    { id: 'fullName', label: 'Full-Name', name: 'Full-Name' },
    { id: 'studentClass', label: 'Class', name: 'Class' },
    { id: 'birthDate', label: 'Birth-Date', name: 'Birth-Date' },
    { id: 'address', label: 'Address', name: 'Address' },
    { id: 'enrollmentDate', label: 'Enrollment-Date', name: 'Enrollment-Date' }
  ];

  requiredFields.forEach(f => {
    assert(htmlContent.includes(`id="${f.id}"`), `Field with id='${f.id}' missing in HTML`);
    assert(htmlContent.includes(`name="${f.name}"`), `Field with name='${f.name}' missing in HTML`);
  });

  assert(htmlContent.includes('id="btnSave"'), "Save button missing");
  assert(htmlContent.includes('id="btnUpdate"'), "Update button missing");
  assert(htmlContent.includes('id="btnReset"'), "Reset button missing");
});

// -------------------------------------------------------------------------
// Test 2: Verify Database Metadata in UI
// -------------------------------------------------------------------------
runTest("Verify Database metadata: SCHOOL-DB, STUDENT-TABLE, Roll-No", () => {
  assert(htmlContent.includes('SCHOOL-DB'), "SCHOOL-DB not found in HTML");
  assert(htmlContent.includes('STUDENT-TABLE'), "STUDENT-TABLE not found in HTML");
  assert(htmlContent.includes('Roll-No'), "Roll-No not found in HTML");
  assert(htmlContent.includes('Student Enrollment Management System'), "Project title not found");
  assert(htmlContent.includes('Manage student enrollment records using JSONPowerDB.'), "Project description not found");
});

// -------------------------------------------------------------------------
// Test 3: Verify JPDB Commons Request Builders
// -------------------------------------------------------------------------
// Evaluate jpdb-commons in a clean sandbox context
const jpdbContext = { window: {}, document: {}, $: () => {} };
const jpdbFn = new Function('window', 'document', '$', jpdbCommonsContent + '; return { createGET_BY_KEYRequest, createPUTRequest, createUPDATERecordRequest, createSETRequest };');
const jpdb = jpdbFn(jpdbContext.window, jpdbContext.document, jpdbContext.$);

runTest("Verify createGET_BY_KEYRequest syntax and payload structure", () => {
  const token = "TEST_TOKEN_123";
  const dbName = "SCHOOL-DB";
  const relName = "STUDENT-TABLE";
  const keyObj = JSON.stringify({ "Roll-No": "101" });

  const req = jpdb.createGET_BY_KEYRequest(token, dbName, relName, keyObj, false, false);
  const parsed = JSON.parse(req);

  assert.strictEqual(parsed.token, token);
  assert.strictEqual(parsed.cmd, "GET_BY_KEY");
  assert.strictEqual(parsed.dbName, "SCHOOL-DB");
  assert.strictEqual(parsed.rel, "STUDENT-TABLE");
  assert.strictEqual(parsed.jsonStr["Roll-No"], "101");
});

runTest("Verify createPUTRequest syntax and payload structure", () => {
  const token = "TEST_TOKEN_123";
  const dbName = "SCHOOL-DB";
  const relName = "STUDENT-TABLE";
  const data = JSON.stringify({
    "Roll-No": "101",
    "Full-Name": "Alice Smith",
    "Class": "10-A",
    "Birth-Date": "2008-05-15",
    "Address": "123 Elm Street",
    "Enrollment-Date": "2024-06-01"
  });

  const req = jpdb.createPUTRequest(token, data, dbName, relName);
  const parsed = JSON.parse(req);

  assert.strictEqual(parsed.token, token);
  assert.strictEqual(parsed.cmd, "PUT");
  assert.strictEqual(parsed.dbName, "SCHOOL-DB");
  assert.strictEqual(parsed.rel, "STUDENT-TABLE");
  assert.strictEqual(parsed.jsonStr["Full-Name"], "Alice Smith");
});

runTest("Verify createUPDATERecordRequest syntax and payload structure", () => {
  const token = "TEST_TOKEN_123";
  const dbName = "SCHOOL-DB";
  const relName = "STUDENT-TABLE";
  const recNo = "42";
  const updateData = JSON.stringify({
    "Full-Name": "Alice Johnson",
    "Class": "10-B"
  });

  const req = jpdb.createUPDATERecordRequest(token, updateData, dbName, relName, recNo);
  const parsed = JSON.parse(req);

  assert.strictEqual(parsed.token, token);
  assert.strictEqual(parsed.cmd, "UPDATE");
  assert.strictEqual(parsed.dbName, "SCHOOL-DB");
  assert.strictEqual(parsed.rel, "STUDENT-TABLE");
  assert(parsed.jsonStr["42"], "Record key 42 must exist in jsonStr");
  assert.strictEqual(parsed.jsonStr["42"]["Full-Name"], "Alice Johnson");
});

// -------------------------------------------------------------------------
// Simulation of DOM and 12 Functional QA Test Cases
// -------------------------------------------------------------------------

class MockElement {
  constructor(id) {
    this.id = id;
    this.value = "";
    this.properties = { disabled: false };
    this.classes = new Set();
    this.handlers = {};
    this.textValue = "";
    this.htmlValue = "";
    this.style = {};
  }

  ready(fn) {
    if (typeof fn === 'function') fn();
    return this;
  }

  val(v) {
    if (v === undefined) return this.value;
    this.value = v;
    return this;
  }

  prop(propName, value) {
    if (value === undefined) return this.properties[propName];
    this.properties[propName] = value;
    return this;
  }

  addClass(c) {
    c.split(/\s+/).forEach(cls => cls && this.classes.add(cls));
    return this;
  }

  removeClass(c) {
    c.split(/\s+/).forEach(cls => cls && this.classes.delete(cls));
    return this;
  }

  hasClass(c) {
    return this.classes.has(c);
  }

  text(t) {
    if (t === undefined) return this.textValue;
    this.textValue = t;
    return this;
  }

  html(h) {
    if (h === undefined) return this.htmlValue;
    this.htmlValue = h;
    return this;
  }

  css(k, v) {
    if (typeof k === 'object') {
      Object.assign(this.style, k);
    } else {
      this.style[k] = v;
    }
    return this;
  }

  show() {
    this.properties.visible = true;
    return this;
  }

  hide() {
    this.properties.visible = false;
    return this;
  }

  trigger(event) {
    if (this.handlers[event]) {
      this.handlers[event]({ target: this, preventDefault: () => {} });
    }
    return this;
  }

  on(events, handler) {
    events.split(/\s+/).forEach(e => {
      this.handlers[e] = handler;
    });
    return this;
  }
}

// Build Mock Document
const elements = {};
function getOrCreateElem(selector) {
  const key = selector.replace(/^[#.]/, '');
  if (!elements[key]) {
    elements[key] = new MockElement(key);
  }
  return elements[key];
}

const mockJQuery = function(selector) {
  if (typeof selector === 'function') {
    selector(); // document.ready
    return;
  }
  if (typeof selector === 'string') {
    if (selector.startsWith('#')) {
      return getOrCreateElem(selector);
    }
    return getOrCreateElem(selector);
  }
  return new MockElement('tmp');
};

mockJQuery.ajax = function(opts) {};

// Setup browser globals for test environment
global.window = {
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  }
};
global.document = {};
global.localStorage = global.window.localStorage;
global.jQuery = mockJQuery;
global.$ = mockJQuery;

// Load JPDB commons into global
eval(jpdbCommonsContent);

// Load App JS into global
eval(appJsContent);

const app = global.window._StudentApp;
assert(app, "window._StudentApp must be exported");

// Configure test token for testing workflow
global.localStorage.setItem("jpdb_connToken", "MOCK_TOKEN_99999");

// QA Test 1
runTest("Test 1: Initial Page Load (Roll-No focused, other fields disabled, Save/Update/Reset disabled)", () => {
  app.initFormState();

  assert.strictEqual(getOrCreateElem('rollNo').prop('disabled'), false, "Roll-No must be enabled");
  assert.strictEqual(getOrCreateElem('fullName').prop('disabled'), true, "Full-Name must be disabled");
  assert.strictEqual(getOrCreateElem('studentClass').prop('disabled'), true, "Class must be disabled");
  assert.strictEqual(getOrCreateElem('birthDate').prop('disabled'), true, "Birth-Date must be disabled");
  assert.strictEqual(getOrCreateElem('enrollmentDate').prop('disabled'), true, "Enrollment-Date must be disabled");
  assert.strictEqual(getOrCreateElem('address').prop('disabled'), true, "Address must be disabled");

  assert.strictEqual(getOrCreateElem('btnSave').prop('disabled'), true, "Save button must be disabled");
  assert.strictEqual(getOrCreateElem('btnUpdate').prop('disabled'), true, "Update button must be disabled");
  assert.strictEqual(getOrCreateElem('btnReset').prop('disabled'), true, "Reset button must be disabled");
  assert.strictEqual(getOrCreateElem('rollNo').val(), "", "Roll-No must be empty");
});

// QA Test 2
runTest("Test 2: Enter new Roll-No (Record 400 not found -> enable fields, enable Save & Reset, disable Update)", () => {
  app.initFormState();
  getOrCreateElem('rollNo').val("201");

  // Mock JPDB response for 400 (Not Found)
  global.window.executeCommandAtGivenBaseUrl = function(req, url, endpoint) {
    return { status: 400, message: "DATA NOT FOUND" };
  };

  app.handleRollNoValidation();

  assert.strictEqual(getOrCreateElem('fullName').prop('disabled'), false, "Full-Name must be enabled for new record");
  assert.strictEqual(getOrCreateElem('studentClass').prop('disabled'), false, "Class must be enabled for new record");
  assert.strictEqual(getOrCreateElem('birthDate').prop('disabled'), false, "Birth-Date must be enabled for new record");
  assert.strictEqual(getOrCreateElem('enrollmentDate').prop('disabled'), false, "Enrollment-Date must be enabled for new record");
  assert.strictEqual(getOrCreateElem('address').prop('disabled'), false, "Address must be enabled for new record");

  assert.strictEqual(getOrCreateElem('btnSave').prop('disabled'), false, "Save must be enabled for new record");
  assert.strictEqual(getOrCreateElem('btnUpdate').prop('disabled'), true, "Update must be disabled for new record");
  assert.strictEqual(getOrCreateElem('btnReset').prop('disabled'), false, "Reset must be enabled for new record");
});

// QA Test 3
runTest("Test 3: Enter existing Roll-No (Record 200 found -> populate fields, Roll-No disabled, Update & Reset enabled, Save disabled)", () => {
  app.initFormState();
  getOrCreateElem('rollNo').val("101");

  // Mock JPDB response for 200 (Existing Record)
  const existingRecord = {
    "Roll-No": "101",
    "Full-Name": "Peter Parker",
    "Class": "12-Science",
    "Birth-Date": "2006-08-10",
    "Address": "20 Ingram Street, Queens, NY",
    "Enrollment-Date": "2023-07-01"
  };

  global.window.executeCommandAtGivenBaseUrl = function(req, url, endpoint) {
    return {
      status: 200,
      message: "DATA RETRIEVED",
      data: JSON.stringify({ record: existingRecord, rec_no: 88 })
    };
  };

  app.handleRollNoValidation();

  assert.strictEqual(getOrCreateElem('rollNo').prop('disabled'), true, "Roll-No must be disabled when existing record is loaded");
  assert.strictEqual(getOrCreateElem('fullName').val(), "Peter Parker", "Full-Name must be populated");
  assert.strictEqual(getOrCreateElem('studentClass').val(), "12-Science", "Class must be populated");
  assert.strictEqual(getOrCreateElem('birthDate').val(), "2006-08-10", "Birth-Date must be populated");
  assert.strictEqual(getOrCreateElem('address').val(), "20 Ingram Street, Queens, NY", "Address must be populated");
  assert.strictEqual(getOrCreateElem('enrollmentDate').val(), "2023-07-01", "Enrollment-Date must be populated");

  assert.strictEqual(getOrCreateElem('btnSave').prop('disabled'), true, "Save must be disabled for existing record");
  assert.strictEqual(getOrCreateElem('btnUpdate').prop('disabled'), false, "Update must be enabled for existing record");
  assert.strictEqual(getOrCreateElem('btnReset').prop('disabled'), false, "Reset must be enabled for existing record");
  assert.strictEqual(global.localStorage.getItem('rec_no'), "88", "rec_no must be stored in localStorage");
});

// QA Test 4 & 5
runTest("Test 4 & 5: Save new student and verify JPDB PUT request payload", () => {
  app.initFormState();
  getOrCreateElem('rollNo').val("301");
  getOrCreateElem('fullName').val("Bruce Wayne");
  getOrCreateElem('studentClass').val("11-Commerce");
  getOrCreateElem('birthDate').val("2007-02-19");
  getOrCreateElem('address').val("1007 Mountain Drive, Gotham");
  getOrCreateElem('enrollmentDate').val("2024-01-15");

  let executedCommand = null;
  global.window.executeCommandAtGivenBaseUrl = function(req, url, endpoint) {
    executedCommand = { req, url, endpoint };
    return { status: 200, message: "RECORD INSERTED" };
  };

  app.saveStudent({ preventDefault: () => {} });

  assert(executedCommand, "executeCommandAtGivenBaseUrl must be called");
  assert.strictEqual(executedCommand.endpoint, "/api/iml", "Endpoint must be /api/iml for PUT");

  const parsedReq = JSON.parse(executedCommand.req);
  assert.strictEqual(parsedReq.cmd, "PUT");
  assert.strictEqual(parsedReq.dbName, "SCHOOL-DB");
  assert.strictEqual(parsedReq.rel, "STUDENT-TABLE");
  assert.strictEqual(parsedReq.jsonStr["Roll-No"], "301");
  assert.strictEqual(parsedReq.jsonStr["Full-Name"], "Bruce Wayne");

  // Form should return to initial state
  assert.strictEqual(getOrCreateElem('rollNo').val(), "", "Form must reset after successful save");
  assert.strictEqual(getOrCreateElem('rollNo').prop('disabled'), false, "Roll-No must be enabled");
  assert.strictEqual(getOrCreateElem('fullName').prop('disabled'), true, "Full-Name must be disabled");
});

// QA Test 6 & 7
runTest("Test 6 & 7: Update student information and verify JPDB UPDATE request payload", () => {
  // First load existing record
  app.initFormState();
  getOrCreateElem('rollNo').val("101");
  global.window.executeCommandAtGivenBaseUrl = function() {
    return {
      status: 200,
      data: JSON.stringify({
        record: {
          "Roll-No": "101",
          "Full-Name": "Peter Parker",
          "Class": "12-Science",
          "Birth-Date": "2006-08-10",
          "Address": "Queens",
          "Enrollment-Date": "2023-07-01"
        },
        rec_no: 99
      })
    };
  };
  app.handleRollNoValidation();

  // Modify address and class
  getOrCreateElem('studentClass').val("12-A-Honors");
  getOrCreateElem('address').val("Queens, New York City, NY");

  let updateExecuted = null;
  global.window.executeCommandAtGivenBaseUrl = function(req, url, endpoint) {
    updateExecuted = { req, url, endpoint };
    return { status: 200, message: "RECORD UPDATED" };
  };

  app.updateStudent({ preventDefault: () => {} });

  assert(updateExecuted, "Update command must be executed");
  assert.strictEqual(updateExecuted.endpoint, "/api/iml");

  const parsedUpdate = JSON.parse(updateExecuted.req);
  assert.strictEqual(parsedUpdate.cmd, "UPDATE");
  assert.strictEqual(parsedUpdate.dbName, "SCHOOL-DB");
  assert.strictEqual(parsedUpdate.rel, "STUDENT-TABLE");
  assert(parsedUpdate.jsonStr["99"], "Update must target rec_no 99");
  assert.strictEqual(parsedUpdate.jsonStr["99"]["Class"], "12-A-Honors");
  assert.strictEqual(parsedUpdate.jsonStr["99"]["Address"], "Queens, New York City, NY");
  assert.strictEqual(parsedUpdate.jsonStr["99"]["Roll-No"], undefined, "Roll-No should not be modified in update payload");
});

// QA Test 8
runTest("Test 8: Reset the form restores initial state", () => {
  getOrCreateElem('rollNo').val("999");
  getOrCreateElem('fullName').val("Temporary Data").prop('disabled', false);
  getOrCreateElem('btnSave').prop('disabled', false);

  app.resetForm({ preventDefault: () => {} });

  assert.strictEqual(getOrCreateElem('rollNo').val(), "", "Roll-No must be empty");
  assert.strictEqual(getOrCreateElem('fullName').val(), "", "Full-Name must be empty");
  assert.strictEqual(getOrCreateElem('rollNo').prop('disabled'), false, "Roll-No must be enabled");
  assert.strictEqual(getOrCreateElem('fullName').prop('disabled'), true, "Full-Name must be disabled");
  assert.strictEqual(getOrCreateElem('btnSave').prop('disabled'), true, "Save must be disabled");
  assert.strictEqual(getOrCreateElem('btnUpdate').prop('disabled'), true, "Update must be disabled");
  assert.strictEqual(getOrCreateElem('btnReset').prop('disabled'), true, "Reset must be disabled");
});

// QA Test 9
runTest("Test 9: Submit empty fields - validation prevents submission", () => {
  app.initFormState();
  getOrCreateElem('rollNo').val("401");
  getOrCreateElem('fullName').val(""); // empty
  getOrCreateElem('studentClass').val(""); // empty

  const data = app.validateFormData(false);
  assert.strictEqual(data, null, "Validation must return null when required fields are empty");
  assert(getOrCreateElem('fullName').hasClass('is-invalid'), "Full-Name should be marked invalid");
});

// QA Test 10
runTest("Test 10: Try duplicate Roll-No (loads existing record, blocks duplicate insert)", () => {
  app.initFormState();
  getOrCreateElem('rollNo').val("101");

  global.window.executeCommandAtGivenBaseUrl = function() {
    return {
      status: 200,
      data: JSON.stringify({
        record: {
          "Roll-No": "101",
          "Full-Name": "Existing Student",
          "Class": "10",
          "Birth-Date": "2008-01-01",
          "Address": "City",
          "Enrollment-Date": "2024-01-01"
        },
        rec_no: 5
      })
    };
  };

  app.handleRollNoValidation();

  assert.strictEqual(getOrCreateElem('btnSave').prop('disabled'), true, "Save button must be disabled to prevent duplicate insert");
  assert.strictEqual(getOrCreateElem('btnUpdate').prop('disabled'), false, "Update button must be enabled");
  assert.strictEqual(getOrCreateElem('rollNo').prop('disabled'), true, "Roll-No must be locked");
});

// QA Test 11
runTest("Test 11: Simulate database failure (displays error alert without false success)", () => {
  app.initFormState();
  getOrCreateElem('rollNo').val("501");
  getOrCreateElem('fullName').val("Clark Kent");
  getOrCreateElem('studentClass').val("12");
  getOrCreateElem('birthDate').val("2006-04-18");
  getOrCreateElem('address').val("Metropolis");
  getOrCreateElem('enrollmentDate').val("2024-02-01");

  global.window.executeCommandAtGivenBaseUrl = function() {
    return { status: 500, message: "Internal JPDB Server Error" };
  };

  app.saveStudent({ preventDefault: () => {} });

  assert(getOrCreateElem('alertBox').hasClass('alert-danger'), "Alert must have alert-danger class");
  assert(getOrCreateElem('alertContent').htmlValue.includes("Internal JPDB Server Error"), "Error message must be presented to user");
});

// QA Test 12
runTest("Test 12: Verify CSS Responsive rules for mobile and desktop screens", () => {
  assert(cssContent.includes('@media (max-width: 680px)'), "Mobile responsive media query missing");
  assert(cssContent.includes('grid-template-columns'), "Grid template columns missing");
  assert(cssContent.includes('--font-sans'), "Modern typography variable missing");
});

console.log("==================================================================");
console.log(` SUMMARY: ${testsPassed} passed, ${testsFailed} failed out of ${testsPassed + testsFailed} tests.`);
console.log("==================================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("ALL TESTS COMPLETED SUCCESSFULLY! Ready for release.");
}
