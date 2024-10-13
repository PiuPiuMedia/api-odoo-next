const { odooApi } = require('./services');

exports.authenticateOdoo = async () => {
  const response = await odooApi.post('/web/session/authenticate', {
    jsonrpc: '2.0',
    params: {
      db: process.env.ODOO_DB,
      login: process.env.ODOO_USERNAME,
      password: process.env.ODOO_PASSWORD
    }
  });
  return response.data.result.session_id;
};