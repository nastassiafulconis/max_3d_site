#!/usr/bin/env node
// Generates the ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET values for the admin panel.
// Usage: npm run hash-password   (you'll be prompted; the password is not echoed or saved)
import { randomBytes, scrypt } from "crypto";
import { createInterface } from "readline";

function prompt(question) {
    return new Promise((resolve) => {
        const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
        rl._writeToOutput = (s) => {
            if (s.startsWith(question)) rl.output.write(s);
        };
        rl.question(question, (answer) => {
            rl.close();
            process.stdout.write("\n");
            resolve(answer);
        });
    });
}

const password = await prompt("New admin password: ");
const confirm = await prompt("Repeat password: ");
if (confirm !== password) {
    console.error("Passwords don't match.");
    process.exit(1);
}
if (password.length < 12) {
    console.error("Please use at least 12 characters (a passphrase of 4+ random words is ideal).");
    process.exit(1);
}

const salt = randomBytes(16);
const hash = await new Promise((resolve, reject) =>
    scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key)))
);

console.log("\nAdd these environment variables to your hosting provider:\n");
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${hash.toString("hex")}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
