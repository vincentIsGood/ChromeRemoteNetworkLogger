const fs = require("fs");
const vm = require("vm");

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}
function assertEquals(target, object) {
    if (target !== object) {
        console.log(target, object);
        throw new Error(`Assertion failed: '${target}' does not euqal to '${object}'`);
    }
}
function assertObjectEquals(target, object) {
    if(Object.keys(target).length != Object.keys(object).length)
        throw new Error("Assertion failed: Object keys differ");
    for(let prop in target){
        assertEquals(target[prop], object[prop]);
    }
}

console.log("[PreCommit] Start Checking index.js");

const content = fs.readFileSync("./src/index.js");
const start = content.indexOf("/// @config-check");
const end = content.indexOf("/// @end-config-check");

const configScript = new vm.Script(content.toString().substring(start, end));
configScript.runInThisContext();

assert(OUTPUT_JSON_TO_FILE === false);
assertEquals(OUTPUT_FILE, "out.json");
assertObjectEquals(CONFIG, {
    host: "127.0.0.1",
    port: 9222,
    local: true,
});
assertEquals(TARGET_URL, "https://google.com");

console.log("[PreCommit] All good.");