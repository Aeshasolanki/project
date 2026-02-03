const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

/**
 * Generate a random 6-digit OTP
 * @returns {number} 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

/**
 * Send OTP via SMS using Twilio
 * @param {string} phoneNumber - Recipient phone number
 * @param {number} otp - OTP code to send
 * @param {string} language - Language preference ('ar' or 'en')
 */
async function sendOTP(phoneNumber, otp, language = 'en') {
  try {
    if (!twilioClient) {
      console.warn('Twilio not configured. Skipping SMS send.');
      console.log(`OTP for ${phoneNumber}: ${otp}`); // Log for testing
      return;
    }

    const messages = {
      en: `Your verification code is: ${otp}. Do not share this code with anyone.`,
      ar: `رمز التحقق الخاص بك هو: ${otp}. لا تشارك هذا الرمز مع أي شخص.`
    };

    const message = messages[language] || messages.en;

    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    });

    console.log(`OTP sent successfully via Twilio. SID: ${result.sid}`);
    return result;
  } catch (error) {
    console.error('Error sending OTP via Twilio:', error);
    throw error;
  }
}

/**
 * Verify OTP (basic implementation)
 * Note: In production, this should be handled via database queries in the controller
 * @param {string} phoneNumber - Phone number
 * @param {number} otp - OTP to verify
 * @param {number} storedOtp - Stored OTP from database
 * @param {Date} otpExpire - OTP expiration time
 */
function verifyOTP(otp, storedOtp, otpExpire) {
  // Check if OTP matches
  if (otp !== storedOtp) {
    return {
      success: false,
      message: 'Invalid OTP'
    };
  }

  // Check if OTP has expired
  if (new Date() > new Date(otpExpire)) {
    return {
      success: false,
      message: 'OTP has expired'
    };
  }

  return {
    success: true,
    message: 'OTP verified successfully'
  };
}

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP
};
