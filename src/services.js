const axios = require('axios');
const winston = require('winston');

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'mautic-erpnext-odoo-integration' },
  transports: [
    new winston.transports.Console(),
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

module.exports = {
  mauticApi,
  erpnextApi,
  odooApi,
  logger
};