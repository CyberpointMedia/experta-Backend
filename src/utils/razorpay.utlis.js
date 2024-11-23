const axios = require('axios');

class RazorpaySDK {
  constructor(keyId, keySecret) {
    this.keyId = keyId;
    this.keySecret = keySecret;
    this.baseURL = 'https://api.razorpay.com/v1';
    this.authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
  }

  async request(method, endpoint, data = null) {
    try {
      console.log(`Making ${method} request to: ${this.baseURL}${endpoint}`);
      console.log('Request payload:', data);
      
      const response = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.authHeader}`
        },
        data
      });
      return response.data;
    } catch (error) {
      console.error('Razorpay API Error:', {
        endpoint,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response) {
        throw new Error(error.response.data.error?.description || 
                       error.response.data.message || 
                       'API request failed');
      }
      throw error;
    }
  }

  // Contacts API
  async createContact(data) {
    const payload = {
      name: data.name,
      email: data.email,
      contact: data.contact,
      type: data.type || "customer",
      reference_id: data.reference_id,
      notes: data.notes || {}
    };

    return this.request('POST', '/contacts', payload);
  }

  async getContact(contactId) {
    return this.request('GET', `/contacts/${contactId}`);
  }

  // Fund Account APIs 
  async createFundAccount(data) {
    const payload = {
      contact_id: data.contact_id,
      account_type: data.account_type,
      ...(data.bank_account && { bank_account: data.bank_account }),
      ...(data.vpa && { vpa: data.vpa })
    };

    // The correct endpoint is /v1/fund_accounts
    return this.request('POST', '/fund_accounts', payload);
  }

  async getFundAccount(accountId) {
    return this.request('GET', `/fund_accounts/${accountId}`);
  }

  // Payout APIs - Note: Using transfers instead of payouts as per Razorpay API
  async createPayout(data) {
    const payload = {
      account_number: "2323230009181713",
      fund_account_id: data.fund_account_id,
      amount: data.amount,
      currency: data.currency || "INR",
      mode: data.mode,
      purpose: data.purpose,
      queue_if_low_balance: data.queue_if_low_balance,
      reference_id: data.reference_id,
      narration: data.narration
    };

    return this.request('POST', '/payouts', payload);
  }

  async getPayout(payoutId) {
    return this.request('GET', `/payouts/${payoutId}`);
  }

  // VPA Validation
  async validateVPA(vpa) {
    return this.request('POST', '/v1/payments/validate/vpa', { vpa });
  }

  // Bank Account Validation
  async validateBankAccount(data) {
    return this.request('POST', '/v1/fund_accounts/validations', {
      account_number: data.account_number,
      ifsc: data.ifsc
    });
  }
}

module.exports = RazorpaySDK;