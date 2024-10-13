const { mauticApi, erpnextApi, odooApi, logger } = require('./services');
const { authenticateOdoo } = require('./utils');

exports.syncContact = async (req, res) => {
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
};

exports.syncCustomer = async (req, res) => {
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
};

exports.webhookMautic = async (req, res) => {
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
};