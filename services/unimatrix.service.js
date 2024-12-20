const axios = require("axios");
const https = require("https");

// Unimatrix Service Configuration (replace placeholders with actual values)
const UNIMATRIX_API_URL =
  "https://api.unimtx.com/?action=otp.send&accessKeyId=MmK6FpAXkWJyMAfWLAGw75"; // Example URL (replace with your actual access key)
const UNIMATRIX_API_KEY = "MmK6FpAXkWJyMAfWLAGw75"; // Replace with your actual API key

// Create an HTTPS agent with the latest TLS protocol
const agent = new https.Agent({
  secureProtocol: "TLS_method", // Forces the latest available TLS protocol
});

/**
 * Send SMS via Unimatrix Service
 * @param {string} phone - Recipient's phone number
 * @param {string} message - Message to send
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
const sendSMSUnimatrix = async (phone, message) => {
  try {
    // Create the request payload as JSON
    const payload = {
      to: phone, // Add the phone number
      message,
    };
    console.log(message);

    // Make the API request
    const response = await axios.post(
      UNIMATRIX_API_URL,
      payload, // Send the payload in the request body
      {
        headers: {
          Authorization: `Bearer ${UNIMATRIX_API_KEY}`, // Include the API key in the Authorization header
          "Content-Type": "application/json", // Set content type to JSON
        },
        httpsAgent: agent, // Attach the custom HTTPS agent for TLS
      }
    );

    if (response.status === 200) {
      console.log("inter", response.data);
      return { success: true, data: response.data };
    } else {
      return { success: false, error: "Unexpected response status" };
    }
  } catch (error) {
    console.error("Error sending SMS via Unimatrix:", error.message);
    return { success: false, error: error.message };
  }
};

console.log();

module.exports = { sendSMSUnimatrix };
