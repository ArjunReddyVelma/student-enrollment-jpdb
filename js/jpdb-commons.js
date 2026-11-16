/**
 * JsonPowerDB Common JavaScript Library (jpdb-commons.js)
 * Official API helper functions for Login2Xplore JsonPowerDB
 *
 * Provides request builders and AJAX dispatchers for:
 * - createGET_BY_KEYRequest
 * - createPUTRequest
 * - createUPDATERecordRequest
 * - createSETRequest
 * - executeCommandAtGivenBaseUrl
 * - executeCommand
 */

var jpdbBaseURL = "https://api.login2explore.com:5577";

function normalizeJpdbUrl(url) {
    if (!url) return "https://api.login2explore.com:5577";
    url = url.trim();
    // Port 5577 on api.login2explore.com terminates TLS (HTTPS) directly
    if (url.startsWith("http://api.login2explore.com")) {
        url = url.replace("http://", "https://");
    }
    return url.replace(/\/+$/, "");
}

function setBaseUrl(apiBaseUrl) {
    jpdbBaseURL = normalizeJpdbUrl(apiBaseUrl);
}

/**
 * Creates GET_BY_KEY request payload string for JPDB /api/irl endpoint
 */
function createGET_BY_KEYRequest(token, dbname, relationName, jsonObjStr, createTime, updateTime) {
    if (createTime !== true) createTime = false;
    if (updateTime !== true) updateTime = false;
    var value1 = "{\n"
            + "\"token\" : \""
            + token
            + "\",\n" + "\"cmd\" : \"GET_BY_KEY\",\n"
            + "\"dbName\": \""
            + dbname
            + "\",\n"
            + "\"rel\" : \""
            + relationName
            + "\",\n"
            + "\"jsonStr\":\n"
            + jsonObjStr
            + ",\n"
            + "\"createTime\":"
            + createTime
            + ",\n"
            + "\"updateTime\":"
            + updateTime
            + "\n"
            + "}";
    return value1;
}

/**
 * Creates PUT request payload string for JPDB /api/iml endpoint (Insert record)
 */
function createPUTRequest(connToken, jsonObj, dbName, relName) {
    var putRequest = "{\n"
            + "\"token\" : \""
            + connToken
            + "\",\n"
            + "\"dbName\": \""
            + dbName
            + "\",\n"
            + "\"cmd\" : \"PUT\",\n"
            + "\"rel\" : \""
            + relName
            + "\",\n"
            + "\"jsonStr\": \n"
            + jsonObj
            + "\n"
            + "}";
    return putRequest;
}

/**
 * Creates UPDATE request payload string for JPDB /api/iml endpoint (Update record by rec_no)
 */
function createUPDATERecordRequest(token, jsonObj, dbName, relName, reqId) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\",\n"
            + "\"dbName\": \""
            + dbName
            + "\",\n"
            + "\"cmd\" : \"UPDATE\",\n"
            + "\"rel\" : \""
            + relName
            + "\",\n"
            + "\"jsonStr\":{ \""
            + reqId
            + "\":\n"
            + jsonObj
            + "\n}"
            + "\n}";
    return req;
}

/**
 * Creates SET request payload string for JPDB /api/iml endpoint
 */
function createSETRequest(token, jsonStr, dbName, relName, type, primaryKey, uniqueKeys, foreignKeys) {
    if (type === undefined) type = "DEFAULT";
    var req = {
        token: token,
        cmd: "SET",
        dbName: dbName,
        rel: relName,
        type: type,
        jsonStr: typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr
    };
    if (primaryKey) req.primaryKey = primaryKey;
    if (uniqueKeys) req.uniqueKeys = uniqueKeys;
    if (foreignKeys) req.foreignKeys = foreignKeys;
    return JSON.stringify(req);
}

/**
 * Executes a JPDB command against a specified Base URL and API Endpoint
 * Handles HTTP 200, 400, 401, CORS, and network errors gracefully.
 */
function executeCommandAtGivenBaseUrl(reqString, dbBaseUrl, apiEndPointUrl) {
    dbBaseUrl = normalizeJpdbUrl(dbBaseUrl);
    var url = dbBaseUrl + apiEndPointUrl;
    var jsonObj = null;

    if (typeof $ !== "undefined" && typeof $.ajax === "function") {
        $.ajax({
            url: url,
            type: "POST",
            data: reqString,
            async: false,
            contentType: "text/plain; charset=utf-8",
            dataType: "text", // use text to avoid parsererror when JPDB returns text/html Content-Type
            success: function (result) {
                try {
                    jsonObj = typeof result === "object" ? result : JSON.parse(result);
                } catch (e) {
                    jsonObj = { status: 200, message: "Response received", raw: result };
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var rawText = jqXHR.responseText;
                if (rawText) {
                    try {
                        jsonObj = JSON.parse(rawText);
                    } catch (e) {
                        jsonObj = {
                            status: jqXHR.status || 500,
                            message: rawText || errorThrown || "Server error"
                        };
                    }
                } else {
                    jsonObj = {
                        status: jqXHR.status || 0,
                        message: jqXHR.status === 0
                            ? "Network error or CORS/SSL block (Ensure HTTPS is used)"
                            : (errorThrown || "Request failed with HTTP status " + jqXHR.status)
                    };
                }
            }
        });
    }

    return jsonObj;
}

/**
 * Executes a JPDB command using the default jpdbBaseURL
 */
function executeCommand(reqString, apiEndPointUrl) {
    return executeCommandAtGivenBaseUrl(reqString, jpdbBaseURL, apiEndPointUrl);
}

// Global and CommonJS exports for environments
if (typeof window !== "undefined") {
    window.normalizeJpdbUrl = normalizeJpdbUrl;
    window.createGET_BY_KEYRequest = createGET_BY_KEYRequest;
    window.createPUTRequest = createPUTRequest;
    window.createUPDATERecordRequest = createUPDATERecordRequest;
    window.createSETRequest = createSETRequest;
    window.executeCommandAtGivenBaseUrl = executeCommandAtGivenBaseUrl;
    window.executeCommand = executeCommand;
    window.setBaseUrl = setBaseUrl;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        normalizeJpdbUrl: normalizeJpdbUrl,
        createGET_BY_KEYRequest: createGET_BY_KEYRequest,
        createPUTRequest: createPUTRequest,
        createUPDATERecordRequest: createUPDATERecordRequest,
        createSETRequest: createSETRequest,
        executeCommandAtGivenBaseUrl: executeCommandAtGivenBaseUrl,
        executeCommand: executeCommand,
        setBaseUrl: setBaseUrl
    };
}
