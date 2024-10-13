const { mauticApi, erpnextApi, odooApi, logger } = require('./services');
const { authenticateOdoo } = require('./utils');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Assuming you have a User model

// Create a new contact
exports.createContact = async (req, res, next) => {
  try {
    const { firstName, lastName, email, mobile } = req.body;
    const contactData = { firstname: firstName, lastname: lastName, email, mobile };
    const { data } = await mauticApi.post('/api/contacts/new', contactData);
    logger.info(`Created contact: ${data.contact.id}`);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

// Bulk create contacts
exports.bulkCreateContacts = async (req, res, next) => {
  try {
    const contacts = req.body.contacts; // Expecting an array of contact objects
    const results = [];
    for (const contact of contacts) {
      const { data } = await mauticApi.post('/api/contacts/new', contact);
      results.push(data);
    }
    res.status(201).json(results);
  } catch (error) {
    next(error);
  }
};

// Get all contacts
exports.getContacts = async (req, res, next) => {
  try {
    const { data } = await mauticApi.get('/api/contacts');
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Search contacts
exports.searchContacts = async (req, res, next) => {
  try {
    const { query } = req.query; // Get search query from query parameters
    const { data } = await mauticApi.get(`/api/contacts?search=${query}`);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Update a contact
exports.updateContact = async (req, res, next) => {
  try {
    const { contactId, updates } = req.body;
    const { data } = await mauticApi.put(`/api/contacts/${contactId}`, updates);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Delete a contact
exports.deleteContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    await mauticApi.delete(`/api/contacts/${contactId}`);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

// Handle Mautic webhook
exports.handleMauticWebhook = async (req, res, next) => {
  try {
    const { event, data } = req.body; // Assuming Mautic sends event and data
    logger.info(`Received Mautic webhook: ${event}`);
    // Process the webhook event (e.g., update contact)
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

// User registration
exports.registerUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ id: user.id, username: user.username });
  } catch (error) {
    next(error);
  }
};

// User login
exports.loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

// File upload for contacts
exports.uploadContacts = async (req, res, next) => {
  try {
    const file = req.file; // Assuming you use multer for file uploads
    // Process the uploaded file (e.g., parse CSV and create contacts)
    // Implement your CSV parsing logic here
    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    next(error);
  }
};

// Export contacts
exports.exportContacts = async (req, res, next) => {
  try {
    const { data } = await mauticApi.get('/api/contacts');
    const csv = json2csv(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('contacts.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
