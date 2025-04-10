const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/emailService');
const auth = require('../middleware/auth');

router.post('/send', auth, async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    await sendEmail({ to, subject, html });
    res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
