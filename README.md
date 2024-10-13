# Mautic-ERPNext-Odoo Integration

This project provides an API for integrating Mautic, ERPNext, and Odoo. It allows syncing contacts and customers between these platforms.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open `http://localhost:3000` in your browser to access the configuration interface

## Development

- Run in development mode: `npm run dev`
- Run tests: `npm test`

## API Endpoints

- POST `/api/sync-contact`: Sync a contact from Mautic to ERPNext and Odoo
- POST `/api/sync-customer`: Sync a customer from ERPNext to Mautic and Odoo
- POST `/api/webhook/mautic`: Webhook endpoint for Mautic updates
- POST `/api/update-config`: Update the application configuration

## Configuration Interface

The project now includes a web-based configuration interface. To use it:

1. Start the server
2. Open `http://localhost:3000` in your browser
3. Fill in the configuration details for Mautic, ERPNext, and Odoo
4. Click "Update Configuration" to save the settings

The configuration will be saved to the `.env` file in the project root.

## GitHub Codespaces

This project is optimized for use with GitHub Codespaces. To get started:

1. Open the repository in GitHub Codespaces
2. The development environment will be automatically set up
3. Run `npm start` to start the server
4. Open the provided URL to access the configuration interface

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.