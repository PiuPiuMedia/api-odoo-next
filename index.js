const express = require('express');
const axios = require('axios');
const winston = require('winston');
require('dotenv').config();

const app = express();
app.use(express.json());

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'mautic-erpnext-odoo-integration' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// API configurations
const mauticApi = axios.create({
  baseURL: process.env.MAUTIC_BASE_URL,
  auth: {
    username: process.env.MAUTIC_USERNAME,
    password: process.env.MAUTIC_PASSWORD
  }
});

const erpnextApi = axios.create({
  baseURL: process.env.ERPNEXT_BASE_URL,
  headers: {
    'Authorization': `token ${process.env.ERPNEXT_API_KEY}:${process.env.ERPNEXT_API_SECRET}`
  }
});

const odooApi = axios.create({
  baseURL: process.env.ODOO_BASE_URL
});

// Helper function to authenticate with Odoo
async function authenticateOdoo() {
  const response = await odooApi.post('/web/session/authenticate', {
    jsonrpc: '2.0',
    params: {
      db: process.env.ODOO_DB,
      login: process.env.ODOO_USERNAME,
      password: process.env.ODOO_PASSWORD
    }
  });
  return response.data.result.session_id;
}

// Basic authentication middleware
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  if (user === process.env.API_USERNAME && pass === process.env.API_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

app.use(basicAuth);

// Sync contact from Mautic to ERPNext and Odoo
app.post('/sync-contact', async (req, res) => {
  try {
    const { contactId } = req.body;

    // Fetch contact from Mautic
    const mauticResponse = await mauticApi.get(`/api/contacts/${contactId}`);
    const mauticContact = mauticResponse.data.contact;

    // Sync to ERPNext
    const erpnextCustomer = {
      doctype: 'Customer',
      customer_name: `${mauticContact.fields.all.firstname} ${mauticContact.fields.all.lastname}`,
      email_id: mauticContact.fields.all.email,
      mobile_no: mauticContact.fields.all.mobile
    };
    await erpnextApi.post('/api/resource/Customer', erpnextCustomer);

    // Sync to Odoo
    const odooSessionId = await authenticateOdoo();
    const odooPartner = {
      name: `${mauticContact.fields.all.firstname} ${mauticContact.fields.all.lastname}`,
      email: mauticContact.fields.all.email,
      phone: mauticContact.fields.all.mobile
    };
    await odooApi.post('/web/dataset/call_kw', {
      model: 'res.partner',
      method: 'create',
      args: [odooPartner],
      kwargs: {},
      session_id: odooSessionId
    });

    logger.info(`Contact ${contactId} synced successfully`);
    res.json({ message: 'Contact synced successfully' });
  } catch (error) {
    logger.error('Error syncing contact:', error);
    res.status(500).json({ error: 'An error occurred while syncing the contact' });
  }
});

// Sync customer from ERPNext to Mautic and Odoo
app.post('/sync-customer', async (req, res) => {
  try {
    const { customerId } = req.body;

    // Fetch customer from ERPNext
    const erpnextResponse = await erpnextApi.get(`/api/resource/Customer/${customerId}`);
    const erpnextCustomer = erpnextResponse.data.data;

    // Sync to Mautic
    const mauticContact = {
      firstname: erpnextCustomer.customer_name.split(' ')[0],
      lastname: erpnextCustomer.customer_name.split(' ').slice(1).join(' '),
      email: erpnextCustomer.email_id,
      mobile: erpnextCustomer.mobile_no
    };
    await mauticApi.post('/api/contacts/new', mauticContact);

    // Sync to Odoo
    const odooSessionId = await authenticateOdoo();
    const odooPartner = {
      name: erpnextCustomer.customer_name,
      email: erpnextCustomer.email_id,
      phone: erpnextCustomer.mobile_no
    };
    await odooApi.post('/web/dataset/call_kw', {
      model: 'res.partner',
      method: 'create',
      args: [odooPartner],
      kwargs: {},
      session_id: odooSessionId
    });

    logger.info(`Customer ${customerId} synced successfully`);
    res.json({ message: 'Customer synced successfully' });
  } catch (error) {
    logger.error('Error syncing customer:', error);
    res.status(500).json({ error: 'An error occurred while syncing the customer' });
  }
});

// Webhook endpoint for Mautic updates
app.post('/webhook/mautic', async (req, res) => {
  try {
    const { leads } = req.body;
    for (const lead of leads) {
      // Sync updated lead to ERPNext and Odoo
      // ... (implement the sync logic here)
    }
    logger.info('Processed Mautic webhook');
    res.sendStatus(200);
  } catch (error) {
    logger.error('Error processing Mautic webhook:', error);
    res.status(500).json({ error: 'An error occurred while processing the webhook' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server started on port ${PORT}`);
});