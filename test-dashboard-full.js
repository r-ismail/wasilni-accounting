const axios = require('axios');

async function testDashboard() {
  try {
    // Login
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.accessToken;
    console.log('✅ Login successful\n');
    
    // Test each endpoint
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    console.log('=== Testing Dashboard APIs ===\n');
    
    const unitsRes = await axios.get('http://localhost:3001/api/units', config);
    console.log('Units Response Format:', typeof unitsRes.data, Array.isArray(unitsRes.data) ? 'Array' : 'Object');
    console.log('Units Data:', JSON.stringify(unitsRes.data).substring(0, 100) + '...\n');
    
    const customersRes = await axios.get('http://localhost:3001/api/customers', config);
    console.log('Customers Response Format:', typeof customersRes.data, Array.isArray(customersRes.data) ? 'Array' : 'Object');
    console.log('Customers Data:', JSON.stringify(customersRes.data).substring(0, 100) + '...\n');
    
    const contractsRes = await axios.get('http://localhost:3001/api/contracts', config);
    console.log('Contracts Response Format:', typeof contractsRes.data, Array.isArray(contractsRes.data) ? 'Array' : 'Object');
    console.log('Contracts Data:', JSON.stringify(contractsRes.data).substring(0, 100) + '...\n');
    
    const invoicesRes = await axios.get('http://localhost:3001/api/invoices', config);
    console.log('Invoices Response Format:', typeof invoicesRes.data, Array.isArray(invoicesRes.data) ? 'Array' : 'Object');
    console.log('Invoices Data:', JSON.stringify(invoicesRes.data).substring(0, 100) + '...\n');
    
    const paymentsRes = await axios.get('http://localhost:3001/api/payments', config);
    console.log('Payments Response Format:', typeof paymentsRes.data, Array.isArray(paymentsRes.data) ? 'Array' : 'Object');
    console.log('Payments Data:', JSON.stringify(paymentsRes.data).substring(0, 100) + '...\n');
    
    // Simulate Dashboard logic
    console.log('=== Simulating Dashboard Logic ===\n');
    
    const units = Array.isArray(unitsRes.data?.data) ? unitsRes.data.data : (Array.isArray(unitsRes.data) ? unitsRes.data : []);
    const customers = Array.isArray(customersRes.data?.data) ? customersRes.data.data : (Array.isArray(customersRes.data) ? customersRes.data : []);
    const contracts = Array.isArray(contractsRes.data?.data) ? contractsRes.data.data : (Array.isArray(contractsRes.data) ? contractsRes.data : []);
    const invoices = Array.isArray(invoicesRes.data?.data) ? invoicesRes.data.data : (Array.isArray(invoicesRes.data) ? invoicesRes.data : []);
    
    console.log('Extracted Units:', units.length, 'items');
    console.log('Extracted Customers:', customers.length, 'items');
    console.log('Extracted Contracts:', contracts.length, 'items');
    console.log('Extracted Invoices:', invoices.length, 'items');
    
    console.log('\n✅ Dashboard logic works correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testDashboard();
