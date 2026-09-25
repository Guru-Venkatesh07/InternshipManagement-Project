import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Cleaning existing database...');
  await prisma.storedFile.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.evaluationGrade.deleteMany({});
  await prisma.progressLog.deleteMany({});
  await prisma.internshipRecord.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.internshipPosting.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.employerProfile.deleteMany({});
  await prisma.facultyProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('[SEED] Hashing passwords...');
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const employerPasswordHash = await bcrypt.hash('Employer@123', 10);
  const facultyPasswordHash = await bcrypt.hash('Faculty@123', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);

  // 1. Create Admin
  console.log('[SEED] Creating Admin User...');
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Arthur Vance (System Admin)',
      email: 'admin@internship.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // 2. Create Faculty
  console.log('[SEED] Creating Faculty Advisor...');
  const facultyUser = await prisma.user.create({
    data: {
      name: 'Prof. Eleanor Hughes',
      email: 'faculty@college.com',
      passwordHash: facultyPasswordHash,
      role: 'FACULTY',
      isActive: true,
      facultyProfile: {
        create: {
          facultyId: 'FAC-CSE-042',
          department: 'Computer Science and Engineering',
          designation: 'Associate Professor & Internship Coordinator',
          phone: '+1 555-019-2831',
        },
      },
    },
    include: { facultyProfile: true },
  });

  // 3. Create Employers
  console.log('[SEED] Creating Employers...');
  const employerUser1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'employer@techcorp.com',
      passwordHash: employerPasswordHash,
      role: 'EMPLOYER',
      isActive: true,
      employerProfile: {
        create: {
          companyName: 'TechCorp Solutions Inc.',
          industry: 'Software & Cloud Engineering',
          description: 'A global leader in enterprise cloud infrastructure and developer tooling solutions.',
          website: 'https://techcorp.example.com',
          address: '100 Innovation Way, Silicon Park, CA',
          contactPerson: 'Sarah Jenkins (Talent Acquisition Lead)',
          phone: '+1 555-432-8765',
          verificationStatus: 'VERIFIED',
        },
      },
    },
    include: { employerProfile: true },
  });

  const employerUser2 = await prisma.user.create({
    data: {
      name: 'Marcus Brody',
      email: 'hr@innovatesoft.io',
      passwordHash: employerPasswordHash,
      role: 'EMPLOYER',
      isActive: true,
      employerProfile: {
        create: {
          companyName: 'InnovateSoft Labs',
          industry: 'Artificial Intelligence & Data Analytics',
          description: 'Pioneering generative AI and intelligent document management tools for enterprises.',
          website: 'https://innovatesoft.example.com',
          address: '450 AI Boulevard, Austin, TX',
          contactPerson: 'Marcus Brody (Head of Engineering)',
          phone: '+1 555-987-1234',
          verificationStatus: 'VERIFIED',
        },
      },
    },
    include: { employerProfile: true },
  });

  // 4. Create Students
  console.log('[SEED] Creating Students...');
  const studentUser1 = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'student@college.com',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isActive: true,
      studentProfile: {
        create: {
          rollNumber: 'CS2023-0104',
          department: 'Computer Science and Engineering',
          year: 3,
          cgpa: 8.92,
          skills: 'React, Node.js, Express, PostgreSQL, Tailwind CSS, Python, Git',
          phone: '+1 555-839-2041',
          resumeFile: 'resume-demo-alex.pdf',
          facultyAdvisorId: facultyUser.facultyProfile.id,
        },
      },
    },
    include: { studentProfile: true },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@college.com',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isActive: true,
      studentProfile: {
        create: {
          rollNumber: 'CS2023-0218',
          department: 'Information Technology',
          year: 3,
          cgpa: 9.15,
          skills: 'TypeScript, Next.js, Docker, Java, AWS, REST APIs',
          phone: '+1 555-728-1190',
          resumeFile: 'resume-demo-priya.pdf',
          facultyAdvisorId: facultyUser.facultyProfile.id,
        },
      },
    },
    include: { studentProfile: true },
  });

  // 5. Create Internship Postings
  console.log('[SEED] Creating Internship Postings...');
  const posting1 = await prisma.internshipPosting.create({
    data: {
      employerId: employerUser1.employerProfile.id,
      title: 'Full Stack Web Developer Intern',
      description: 'Join our Cloud Systems team to develop modern web dashboards using React, Node.js, and PostgreSQL. You will collaborate with senior architects to deliver high-performance microservices and intuitive user interfaces.',
      departmentRequired: 'Computer Science and Engineering',
      skillsRequired: 'React, Node.js, REST APIs, SQL, Git',
      eligibility: 'Minimum 7.5 CGPA, 3rd or 4th year student',
      location: 'San Francisco, CA / Hybrid',
      isRemote: true,
      stipend: 2500,
      openings: 3,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-31'),
      applicationDeadline: new Date('2026-11-30'),
      status: 'PUBLISHED',
    },
  });

  const posting2 = await prisma.internshipPosting.create({
    data: {
      employerId: employerUser1.employerProfile.id,
      title: 'Backend API Engineer Intern',
      description: 'Focus on designing robust RESTful services, database optimization with PostgreSQL, and automated test pipelines.',
      departmentRequired: 'Computer Science and Engineering',
      skillsRequired: 'Node.js, Express, PostgreSQL, Prisma, Unit Testing',
      eligibility: 'Minimum 8.0 CGPA, familiar with database schema design',
      location: 'San Jose, CA',
      isRemote: false,
      stipend: 2800,
      openings: 2,
      startDate: new Date('2026-10-15'),
      endDate: new Date('2027-01-15'),
      applicationDeadline: new Date('2026-12-15'),
      status: 'PUBLISHED',
    },
  });

  const posting3 = await prisma.internshipPosting.create({
    data: {
      employerId: employerUser2.employerProfile.id,
      title: 'AI & Data Science Research Intern',
      description: 'Assist in pre-processing data pipelines, training classification models, and integrating embeddings into search systems.',
      departmentRequired: 'Computer Science and Engineering',
      skillsRequired: 'Python, PyTorch, Pandas, FastAPI, Vector Databases',
      eligibility: 'Strong mathematical foundation, coursework in Machine Learning',
      location: 'Austin, TX',
      isRemote: true,
      stipend: 3000,
      openings: 1,
      startDate: new Date('2026-10-10'),
      endDate: new Date('2026-12-20'),
      applicationDeadline: new Date('2026-11-15'),
      status: 'PUBLISHED',
    },
  });

  const draftPosting = await prisma.internshipPosting.create({
    data: {
      employerId: employerUser2.employerProfile.id,
      title: 'DevOps & Site Reliability Intern (Draft)',
      description: 'Hands-on learning with Kubernetes cluster maintenance and CI/CD pipelines.',
      departmentRequired: 'Information Technology',
      skillsRequired: 'Linux, Docker, CI/CD, Bash',
      eligibility: 'Final year students',
      location: 'Remote',
      isRemote: true,
      stipend: 2200,
      openings: 1,
      applicationDeadline: new Date('2026-12-01'),
      status: 'DRAFT',
    },
  });

  // 6. Create Applications Across Lifecycles
  console.log('[SEED] Creating Applications & Workflows...');

  // Application 1: ACCEPTED -> ONGOING InternshipRecord with Logs and Evaluation!
  const appAccepted = await prisma.application.create({
    data: {
      studentId: studentUser1.studentProfile.id,
      internshipId: posting1.id,
      resumeSnapshot: 'resume-demo-alex.pdf',
      coverLetter: 'I have extensive experience building full-stack web applications with React and Node.js. My academic projects align directly with TechCorp’s cloud architecture.',
      status: 'ACCEPTED',
      facultyRemarks: 'Student has fulfilled credit criteria and maintains excellent academic standing. Approved for academic internship credits.',
      employerRemarks: 'Candidate demonstrated exemplary full-stack problem-solving skills during the technical round.',
    },
  });

  // Interview for Application 1
  await prisma.interview.create({
    data: {
      applicationId: appAccepted.id,
      roundName: 'Technical Architecture & Code Review',
      scheduledDate: '2026-09-18',
      scheduledTime: '14:30',
      mode: 'ONLINE',
      meetingLink: 'https://meet.techcorp.com/interview-alex-01',
      result: 'PASSED',
      remarks: 'Strong understanding of RESTful API design and PostgreSQL indexing.',
    },
  });

  // Active Placement Record for Application 1
  const internshipRecord = await prisma.internshipRecord.create({
    data: {
      applicationId: appAccepted.id,
      studentId: studentUser1.studentProfile.id,
      startDate: new Date('2026-09-20'),
      endDate: new Date('2026-12-20'),
      industrySupervisorName: 'Sarah Jenkins',
      industrySupervisorEmail: 'sarah.jenkins@techcorp.com',
      industrySupervisorPhone: '+1 555-432-8765',
      status: 'ONGOING',
    },
  });

  // Weekly Progress Logs
  await prisma.progressLog.create({
    data: {
      internshipRecordId: internshipRecord.id,
      studentId: studentUser1.studentProfile.id,
      weekNumber: 1,
      tasksCompleted: 'Onboarded into development environment, configured local PostgreSQL databases, set up Docker containers, and reviewed team coding standards.',
      skillsGained: 'Docker compose workflows, Git flow branching strategies, and enterprise linting conventions.',
      challenges: 'Configuring multi-stage Docker builds across local microservices.',
      studentRemarks: 'Productive first week with great guidance from the senior mentor.',
      facultyFeedback: 'Good start. Ensure you keep track of all documentation and architectural diagrams you interact with.',
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.progressLog.create({
    data: {
      internshipRecordId: internshipRecord.id,
      studentId: studentUser1.studentProfile.id,
      weekNumber: 2,
      tasksCompleted: 'Implemented RESTful endpoints for user profile management and integrated JWT token validation middleware.',
      skillsGained: 'Express middleware composition, error handling patterns, and Prisma relations.',
      challenges: 'Handling edge case duplicate email conflicts gracefully without leaking database error stacks.',
      studentRemarks: 'Successfully passed all unit and integration test suites.',
      facultyFeedback: 'Excellent progress on the API security aspects. Proceed with the data layer optimization.',
      submittedAt: new Date(),
    },
  });

  // Mid-term Evaluation Grade
  await prisma.evaluationGrade.create({
    data: {
      internshipRecordId: internshipRecord.id,
      facultyId: facultyUser.facultyProfile.id,
      attendance: 98.0,
      technicalScore: 94.0,
      performanceScore: 92.0,
      communicationScore: 90.0,
      overallScore: 93.5,
      grade: 'A+',
      feedback: 'Outstanding technical diligence and prompt weekly reporting. Candidate demonstrates exceptional mastery of full-stack engineering principles.',
      evaluationType: 'MID_TERM',
    },
  });

  // Application 2: Priya Sharma applied to posting3 -> FACULTY_PENDING
  await prisma.application.create({
    data: {
      studentId: studentUser2.studentProfile.id,
      internshipId: posting3.id,
      resumeSnapshot: 'resume-demo-priya.pdf',
      coverLetter: 'I am deeply passionate about applied artificial intelligence and machine learning pipelines. My coursework in neural networks makes me a strong fit.',
      status: 'FACULTY_PENDING',
    },
  });

  // Application 3: Priya Sharma applied to posting1 -> SHORTLISTED with interview scheduled!
  const appShortlisted = await prisma.application.create({
    data: {
      studentId: studentUser2.studentProfile.id,
      internshipId: posting1.id,
      resumeSnapshot: 'resume-demo-priya.pdf',
      coverLetter: 'Seeking to apply full-stack JavaScript and TypeScript expertise to high-scale enterprise cloud solutions.',
      status: 'INTERVIEW_SCHEDULED',
      facultyRemarks: 'Eligible student with verified prerequisite coursework.',
      employerRemarks: 'Impressive GitHub portfolio and relevant technical stack.',
    },
  });

  await prisma.interview.create({
    data: {
      applicationId: appShortlisted.id,
      roundName: 'Round 1: System Design & Algorithms',
      scheduledDate: '2026-10-05',
      scheduledTime: '11:00',
      mode: 'ONLINE',
      meetingLink: 'https://meet.techcorp.com/interview-priya-01',
      result: 'SCHEDULED',
      remarks: 'Candidate will present recent architectural design work.',
    },
  });

  // 7. Seed Notifications
  console.log('[SEED] Creating Notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: studentUser1.id,
        message: 'Congratulations! Your internship offer at TechCorp Solutions Inc. has been accepted.',
        notificationType: 'OFFER',
        referenceId: appAccepted.id,
        isRead: true,
      },
      {
        userId: studentUser1.id,
        message: 'Prof. Eleanor Hughes reviewed and provided feedback on your Week 2 progress report.',
        notificationType: 'FEEDBACK',
        referenceId: internshipRecord.id,
        isRead: false,
      },
      {
        userId: facultyUser.id,
        message: 'New internship application from Priya Sharma requires your academic credit review.',
        notificationType: 'APPLICATION',
        referenceId: posting3.id,
        isRead: false,
      },
      {
        userId: employerUser1.id,
        message: 'Alex Rivera has accepted your internship offer for Full Stack Web Developer Intern.',
        notificationType: 'OFFER',
        referenceId: appAccepted.id,
        isRead: true,
      },
      {
        userId: studentUser2.id,
        message: 'Your interview for Full Stack Web Developer Intern has been scheduled for 2026-10-05 at 11:00.',
        notificationType: 'INTERVIEW',
        referenceId: appShortlisted.id,
        isRead: false,
      },
    ],
  });

  // 8. Seed Audit Logs
  console.log('[SEED] Creating Audit Logs...');
  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: admin.id,
        action: 'SYSTEM_BOOTSTRAP',
        resourceType: 'System',
        resourceId: 'SYSTEM',
        ipAddress: '127.0.0.1',
        metadata: JSON.stringify({ message: 'System initialized with baseline roles and permissions.' }),
      },
      {
        actorUserId: employerUser1.id,
        action: 'INTERNSHIP_CREATE',
        resourceType: 'InternshipPosting',
        resourceId: posting1.id,
        ipAddress: '192.168.1.15',
        metadata: JSON.stringify({ title: posting1.title, stipend: posting1.stipend }),
      },
      {
        actorUserId: facultyUser.id,
        action: 'FACULTY_APPROVE_APPLICATION',
        resourceType: 'Application',
        resourceId: appAccepted.id,
        ipAddress: '192.168.1.88',
        metadata: JSON.stringify({ decision: 'APPROVED', creditsAwarded: 4 }),
      },
      {
        actorUserId: employerUser1.id,
        action: 'CANDIDATE_SELECTED',
        resourceType: 'Application',
        resourceId: appAccepted.id,
        ipAddress: '192.168.1.15',
        metadata: JSON.stringify({ candidateName: 'Alex Rivera' }),
      },
    ],
  });

  console.log('[SEED] Database successfully populated with realistic demo data!');
  console.log('====================================================');
  console.log('DEMO ACCOUNTS READY:');
  console.log('ADMIN:    admin@internship.com     / Admin@123');
  console.log('EMPLOYER: employer@techcorp.com    / Employer@123');
  console.log('FACULTY:  faculty@college.com     / Faculty@123');
  console.log('STUDENT:  student@college.com     / Student@123');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('[SEED_ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
