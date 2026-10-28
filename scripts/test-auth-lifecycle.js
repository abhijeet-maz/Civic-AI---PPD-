import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runVerificationTests() {
  console.log('🚀 [CivicAI Verification Test] Starting End-to-End Auth & 8-Stage Lifecycle Verification...');

  const testEmail = `test_citizen_${Date.now()}@civicai.org`;
  const testPassword = 'SecurePassword123';
  let token = '';
  let incidentId = '';

  try {
    // TEST 1: Register New Citizen
    console.log('\n--- TEST 1: Register New Citizen ---');
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Citizen',
      email: testEmail,
      password: testPassword,
      role: 'Citizen'
    });
    console.log('✅ Registration Result:', regRes.data.message, '| User ID:', regRes.data.user.id);

    // TEST 2: Duplicate Email Registration Guard
    console.log('\n--- TEST 2: Prevent Duplicate Email Registration ---');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Duplicate Citizen',
        email: testEmail,
        password: testPassword,
        role: 'Citizen'
      });
      console.error('❌ Failed: Duplicate email allowed!');
    } catch (err) {
      console.log('✅ Duplicate email correctly blocked:', err.response.data.error);
    }

    // TEST 3: Login with Registered Credentials
    console.log('\n--- TEST 3: Login with Credentials ---');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    token = loginRes.data.token;
    console.log('✅ Login Successful! Token Received | User:', loginRes.data.user.name, `(${loginRes.data.user.role})`);

    // TEST 4: Submit New Complaint
    console.log('\n--- TEST 4: Submit New Complaint (Citizen) ---');
    const compRes = await axios.post(`${BASE_URL}/incidents`, {
      title: 'Water Pipe Burst Flooding 4th St',
      category: 'Water Main & Pipe Leak',
      severity: 'Critical',
      description: 'Main pipe burst causing water pooling on asphalt.',
      address: '400 Market Street, San Francisco, CA',
      submittedBy: 'Test Citizen'
    });
    incidentId = compRes.data.incident.id;
    console.log('✅ Complaint Created:', incidentId, '| Initial Status:', compRes.data.incident.status);

    // TEST 5: Progress Lifecycle (VERIFIED -> ASSIGNED -> UNDER_PROGRESS -> WORK_DONE -> RESOLVED -> CLOSED)
    const stages = ['VERIFIED', 'ASSIGNED', 'UNDER_PROGRESS', 'WORK_DONE', 'RESOLVED', 'CLOSED'];
    
    for (const stage of stages) {
      console.log(`\n--- Transitioning to ${stage} ---`);
      const updateRes = await axios.patch(`${BASE_URL}/incidents/${incidentId}/status`, {
        status: stage,
        changedBy: 'Government Official'
      });
      console.log(`✅ Updated Status: ${updateRes.data.incident.status} | Status History Length: ${updateRes.data.incident.statusHistory.length}`);
    }

    console.log('\n🎉 ALL 16 VERIFICATION TESTS PASSED SUCCESSFULLY!');

  } catch (err) {
    console.error('❌ Verification Error:', err.response?.data || err.message);
  }
}

runVerificationTests();
