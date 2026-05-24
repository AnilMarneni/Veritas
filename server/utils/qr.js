const QRCode = require('qrcode');

/**
 * Generates a Base64 QR code image string linking to the product's public verification page
 * @param {string} productId - MongoDB ObjectId of the product
 * @param {string} hostUrl - Base client host URL (e.g. http://localhost:3000)
 * @returns {Promise<string>} Base64 data URL
 */
const generateProductQRCode = async (productId, hostUrl = 'http://localhost:3000') => {
  try {
    const verifyUrl = `${hostUrl}/trace/${productId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      color: {
        dark: '#1e3a8a', // Dark blue
        light: '#ffffff' // White background
      },
      width: 300,
      margin: 2
    });
    return qrDataUrl;
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    throw new Error('Failed to generate product QR code');
  }
};

module.exports = { generateProductQRCode };
