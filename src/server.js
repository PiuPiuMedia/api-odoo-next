const express = require('express');
const dotenv = require('dotenv');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const routes = require('./routes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

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

app.use('/api', routes);

// New endpoint to update .env file
app.post('/api/update-config', (req, res) => {
  const { config } = req.body;
  let envContent = '';

  for (const [key, value] of Object.entries(config)) {
    envContent += `${key}=${value}\n`;
  }

  fs.writeFile('.env', envContent, (err) => {
    if (err) {
      logger.error('Error updating .env file:', err);
      return res.status(500).json({ error: 'Failed to update configuration' });
    }
    logger.info('Configuration updated successfully');
    res.json({ message: 'Configuration updated successfully' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server started on port ${PORT}`);
});