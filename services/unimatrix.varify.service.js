const axios = require("axios");
const https = require("https");

// Unimatrix Service Configuration
const UNIMATRIX_API_URL_VERIFY =
  "https://api.unimtx.com/?action=otp.verify&accessKeyId=MmK6FpAXkWJyMAfWLAGw75"; // Replace with your actual access key
const UNIMATRIX_API_KEY = "MmK6FpAXkWJyMAfWLAGw75"; // Replace with your actual API key

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
    // Create the request payload as JSON
    const payload = {
      //   to: phone, // Add the phone number
      code: otp, // OTP to verify
    };

    // Make the API request
    const response = await axios.post(
      UNIMATRIX_API_URL_VERIFY,
      payload, // Send the payload in the request body
      {
        headers: {
          Authorization: `Bearer ${UNIMATRIX_API_KEY}`, // Include the API key in the Authorization header
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
