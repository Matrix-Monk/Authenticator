import axios from "axios";
import { RECAPTCHA_SECRET } from "../config.js";
export async function verifyRecaptcha(token) {
    try {
        const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
            params: {
                secret: RECAPTCHA_SECRET,
                response: token,
            },
        });
        return response.data.success;
    }
    catch (error) {
        console.error("Recaptcha verification error:", error);
        return false;
    }
}
