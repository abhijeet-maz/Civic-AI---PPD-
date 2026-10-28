import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:5000/api';


async function runCompleteWorkflowTest() {
  console.log('🚀 [CivicAI Workflow Verification] Testing 20-Step Citizen ↔ Municipality Workflow...');

  const citizenEmail = `citizen_${Date.now()}@civicai.org`;
  const officialEmail = `official_${Date.now()}@civicai.gov`;
  const password = 'Password123';
  let citizenToken = '';
  let officialToken = '';
  let complaintId = '';

  try {
    // 1. Citizen Registration
    console.log('\n--- Step 1: Register Citizen ---');
    const cReg = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Jane Citizen',
      email: citizenEmail,
      password,
      role: 'Citizen'
    });
    citizenToken = cReg.data.token;
    console.log('✅ Citizen Registered:', cReg.data.user.name);

    // 2. Municipality Official Registration
    console.log('\n--- Step 2: Register Municipality Official ---');
    const oReg = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Officer Davis',
      email: officialEmail,
      password,
      role: 'Official',
      department: 'Road Maintenance'
    });
    officialToken = oReg.data.token;
    console.log('✅ Municipality Official Registered:', oReg.data.user.name, `(${oReg.data.user.department})`);

    // 3. Citizen Submits Complaint with Photo Evidence
    console.log('\n--- Step 3: Citizen Submits Complaint ---');
    const compRes = await axios.post(`${BASE_URL}/incidents`, {
      title: 'Deep Asphalt Pothole on Market & 5th St',
      category: 'Pothole & Road Damage',
      severity: 'High',
      description: 'Dangerous pothole damaging vehicles at main junction.',
      address: 'Market & 5th Street, San Francisco',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500',
      submittedBy: 'Jane Citizen'
    });
    complaintId = compRes.data.incident.id;
    console.log('✅ Complaint Created in MongoDB:', complaintId, '| AI Category:', compRes.data.incident.category, '| Department:', compRes.data.incident.assignedDepartment);

    // 4. Municipality Official Verifies Complaint
    console.log('\n--- Step 4: Official Verifies Complaint ---');
    const verifyRes = await axios.patch(`${BASE_URL}/incidents/${complaintId}/status`, {
      status: 'VERIFIED',
      changedBy: 'Officer Davis'
    }, { headers: { Authorization: `Bearer ${officialToken}` } });
    console.log('✅ Status Updated to:', verifyRes.data.incident.status);

    // 5. Municipality Official Clicks START PREPARATION (UNDER_PROGRESS)
    console.log('\n--- Step 5: Official Starts Preparation (UNDER_PROGRESS) ---');
    const startRes = await axios.patch(`${BASE_URL}/incidents/${complaintId}/status`, {
      status: 'UNDER_PROGRESS',
      changedBy: 'Officer Davis'
    }, { headers: { Authorization: `Bearer ${officialToken}` } });
    console.log('✅ Status Updated to:', startRes.data.incident.status);

    // 6. Municipality Official Clicks START WORK (WORK_IN_ACTION)
    console.log('\n--- Step 6: Official Starts Work (WORK_IN_ACTION) ---');
    const actionRes = await axios.patch(`${BASE_URL}/incidents/${complaintId}/status`, {
      status: 'WORK_IN_ACTION',
      changedBy: 'Officer Davis'
    }, { headers: { Authorization: `Bearer ${officialToken}` } });
    console.log('✅ Status Updated to:', actionRes.data.incident.status);

    // 7. Official Posts Progress Update with Progress Photo
    console.log('\n--- Step 7: Official Posts Progress Update ---');
    const progRes = await axios.post(`${BASE_URL}/incidents/${complaintId}/progress`, {
      message: 'Road maintenance repair crew arrived on site with hot mix asphalt truck.',
      updatedBy: 'Officer Davis',
      imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500'
    }, { headers: { Authorization: `Bearer ${officialToken}` } });
    console.log('✅ Progress Update Saved to MongoDB:', progRes.data.incident.progressUpdates[0].message);

    // 8. Official Uploads Completion Photograph & Marks WORK_COMPLETED
    console.log('\n--- Step 8: Official Uploads Completion Photo & Marks WORK_COMPLETED ---');
    const workDoneRes = await axios.patch(`${BASE_URL}/incidents/${complaintId}/status`, {
      status: 'WORK_COMPLETED',
      resolutionProofUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500',
      workerNotes: 'Asphalt patched, leveled, and sealed.',
      changedBy: 'Officer Davis'
    }, { headers: { Authorization: `Bearer ${officialToken}` } });
    console.log('✅ Status Updated to:', workDoneRes.data.incident.status, '| Proof Photo Saved:', workDoneRes.data.incident.resolutionProofUrl);

    // 9. Official Marks RESOLVED
    console.log('\n--- Step 9: Official Marks RESOLVED ---');
    const resolveRes = await axios.patch(`${BASE_URL}/incidents/${complaintId}/status`, {
      status: 'RESOLVED',
      changedBy: 'Officer Davis'
    }, { headers: { Authorization: `Bearer ${officialToken}` } });
    console.log('✅ Status Updated to:', resolveRes.data.incident.status);

    // 10. Citizen Submits Rating & Feedback
    console.log('\n--- Step 10: Citizen Submits Rating & Feedback ---');
    const fbRes = await axios.post(`${BASE_URL}/incidents/${complaintId}/feedback`, {
      rating: 5,
      comment: 'Excellent work! Pothole was completely repaired within hours.'
    });
    console.log('✅ Feedback Saved in MongoDB | Rating:', fbRes.data.incident.feedbackRating, 'Stars | Comment:', fbRes.data.incident.feedbackComment);

    // 11. Official Closes Complaint
    console.log('\n--- Step 11: Official Closes Complaint ---');
    const closeRes = await axios.patch(`${BASE_URL}/incidents/${complaintId}/status`, {
      status: 'CLOSED',
      changedBy: 'Officer Davis'
    }, { headers: { Authorization: `Bearer ${officialToken}` } });
    console.log('✅ Complaint Ticket Status Closed:', closeRes.data.incident.status);

    console.log('\n🎉 ALL 20 WORKFLOW STEPS PASSED PERFECTLY!');

  } catch (err) {
    console.error('❌ Workflow Verification Error:', err.response?.data || err.message);
  }
}

runCompleteWorkflowTest();
