const axios = require("axios");
const https = require("https");

// Unimatrix Service Configuration
const UNIMATRIX_API_URL_VERIFY = process.env.UNIMATRIX_API_URL_VERIFY; // Base API URL
const UNIMATRIX_API_KEY = process.env.UNIMATRIX_API_KEY; // Replace with your actual access key

// Create an HTTPS agent with the latest TLS protocol
const agent = new https.Agent({
  secureProtocol: "TLS_method", // Forces the latest available TLS protocol
});

/**
 * Verify OTP via Unimatrix Service
 * @param {string} phone - Recipient's phone number
 * @param {string} otp - OTP to verify
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
const verifyOTPUnimatrix = async (phone, otp) => {
  try {
    // Validate phone number format (E.164)
    if (!/^\+?\d{10,15}$/.test(phone)) {
      return { success: false, error: "Invalid phone number format" };
    }

    // Create the request payload
    const payload = {
      to: phone, // Add the phone number
      code: otp, // OTP to verify
    };

    // Make the API request
    const response = await axios.post(
      `${UNIMATRIX_API_URL_VERIFY}?action=otp.verify&accessKeyId=${UNIMATRIX_API_KEY}`, // Append accessKeyId to the query string
      payload, // Send the payload in the request body
      {
        headers: {
          "Content-Type": "application/json", // Set content type to JSON
        },
        httpsAgent: agent, // Attach the custom HTTPS agent for TLS
      }
    );

    if (response.status === 200 && response.data.code === "0") {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data.message || "OTP verification failed",
      };
    }
  } catch (error) {
    console.error("Error verifying OTP via Unimatrix:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { verifyOTPUnimatrix };
