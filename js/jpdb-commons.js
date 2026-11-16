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

var jpdbBaseURL = "http://api.login2explore.com:5577";

function setBaseUrl(apiBaseUrl) {
    jpdbBaseURL = apiBaseUrl;
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
 */
function executeCommandAtGivenBaseUrl(reqString, dbBaseUrl, apiEndPointUrl) {
    var url = dbBaseUrl + apiEndPointUrl;
    var jsonObj;
    $.ajax({
        url: url,
        type: "POST",
        data: reqString,
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result) {
            jsonObj = typeof result === "object" ? result : JSON.parse(result);
        },
        error: function (result) {
            try {
                var dataJsonObj = result.responseText;
                jsonObj = typeof dataJsonObj === "object" ? dataJsonObj : JSON.parse(dataJsonObj);
            } catch (e) {
                jsonObj = {
                    status: result.status || 500,
                    message: result.statusText || "Database server unreachable or network error"
                };
            }
        }
    });
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
        createGET_BY_KEYRequest: createGET_BY_KEYRequest,
        createPUTRequest: createPUTRequest,
        createUPDATERecordRequest: createUPDATERecordRequest,
        createSETRequest: createSETRequest,
        executeCommandAtGivenBaseUrl: executeCommandAtGivenBaseUrl,
        executeCommand: executeCommand,
        setBaseUrl: setBaseUrl
    };
}

