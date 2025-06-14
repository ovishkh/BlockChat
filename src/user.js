import GUN from "gun";
import "gun/sea";
import "gun/axe";
import { writable } from "svelte/store";

// Database
export const db = GUN();

// Gun User
export const user = db.user().recall({ sessionStorage: true });

// Current User's username
export const username = writable("");

user.get("alias").on((v) => username.set(v));

db.on("auth", async (event) => {
    const alias = await user.get("alias"); // username string
    username.set(alias);

    console.log(`signed in as ${alias}`);
});

// Fixed user Shekh
export async function loginShekh() {
    const shekhUsername = 'shekh';
    const shekhPassword = 'shekh@1234';
    await user.auth(shekhUsername, shekhPassword, ({ err }) => {
        if (err) {
            console.error("Shekh login failed:", err);
            // If Shekh doesn't exist, create the user
            if (err.includes("User not found")) {
                user.create(shekhUsername, shekhPassword, ({ err: createErr }) => {
                    if (createErr) {
                        console.error("Shekh creation failed:", createErr);
                    } else {
                        console.log("Shekh created and logged in.");
                    }
                });
            }
        }
    });
}


