import axios from 'axios';
import { io } from 'socket.io-client';

async function runTwoPortalTest() {
  console.log('=== Step 1: Register/Login as Municipal Admin ===');
  let token;
  try {
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Municipal Admin Official',
      email: 'admin@civicai.gov.in',
      password: 'adminpassword123',
      role: 'Official',
      department: 'Road Maintenance'
    });
    token = regRes.data.token;
  } catch (err) {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@civicai.gov.in',
      password: 'adminpassword123'
    });
    token = loginRes.data.token;
  }
  console.log('Admin Auth Token acquired.');


  console.log('=== Step 2: Citizen Portal connects via Socket.IO ===');
  const citizenSocket = io('http://localhost:5000');

  let targetIncidentId = null;
  const statusesToTest = ['UNDER_PROGRESS', 'WORK_IN_ACTION', 'WORK_COMPLETED', 'RESOLVED', 'CLOSED'];
  let statusIndex = 0;

  citizenSocket.on('connect', async () => {
    console.log('Citizen Socket connected:', citizenSocket.id);

    console.log('=== Step 3: Citizen creates new Incident ===');
    const newIncRes = await axios.post('http://localhost:5000/api/incidents', {
      title: 'Water Pipe Burst Realtime Test',
      category: 'Water Main & Pipe Leak',
      severity: 'Critical',
      description: 'Severe water leak in front of main market',
      address: 'Main Street, Ward 4',
      lat: 20.3587,
      lng: 85.8333,
      submittedBy: 'Test Citizen'
    });
    targetIncidentId = newIncRes.data.incident.id;
    console.log('Incident created with ID:', targetIncidentId);
  });

  citizenSocket.on('incident:created', (inc) => {
    if (inc.id === targetIncidentId) {
      console.log('Citizen Socket received [incident:created] event for:', inc.id);
    }
  });

  citizenSocket.on('incident:updated', async (updatedInc) => {
    if (updatedInc.id === targetIncidentId) {
      console.log(`REALTIME UPDATE RECEIVED ON CITIZEN PORTAL: Status is now -> ${updatedInc.status}`);
      if (statusIndex < statusesToTest.length) {
        const nextStatus = statusesToTest[statusIndex++];
        console.log(`=== Command Center changing status to ${nextStatus} ===`);
        await axios.patch(`http://localhost:5000/api/incidents/${targetIncidentId}/status`, 
          { status: nextStatus, changedBy: 'Command Center Official' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        console.log('=== ALL REAL-TIME WORKFLOW TRANSITIONS VERIFIED SUCCESSFULLY! ===');
        citizenSocket.disconnect();
        process.exit(0);
      }
    }
  });

  setTimeout(() => {
    if (statusIndex < statusesToTest.length && targetIncidentId) {
      const nextStatus = statusesToTest[statusIndex++];
      console.log(`=== Command Center initial status change to ${nextStatus} ===`);
      axios.patch(`http://localhost:5000/api/incidents/${targetIncidentId}/status`, 
        { status: nextStatus, changedBy: 'Command Center Official' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  }, 2000);
}

runTwoPortalTest().catch(err => {
  console.error('Test failed:', err.response?.data || err.message);
  process.exit(1);
});
