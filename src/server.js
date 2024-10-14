const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cors = require('cors');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(helmet());
app.use(compression()); // Enable response compression
app.use(express.json());
app.use(express.static('public'));

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Update with your allowed origin
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(), // Use JSON format for structured logging
  defaultMeta: { service: 'mautic-erpnext-odoo-integration' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Emit updates to the client
  socket.on('requestUpdate', () => {
    // Fetch updated data and emit it
    const updatedData = {
      contacts: [], // Fetch updated contacts
      stats: {}, // Fetch updated stats
    };
    socket.emit('update', updatedData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Swagger documentation setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Mautic-ERPNext-Odoo Integration API',
      version: '1.0.0',
      description: 'API documentation for the integration project',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
  },
  apis: ['./src/routes.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use routes
app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server started on port ${PORT}`);
});
