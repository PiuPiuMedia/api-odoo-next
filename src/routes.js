const express = require('express');
const { syncContact, syncCustomer, webhookMautic } = require('./controllers');
const { basicAuth } = require('./middleware');

const router = express.Router();

router.use(basicAuth);

router.post('/sync-contact', syncContact);
router.post('/sync-customer', syncCustomer);
router.post('/webhook/mautic', webhookMautic);

module.exports = router;