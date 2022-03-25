import * as readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
/**
 * @param {string} query 
 * @returns {Promise<string>}
 */
const prompt = (query) => new Promise((resolve, _) => rl.question(query, resolve));

export {prompt, rl};