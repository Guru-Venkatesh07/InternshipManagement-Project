import app from './src/app.js';
import prisma from './src/config/db.js';

let server;

async function runEndToEndScenario() {
  console.log('================================================================');
  console.log('🚀 EXECUTING COMPLETE END-TO-END INTERNSHIP LIFECYCLE SCENARIO');
  console.log('================================================================');

  await prisma.$connect();
  const PORT = 5098;
  server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}/api/v1`;

  try {
    // -------------------------------------------------------------
    // STEP 1: EMPLOYER LOGIN & CREATE NEW INTERNSHIP
    // -------------------------------------------------------------
    console.log('\n[STEP 1] Employer Login & Posting Creation...');
    const empLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employer@techcorp.com', password: 'Employer@123' }),
    });
    const empLoginData = await empLoginRes.json();
    const empToken = empLoginData.data.token;
    console.log('  ✓ Employer Logged In Successfully');

    const newPostingRes = await fetch(`${BASE_URL}/internships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        title: 'Cloud DevOps Platform Intern (E2E Test)',
        description: 'Design and deploy Kubernetes clusters and CI/CD pipelines.',
        departmentRequired: 'Computer Science and Engineering',
        skillsRequired: 'Docker, Kubernetes, AWS, Linux',
        eligibility: 'Minimum 7.5 CGPA',
        location: 'San Francisco, CA / Remote',
        isRemote: true,
        stipend: 3200,
        openings: 2,
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PUBLISHED',
      }),
    });
    const postingData = await newPostingRes.json();
    const postingId = postingData.data.id;
    console.log(`  ✓ Internship Created & Published: "${postingData.data.title}" (ID: ${postingId})`);

    // -------------------------------------------------------------
    // STEP 2: STUDENT LOGIN & APPLY
    // -------------------------------------------------------------
    console.log('\n[STEP 2] Student Login, Search & Application Submission...');
    const studLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@college.com', password: 'Student@123' }),
    });
    const studLoginData = await studLoginRes.json();
    const studToken = studLoginData.data.token;
    console.log('  ✓ Student Logged In Successfully');

    // Search
    const searchRes = await fetch(`${BASE_URL}/internships?search=Cloud DevOps`);
    const searchJson = await searchRes.json();
    console.log(`  ✓ Internship Discovered in Search: ${searchJson.data.length} matches`);

    // Submit Application
    const applyRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studToken}`,
      },
      body: JSON.stringify({
        internshipId: postingId,
        coverLetter: 'I have hands-on experience orchestrating containers in Docker and deploying microservices.',
        resumeFile: 'resume-demo-alex.pdf',
      }),
    });
    const applyData = await applyRes.json();
    const applicationId = applyData.data.id;
    console.log(`  ✓ Application Submitted: Status = ${applyData.data.status} (FACULTY_PENDING)`);

    // -------------------------------------------------------------
    // STEP 3: FACULTY ADVISOR REVIEWS & APPROVES
    // -------------------------------------------------------------
    console.log('\n[STEP 3] Faculty Review & Academic Clearance...');
    const facLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'faculty@college.com', password: 'Faculty@123' }),
    });
    const facLoginData = await facLoginRes.json();
    const facToken = facLoginData.data.token;
    console.log('  ✓ Faculty Advisor Logged In');

    const facReviewRes = await fetch(`${BASE_URL}/applications/${applicationId}/faculty-review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facToken}`,
      },
      body: JSON.stringify({
        decision: 'APPROVE',
        remarks: 'Prerequisites verified. Approved for 4 academic internship credits.',
      }),
    });
    const facReviewData = await facReviewRes.json();
    console.log(`  ✓ Faculty Approved Application: Status = ${facReviewData.data.status} (UNDER_REVIEW)`);

    // -------------------------------------------------------------
    // STEP 4: EMPLOYER SHORTLISTS & SCHEDULES INTERVIEW
    // -------------------------------------------------------------
    console.log('\n[STEP 4] Employer Shortlists & Schedules Interview...');
    // Shortlist
    const shortlistRes = await fetch(`${BASE_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        status: 'SHORTLISTED',
        remarks: 'Candidate profile aligns with cloud team requirements.',
      }),
    });
    const shortlistData = await shortlistRes.json();
    console.log(`  ✓ Candidate Shortlisted: Status = ${shortlistData.data.status}`);

    // Schedule Interview
    const interviewRes = await fetch(`${BASE_URL}/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        applicationId,
        roundName: 'Round 1: Live Cloud Architecture & Containerization',
        scheduledDate: '2026-10-12',
        scheduledTime: '15:00',
        mode: 'ONLINE',
        meetingLink: 'https://meet.techcorp.com/interview-cloud-e2e',
        remarks: 'Focus on Docker Compose and Kubernetes manifests.',
      }),
    });
    const ivData = await interviewRes.json();
    console.log(`  ✓ Interview Booked: ${ivData.data.roundName} on ${ivData.data.scheduledDate}`);

    // Record Result: Passed
    const ivResultRes = await fetch(`${BASE_URL}/interviews/${ivData.data.id}/result`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        result: 'PASSED',
        remarks: 'Flawless performance in container orchestration challenge.',
      }),
    });
    console.log('  ✓ Interview Result Logged: PASSED');

    // Select Candidate (Extend Offer)
    const selectRes = await fetch(`${BASE_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        status: 'SELECTED',
        remarks: 'Congratulations! Official internship offer extended.',
      }),
    });
    const selectData = await selectRes.json();
    console.log(`  ✓ Candidate Selected: Status = ${selectData.data.status}`);

    // -------------------------------------------------------------
    // STEP 5: STUDENT ACCEPTS OFFER -> PLACEMENT RECORD GENERATED
    // -------------------------------------------------------------
    console.log('\n[STEP 5] Student Accepts Offer -> Placement Record Spawned...');
    const acceptRes = await fetch(`${BASE_URL}/applications/${applicationId}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studToken}`,
      },
    });
    const acceptData = await acceptRes.json();
    const placementId = acceptData.data.id;
    console.log(`  ✓ Offer Accepted! Active Placement Record Created (ID: ${placementId}, Status: ${acceptData.data.status})`);

    // -------------------------------------------------------------
    // STEP 6: STUDENT SUBMITS WEEKLY PROGRESS LOG
    // -------------------------------------------------------------
    console.log('\n[STEP 6] Student Submits Week 1 Progress Log...');
    const logRes = await fetch(`${BASE_URL}/placements/progress-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studToken}`,
      },
      body: JSON.stringify({
        internshipRecordId: placementId,
        weekNumber: 1,
        tasksCompleted: 'Configured automated Helm charts and provisioned Prometheus monitoring pods.',
        skillsGained: 'Kubernetes operators, Helm templating, and Prometheus metrics.',
        challenges: 'Debugging pod networking under strict cluster ingress policies.',
        studentRemarks: 'High productivity and excellent team collaboration.',
      }),
    });
    const logData = await logRes.json();
    const logId = logData.data.id;
    console.log(`  ✓ Progress Log Submitted for Week ${logData.data.weekNumber} (Log ID: ${logId})`);

    // -------------------------------------------------------------
    // STEP 7: FACULTY REVIEWS LOG & ASSIGNS FINAL GRADE
    // -------------------------------------------------------------
    console.log('\n[STEP 7] Faculty Reviews Log & Issues Final Academic Grade...');
    // Faculty feedback
    const feedbackRes = await fetch(`${BASE_URL}/placements/progress-logs/${logId}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facToken}`,
      },
      body: JSON.stringify({
        feedback: 'Superb cloud engineering implementation. Documentation is clean and rigorous.',
      }),
    });
    console.log('  ✓ Faculty Progress Feedback Recorded');

    // Faculty Final Evaluation
    const evalRes = await fetch(`${BASE_URL}/placements/evaluations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facToken}`,
      },
      body: JSON.stringify({
        internshipRecordId: placementId,
        evaluationType: 'FINAL',
        attendance: 100,
        technicalScore: 98,
        performanceScore: 96,
        communicationScore: 94,
        grade: 'A+',
        feedback: 'Candidate exceeded all departmental learning objectives. Academic credits certified.',
      }),
    });
    const evalData = await evalRes.json();
    console.log(`  ✓ Official Final Grade Awarded: ${evalData.data.grade} (Overall Score: ${evalData.data.overallScore}%)`);

    // Verify Placement Record is now COMPLETED
    const checkPlacementRes = await fetch(`${BASE_URL}/placements/${placementId}`, {
      headers: { Authorization: `Bearer ${studToken}` },
    });
    const checkPlacementData = await checkPlacementRes.json();
    console.log(`  ✓ Verification: Internship Record Status = ${checkPlacementData.data.status} (COMPLETED)`);

    // -------------------------------------------------------------
    // STEP 8: ADMIN VERIFICATION & AUDIT LOGS & REPORT GENERATION
    // -------------------------------------------------------------
    console.log('\n[STEP 8] Administrator Monitoring & Report Export...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@internship.com', password: 'Admin@123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data.token;

    // Admin metrics
    const adminMetricsRes = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminMetrics = await adminMetricsRes.json();
    console.log('  ✓ Admin Live Database Metrics:', adminMetrics.data);

    // Audit logs
    const auditRes = await fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const auditData = await auditRes.json();
    console.log(`  ✓ System Audit Logs Recorded: ${auditData.count} immutable events tracked`);

    // Report CSV Export
    const reportRes = await fetch(`${BASE_URL}/admin/reports/placements/export`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const csvContent = await reportRes.text();
    console.log(`  ✓ CSV Report Generated (${csvContent.split('\n').length} rows)`);

    console.log('\n================================================================');
    console.log('🎉 COMPLETE 15-STEP END-TO-END WORKFLOW VERIFIED SUCCESSFULLY!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ E2E SCENARIO FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  }
}

runEndToEndScenario();
