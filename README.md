# Student Enrollment Management System (JSONPowerDB)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Database: JsonPowerDB](https://img.shields.io/badge/Database-JsonPowerDB-orange.svg)](https://login2explore.com/jpdb/docs.html)
[![Tech: HTML5_CSS3_JS_jQuery](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JS%20%7C%20jQuery-green.svg)](#technology-stack)
[![Playwright: 19_Passed](https://img.shields.io/badge/Playwright%20E2E-19%20Passed-brightgreen.svg)](#testing--qa-report)
[![Unit Tests: 15_Passed](https://img.shields.io/badge/QA%20Tests-15%20Passed-brightgreen.svg)](#testing--qa-report)

A modern, responsive, and robust **Student Enrollment Management System** developed as an academic micro-project utilizing **JsonPowerDB (JPDB)** by Login2Xplore as the serverless real-time database backend.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Problem Statement](#2-problem-statement)
- [3. Key Features](#3-key-features)
- [4. Technology Stack](#4-technology-stack)
- [5. Project Structure](#5-project-structure)
- [6. Database & Relation Architecture](#6-database--relation-architecture)
- [7. Form State Workflow](#7-form-state-workflow)
- [8. Connection Troubleshooting & Root Cause Analysis](#8-connection-troubleshooting--root-cause-analysis)
- [9. Security & Secure Credential Configuration](#9-security--secure-credential-configuration)
- [10. How to Run Locally](#10-how-to-run-locally)
- [11. Testing & QA Report](#11-testing--qa-report)
- [12. Screenshots & Interface Design](#12-screenshots--interface-design)
- [13. Future Improvements](#13-future-improvements)
- [14. License](#14-license)

---

## 1. Project Overview

The **Student Enrollment Management System** provides academic institutions with a seamless, intuitive web interface to enroll new students and maintain existing records. Built following strict software engineering principles and academic guidelines, it replaces conventional relational backend architectures with **JsonPowerDB**, a high-performance, lightweight, multi-mode, real-time database.

---

## 2. Problem Statement

Educational institutions require a clean, responsive, and reliable data-entry interface that enforces primary key uniqueness, prevents duplicate student registrations, validates student personal information, and provides instant lookup and update capabilities without page reloads.

This micro-project addresses these requirements by integrating client-side JavaScript and jQuery directly with JsonPowerDB REST APIs, implementing a multi-state workflow that responds dynamically to the primary key (`Roll-No`).

---

## 3. Key Features

- **Dynamic 5-State Form Lifecycle**: Automatically shifts between Initial, New Record Entry, and Existing Record Update modes based on primary key lookup.
- **Strict Primary Key Verification**: Queries `STUDENT-TABLE` via `GET_BY_KEY` to prevent duplicate primary keys before form submission.
- **Full CRUD Workflow**:
  - **Look up**: Instant retrieval via `/api/irl`.
  - **Save**: Inserts validated records via `/api/iml` using `createPUTRequest`.
  - **Update**: Modifies existing student details via `/api/iml` using `createUPDATERecordRequest`.
  - **Reset**: Restores form to a clean initial state at any stage.
- **Comprehensive Validation**:
  - Required field enforcement for all 6 inputs.
  - Full-Name minimum character constraint.
  - Birth-Date validation ensuring dates are in the past.
  - Enrollment-Date validation.
  - Duplicate primary-key prevention.
- **Enterprise-Grade UI/UX**:
  - Accessible, responsive CSS grid and flexbox layout for mobile, tablet, laptop, and desktop.
  - Real-time spinners, color-coded badges, and clear dismissible alert notifications.
  - Database metadata bar displaying target DB, relation, and primary key.
- **Zero-Secret Commitment**: Fully configurable credential management through `config.example.js` and an interactive in-browser **Database Settings Modal**.

---

## 4. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Markup** | HTML5 | Semantic structure, accessible form fields, and modal dialogs |
| **Styling** | CSS3 (Modern Variables & Grid) | Responsive card design, color palettes, focus indicators, print styles |
| **Client Scripting** | JavaScript (ES6+) | Application state machine, event orchestration, DOM manipulation |
| **DOM & AJAX** | jQuery 3.6.4 | Cross-browser DOM abstraction and synchronous request dispatching |
| **Database Engine** | JsonPowerDB (Login2Xplore) | High-performance document database for indexing, retrieval, and persistence |
| **Database Helper** | `jpdb-commons.js` | Standard JPDB request builder functions (`PUT`, `GET_BY_KEY`, `UPDATE`) |
| **Browser Testing** | Playwright Chromium | End-to-end automated browser test suite verifying all 17 requirements |
| **Unit Testing** | Node.js Test Runner | Headless test suite validating schema, request payloads, and UI transitions |
| **Version Control** | Git & GitHub | Source tracking, semantic commits, and branch management |

---

## 5. Project Structure

```text
student-enrollment-jpdb/
├── index.html              # Main application web interface
├── css/
│   └── style.css           # Modern responsive stylesheet
├── js/
│   ├── app.js              # Application controller & state machine
│   ├── config.example.js   # Configuration template for developers
│   └── jpdb-commons.js     # JsonPowerDB official client library & local fallback
├── assets/
│   └── icon.svg            # Institutional graduation cap emblem
├── tests/
│   ├── playwright-e2e.js   # End-to-end automated browser test suite (Playwright)
│   ├── test-runner.js      # Headless automated QA test runner (Node.js)
│   └── test-suite.html     # Interactive in-browser QA test runner
├── README.md               # Comprehensive architectural & user documentation
├── .gitignore              # Protects secrets (config.js) and operating system files
└── LICENSE                 # MIT Open-Source License
```

---

## 6. Database & Relation Architecture

The project connects directly to **JsonPowerDB** with the following database specifications:

| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Database Name** | `SCHOOL-DB` | Target institutional database container |
| **Relation Name** | `STUDENT-TABLE` | Target table/relation for student enrollment |
| **Primary Key** | `Roll-No` | Unique identifier indexed column |
| **Base URL** | `https://api.login2explore.com:5577` | Secured JsonPowerDB server endpoint (HTTPS) |
| **IRL Endpoint** | `/api/irl` | Integrated Retrieval Language (Lookup queries) |
| **IML Endpoint** | `/api/iml` | Integrated Manipulation Language (Insert & Update) |

### Relation Columns Schema

| Field Name | Type | Form Control | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `Roll-No` | String/Number | Text Input | **Yes (PK)** | Unique student identification number (e.g., `101`) |
| `Full-Name` | String | Text Input | **Yes** | Student's full legal name (minimum 2 characters) |
| `Class` | String | Text Input | **Yes** | Academic class / grade level (e.g., `10-A`, `12-Science`) |
| `Birth-Date` | Date (YYYY-MM-DD) | Date Picker | **Yes** | Date of birth (must be in the past) |
| `Address` | String | Textarea | **Yes** | Residential address (street, city, state, postal code) |
| `Enrollment-Date` | Date (YYYY-MM-DD) | Date Picker | **Yes** | Official institutional enrollment date |

---

## 7. Form State Workflow

The application strictly implements the 5-state lifecycle mandated by the academic specification:

```mermaid
flowchart TD
    S1["State 1: Initial Page Load"] -->|"User types Roll-No & blurs/Enter"| S2["State 2: Primary Key Validation via GET_BY_KEY"]
    S2 -->|"Status 400: Not Found"| S3["State 3: New Record Mode"]
    S2 -->|"Status 200: Found"| S4["State 4: Existing Record Mode"]
    S3 -->|"User clicks Save"| SAVE["Validate -> createPUTRequest -> /api/iml"]
    SAVE -->|"Success 200"| S1
    S4 -->|"User clicks Update"| UPDATE["Validate -> createUPDATERecordRequest -> /api/iml"]
    UPDATE -->|"Success 200"| S1
    S3 -->|"User clicks Reset"| S1
    S4 -->|"User clicks Reset"| S1
```

### State 1: Initial Page Load
- The form is initialized empty.
- Cursor automatically focuses the `Roll-No` input.
- `Roll-No` is enabled; all other inputs (`Full-Name`, `Class`, `Birth-Date`, `Address`, `Enrollment-Date`) are **disabled**.
- `Save`, `Update`, and `Reset` action buttons are **disabled**.

### State 2: Primary Key Validation
- Triggered when the user types a `Roll-No` and tabs away, blurs, or presses `Enter`.
- If `Roll-No` is empty, returns to State 1.
- Otherwise, dispatches a `createGET_BY_KEYRequest` to `/api/irl`:
  - **Record Does NOT Exist (`status: 400`)**:
    - Remaining inputs are enabled.
    - `Save` and `Reset` buttons are enabled.
    - `Update` button remains disabled.
    - Cursor moves to `Full-Name`.
    - Information badge displays: *"Roll-No is available. Enter student information to save record."*
  - **Record ALREADY Exists (`status: 200`)**:
    - Complete record data is parsed from `res.data.record` and populated into fields.
    - Internal record number (`rec_no`) is stored in `localStorage` for update targeting.
    - `Roll-No` is **disabled** to protect primary key integrity.
    - Remaining inputs are enabled for modification.
    - `Update` and `Reset` buttons are enabled.
    - `Save` button remains disabled.
    - Cursor moves to `Full-Name`.

### State 3: Save New Record
- Validates all input fields against emptiness, string lengths, and date integrity.
- Builds an insertion payload using `createPUTRequest(token, jsonObj, "SCHOOL-DB", "STUDENT-TABLE")`.
- Dispatches payload to `/api/iml`.
- Upon verified HTTP 200 response, displays a prominent success notification, resets form to State 1, and refocuses `Roll-No`.

### State 4: Update Existing Record
- Ensures `rec_no` is present from previous lookup.
- Keeps `Roll-No` unaltered.
- Validates modified fields.
- Builds update payload using `createUPDATERecordRequest(token, jsonObj, "SCHOOL-DB", "STUDENT-TABLE", recNo)`.
- Dispatches payload to `/api/iml`.
- Upon verified HTTP 200 response, displays success confirmation, resets form to State 1, and refocuses `Roll-No`.

### State 5: Reset
- Clears all form inputs and validation feedback.
- Removes any cached `rec_no`.
- Restores the exact State 1 conditions with `Roll-No` focused.

---

## 8. Connection Troubleshooting & Root Cause Analysis

### Diagnosing "Connection Failed (Err): Unexpected response from JPDB server."

During live testing, connection attempts may fail with this error due to two primary technical causes:

1. **Protocol Mismatch (HTTP vs. HTTPS on Port 5577):**
   - **Root Cause:** The server endpoint `api.login2explore.com:5577` terminates TLS (HTTPS) directly with a valid Let's Encrypt SSL certificate. When an unencrypted request is sent via `http://api.login2explore.com:5577`, the server returns a binary TLS alert record (`\x15\x03\x03\x00\x02\x02P`). Browsers reject this as an `ERR_INVALID_HTTP_RESPONSE`, and jQuery receives an empty response with status 0.
   - **Fix:** All endpoints have been upgraded to `https://api.login2explore.com:5577`. In addition, `normalizeJpdbUrl()` automatically upgrades any entered `http://` URLs to `https://`.

2. **Asynchronous Execution in External Libraries:**
   - **Root Cause:** Standard jQuery `$.post()` is asynchronous. When called synchronously without `async: false`, it returns immediately before the AJAX callback finishes, returning `undefined` and displaying `(Err): Unexpected response`.
   - **Fix:** Both `executeCommandAtGivenBaseUrl` in `js/jpdb-commons.js` and `dispatchJPDBCommand` in `js/app.js` enforce synchronous, robust request execution with explicit `dataType: "text"` to handle JPDB's `text/html;charset=utf-8` response headers gracefully.

### Meaningful Connection States

The application implements granular connection states:

| State | Status Badge | Description |
| :--- | :--- | :--- |
| **Not Configured** | Amber | Token is empty. Prompts user to input token in Database Settings. |
| **Connecting** | Blue | Request in flight; loading spinner displayed. |
| **Connected** | Green | Authenticated successfully; database and relation reached. |
| **Authentication Failed** | Red | Token is invalid or revoked (JPDB HTTP 401). |
| **Database Access Failed** | Amber | Token is valid, but database or relation does not exist yet (created on first save). |
| **Server Unavailable** | Red | JPDB server returned 5xx status. |
| **Network Error** | Red | Network unreachable, DNS failure, or SSL block. |

---

## 9. Security & Secure Credential Configuration

> [!IMPORTANT]
> **Zero Credential Exposure Guarantee:**
> Database connection tokens and secrets must **never** be committed to public version control. This repository enforces two safe, isolated mechanisms:

### Method A: Browser UI Settings Modal (Recommended)
1. Launch the application in any web browser.
2. Click the **"⚙️ Database Settings"** button in the top navigation header.
3. Paste your JPDB Connection Token.
4. Click **"⚡ Test Connection"** to verify that your token communicates with `SCHOOL-DB`.
5. Click **"✓ Save Settings"**. The token is stored in your browser's private `localStorage`.

### Method B: Local File Configuration (`config.js`)
1. Duplicate the provided template file:
   ```bash
   cp js/config.example.js js/config.js
   ```
2. Open `js/config.js` in your editor and enter your token:
   ```javascript
   var JPDB_CONFIG = {
       baseUrl: "https://api.login2explore.com:5577",
       irlEndpoint: "/api/irl",
       imlEndpoint: "/api/iml",
       dbName: "SCHOOL-DB",
       relName: "STUDENT-TABLE",
       primaryKey: "Roll-No",
       connToken: "YOUR_ACTUAL_JPDB_TOKEN"
   };

   if (typeof window !== "undefined") {
       window.JPDB_CONFIG = JPDB_CONFIG;
   }
   ```
3. `js/config.js` is pre-configured in `.gitignore`, preventing accidental commits.

### Security Limitations of Client-Side Web Apps
> [!NOTE]
> In any pure client-side application (HTML/CSS/JS) communicating directly with a database, the authentication token resides in browser memory or `localStorage`. A user with access to Developer Tools can inspect client-side network traffic. For high-security enterprise deployments, an intermediary backend proxy (e.g., Node.js/Express) should be introduced to keep database tokens strictly on the server.

---

## 10. How to Run Locally

### Option 1: Direct File Launch
Simply open `index.html` in any modern web browser (Google Chrome, Mozilla Firefox, Safari, Microsoft Edge).

### Option 2: Local HTTP Server (Python)
```bash
cd /path/to/student-enrollment-jpdb
python3 -m http.server 8000
```
Then navigate to: `http://localhost:8000`

---

## 11. Testing & QA Report

### A. Playwright Automated Browser E2E Test Suite (19 / 19 Passed)
The comprehensive end-to-end browser test suite verifies complete real-world interaction against the live JsonPowerDB server:

```bash
node tests/playwright-e2e.js
```

```text
==================================================================
 STUDENT ENROLLMENT SYSTEM — PLAYWRIGHT BROWSER E2E TEST SUITE
==================================================================
[PASS] Test 1: Initial Page Load (Roll-No enabled & focused, all others disabled)
[PASS] Test 2: Database Settings Modal (Open, close on X, close on Escape)
[PASS] Test 3: Token Configuration & Masking (Password type & localStorage persistence)
[PASS] Test 4: Live Connection Test against JPDB ([Connected] Successfully authenticated)
[PASS] Test 5: New Roll-No Lookup Workflow (New Roll-No verified as new)
[PASS] Test 6: Save Student (Live insertion into SCHOOL-DB > STUDENT-TABLE)
[PASS] Test 7: Retrieve Saved Student (Data retrieved and verified)
[PASS] Test 8: Update Student (Live update in SCHOOL-DB > STUDENT-TABLE)
[PASS] Test 9: Retrieve Updated Student (Verified persistence of modified fields)
[PASS] Test 10: Reset Functionality (Restored clean Initial State)
[PASS] Test 11: Validation Engine (Empty fields & future Birth-Date rejected)
[PASS] Test 12: Duplicate Roll-No Prevention (Loads existing, locks Save button)
[PASS] Test 13: Invalid Token Handling (Authentic 401 error message displayed)
[PASS] Test 14: Network Failure Handling (Clear error displayed without false success)
[PASS] Test 15: Browser Console Check (Zero uncaught JavaScript exceptions)
[PASS] Test 16: Responsive UI Layout at Desktop (1440x900px)
[PASS] Test 16: Responsive UI Layout at Laptop (1280x800px)
[PASS] Test 16: Responsive UI Layout at Tablet (768x1024px)
[PASS] Test 16: Responsive UI Layout at Mobile (390x844px)
==================================================================
 SUMMARY: 19 passed, 0 failed out of 19 tests.
==================================================================
```

### B. Headless QA Unit Test Suite (15 / 15 Passed)
```bash
node tests/test-runner.js
```
```text
==================================================================
 SUMMARY: 15 passed, 0 failed out of 15 tests.
==================================================================
```

---

## 12. Screenshots & Interface Design

### Desktop Form Interface
- Modern, clean layout with academic metadata badges: `DB: SCHOOL-DB`, `Relation: STUDENT-TABLE`, `Primary Key: Roll-No`.
- Prominent Primary Key identification tag on Roll-No.
- Real-time status indicators and color-coded action buttons.

### Mobile & Tablet Adaptation
- Breakpoint at `680px` automatically converts 2-column grid to an accessible single-column stack.
- Touch-friendly button sizes and full-width actions.
- Fully tested on viewports: 1440px, 1280px, 768px, and 390px.

---

## 13. Future Improvements

- Add bulk enrollment CSV import utilizing `createPUT_ALLRequest`.
- Add photo/avatar document upload support with JPDB document storage.
- Add student record export to PDF enrollment certificates.
- Add multi-language localization (i18n).

---

## 14. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
