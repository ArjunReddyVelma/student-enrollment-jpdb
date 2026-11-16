/**
 * JSONPowerDB Configuration Template
 *
 * Instructions:
 * 1. Copy this file to 'config.js' in the same folder:
 *      cp js/config.example.js js/config.js
 * 2. Replace the empty connToken with your JSONPowerDB connection token.
 *    (Note: config.js is excluded from git via .gitignore for security)
 * 3. Alternatively, enter and save the token dynamically in the browser
 *    via the "⚙️ Database Settings" modal in the application UI!
 */

var JPDB_CONFIG = {
    // JPDB Base URL (HTTPS required on port 5577)
    baseUrl: "https://api.login2explore.com:5577",

    // API Endpoints
    irlEndpoint: "/api/irl", // Retrieval (GET_BY_KEY, etc.)
    imlEndpoint: "/api/iml", // Manipulation (PUT, UPDATE, etc.)

    // Database & Relation
    dbName: "SCHOOL-DB",
    relName: "STUDENT-TABLE",

    // Primary Key Field
    primaryKey: "Roll-No",

    // Connection Token (obtain from Login2Explore JPDB Dashboard)
    connToken: ""
};

if (typeof window !== "undefined") {
    window.JPDB_CONFIG = JPDB_CONFIG;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = JPDB_CONFIG;
}
