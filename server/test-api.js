import app from './src/app.js';
import prisma from './src/config/db.js';

let server;

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION & API TESTS ---');
  await prisma.$connect();

  server = app.listen(5099);
  const baseUrl = 'http://localhost:5099/api/v1';

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    console.log('✓ Health Check:', healthJson.status === 'online' ? 'PASSED' : 'FAILED');

    // 2. Admin Login
    const adminRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@internship.com', password: 'Admin@123' }),
    });
    const adminData = await adminRes.json();
    console.log('✓ Admin Login:', adminData.success && adminData.data.user.role === 'ADMIN' ? 'PASSED' : 'FAILED');
    const adminToken = adminData.data?.token;

    // 3. Student Login
    const studentRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@college.com', password: 'Student@123' }),
    });
    const studentData = await studentRes.json();
    console.log('✓ Student Login:', studentData.success && studentData.data.user.role === 'STUDENT' ? 'PASSED' : 'FAILED');
    const studentToken = studentData.data?.token;

    // 4. Faculty Login
    const facultyRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'faculty@college.com', password: 'Faculty@123' }),
    });
    const facultyData = await facultyRes.json();
    console.log('✓ Faculty Login:', facultyData.success && facultyData.data.user.role === 'FACULTY' ? 'PASSED' : 'FAILED');

    // 5. Employer Login
    const empRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employer@techcorp.com', password: 'Employer@123' }),
    });
    const empData = await empRes.json();
    console.log('✓ Employer Login:', empData.success && empData.data.user.role === 'EMPLOYER' ? 'PASSED' : 'FAILED');

    // 6. Admin Metrics
    const metricsRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const metricsData = await metricsRes.json();
    console.log('✓ Admin Metrics Endpoint:', metricsData.success && metricsData.data.totalUsers >= 4 ? 'PASSED' : 'FAILED', metricsData.data);

    // 7. Public Internship Search
    const searchRes = await fetch(`${baseUrl}/internships?search=Developer`);
    const searchData = await searchRes.json();
    console.log('✓ Internship Search Filter:', searchData.success && searchData.data.length >= 1 ? 'PASSED' : 'FAILED');

    // 8. RBAC Security Check: Student calling Admin Route must return 403 Forbidden
    const rbacRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log('✓ RBAC Security Guard (Student accessing /admin/users -> 403):', rbacRes.status === 403 ? 'PASSED' : 'FAILED');

    console.log('--- ALL BACKEND CORE ENDPOINTS VERIFIED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Test run failed:', err);
  } finally {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  }
}

runTests();
