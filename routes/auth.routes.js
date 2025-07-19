const express = require('express');
const {
  verifyEmailRegist,
  createSession,
  deleteSession,
  InitiatesGoogleFlow,
  googleCallbackHandler,
  resetPasswordRequest,
  confirmResetAndUpdatePassword,
  resendEmailVerification,
  validateTokenResetPassword,
} = require('../controllers/authController');
const { protectedMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// verifikasi email
router.post('/email-verify', verifyEmailRegist);

router.post('/email-verify/resend', resendEmailVerification);

// user login
router.post('/sessions', createSession);

// user logout
router.delete('/sessions', protectedMiddleware, deleteSession);

// Initiates the Google Login flow
router.get('/google', InitiatesGoogleFlow);

// handler redirect dari google callback
router.get('/google/callback', googleCallbackHandler);

// request link reset password
router.post('/reset-password', resetPasswordRequest);

// validasi token reset password
router.post('/reset-password/validate', validateTokenResetPassword);

// reset password dengan password baru {newPassword, token}
router.post('/reset-password/confirm', confirmResetAndUpdatePassword);

module.exports = router;
