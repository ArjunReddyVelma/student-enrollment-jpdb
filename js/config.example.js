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

const JPDB_CONFIG = {
    // JPDB Base URL
    baseUrl: "http://api.login2explore.com:5577",

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
