const express = require('express');
const { 
  createContact, 
  bulkCreateContacts, 
  getContacts, 
  searchContacts, 
  updateContact, 
  deleteContact, 
  handleMauticWebhook, 
  registerUser, 
  loginUser, 
  uploadContacts, 
  exportContacts 
} = require('./controllers');
const { basicAuth } = require('./middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { body } = require('express-validator');

const router = express.Router();

router.use(basicAuth);

// Contact routes
router.post('/contacts', 
  body('email').isEmail().withMessage('Must be a valid email'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  createContact
);
router.post('/contacts/bulk', bulkCreateContacts);
router.get('/contacts', getContacts);
router.get('/contacts/search', searchContacts);
router.put('/contacts', updateContact);
router.delete('/contacts/:contactId', deleteContact);

// Webhook route
router.post('/webhook/mautic', handleMauticWebhook);

// User routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// File upload route
router.post('/upload-contacts', upload.single('file'), uploadContacts);

// Export route
router.get('/export-contacts', exportContacts);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

module.exports = router;
