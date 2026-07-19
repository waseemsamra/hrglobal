/**
 * Seed script for the CareerHub candidates collection.
 * Usage: node scripts/seed.mjs
 */
import { MongoClient, ObjectId } from "mongodb";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load MONGODB_URI from .env.local without extra deps.
function loadEnv() {
  try {
    const envPath = join(__dirname, "..", ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (match) {
        let value = match[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[match[1]]) process.env[match[1]] = value;
      }
    }
  } catch {
    // ignore, rely on existing env
  }
}

loadEnv();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "hr_system";

if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local");
  process.exit(1);
}

const candidate = {
  candidateId: "jordan-thorne",
  name: "Jordan Thorne",
  email: "j.thorne@talent.com",
  role: "Senior Frontend Engineer",
  department: "Engineering Dept",
  location: "International (Munich)",
  experience: "8 Years",
  listStatus: "Interviewing",
  appliedAt: new Date("2023-10-12T09:45:00Z"),
  stage: "Technical Interview",
  status: "Active Hiring",
  recruiter: "Sarah Chen",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBP_yZ5YVLQ1I4e1QsRMXzxUgEDtc5jLt-hUq1lJulGQ9-z7C1ZeFjxOIpDRZLwGPpq15KuHnF4H7q29ZIQ0Gz93peefz2O3IPm0LFCK81Nr65wBTHKdeIrRQKgyo7PJnAiCjurh0uMrC8mTcB1BEUZiOfefx0NhyFZIG4ihJYSOf8KMmXKnRH3w6S9pitEbYh455mq7ZFHLvY5NWXmEYEQA713eb_Wp7BllKmcM6MKwPYN2c91F7b_Qtai2SA5r3fP-s_KuvJai22S",
  score: {
    overall: 82,
    culturalFit: 90,
    technical: 75,
    experience: 85,
  },
  timeline: [
    {
      title: "Application Received",
      date: "Oct 12, 2023 • 09:45 AM",
      state: "done",
      detail:
        "Initial submission through LinkedIn Talent Solutions. All mandatory fields completed.",
    },
    {
      title: "Recruiter Screening",
      date: "Oct 15, 2023 • 02:00 PM",
      state: "done",
      detail:
        "Passed initial screening with Sarah Chen. Recommended for technical round.",
    },
    {
      title: "Technical Interview",
      date: "In Progress",
      state: "current",
      detail: "",
    },
    {
      title: "Final Presentation",
      date: "Pending stage completion",
      state: "future",
      detail: "",
    },
  ],
  documents: [
    {
      name: "Curriculum_Vitae_Thorne.pdf",
      meta: "Uploaded 2 days ago • 1.2 MB",
      type: "pdf",
      verified: false,
    },
    {
      name: "Technical_Assessment_Result.docx",
      meta: "Uploaded 4 hours ago • 450 KB",
      type: "doc",
      verified: false,
    },
    {
      name: "Background_Check_Consent.pdf",
      meta: "Signed via DocuSign • Oct 14",
      type: "verified",
      verified: true,
    },
  ],
  feedback: [
    {
      author: "Mark Stephenson",
      role: "Tech Lead",
      comment:
        "Strong command of React internals and performance optimization. Handled the whiteboarding session with exceptional clarity.",
      rating: 4,
      italic: true,
    },
    {
      author: "Linda Wu",
      role: "Product Manager",
      comment:
        "Excellent communication skills. Jordan demonstrated a solid understanding of user-centric design and cross-team collaboration.",
      rating: 5,
      italic: true,
    },
    {
      author: "Internal Note",
      role: "System Log",
      comment:
        "Recommendation: Move to final cultural alignment phase. Candidate salary expectations align with the Senior I band.",
      tag: "RECRUITMENT ONLY",
      italic: false,
    },
  ],
  createdAt: new Date(),
};

// Additional candidates for the candidate pool list. Each gets a lighter
// detail payload so the detail dashboard still renders when clicked.
function buildCandidate(base) {
  return {
    department: base.department || "General",
    status: "Active Hiring",
    recruiter: base.recruiter || "Sarah Chen",
    avatar: "",
    score: base.score || { overall: 70, culturalFit: 70, technical: 70, experience: 70 },
    timeline: [
      {
        title: "Application Received",
        date: "Applied",
        state: "done",
        detail: "Initial submission received and logged.",
      },
      {
        title: "Recruiter Screening",
        date: base.listStatus === "Applied" ? "Pending" : "Completed",
        state: base.listStatus === "Applied" ? "future" : "done",
        detail: "",
      },
      {
        title: "Interview",
        date: base.listStatus === "Interviewing" ? "In Progress" : "Pending",
        state: base.listStatus === "Interviewing" ? "current" : "future",
        detail: "",
      },
      {
        title: "Offer",
        date: base.listStatus === "Offered" ? "Extended" : "Pending",
        state: base.listStatus === "Offered" ? "current" : "future",
        detail: "",
      },
    ],
    documents: [
      {
        name: `Resume_${base.name.split(" ").join("_")}.pdf`,
        meta: "Uploaded recently",
        type: "pdf",
        verified: false,
      },
    ],
    feedback: [
      {
        author: "Internal Note",
        role: "System Log",
        comment: `Candidate is currently in the ${base.listStatus} stage.`,
        tag: "RECRUITMENT ONLY",
        italic: false,
      },
    ],
    createdAt: new Date(),
    ...base,
  };
}

const moreCandidates = [
  buildCandidate({
    candidateId: "elena-halpert",
    name: "Elena Halpert",
    email: "e.halpert@talent.com",
    role: "Senior UX Designer",
    department: "Design",
    location: "International (Munich)",
    experience: "8 Years",
    listStatus: "Screening",
    appliedAt: new Date("2023-10-10T10:00:00Z"),
  }),
  buildCandidate({
    candidateId: "marcus-kaine",
    name: "Marcus Kaine",
    email: "m.kaine@design.co",
    role: "Full Stack Engineer",
    department: "Engineering",
    location: "Local (New York)",
    experience: "12 Years",
    listStatus: "Offered",
    appliedAt: new Date("2023-10-09T09:00:00Z"),
  }),
  buildCandidate({
    candidateId: "sarah-jenkins",
    name: "Sarah Jenkins",
    email: "sjenkins@techmail.io",
    role: "Product Manager",
    department: "Product",
    location: "Local (San Francisco)",
    experience: "5 Years",
    listStatus: "Interviewing",
    appliedAt: new Date("2023-10-08T14:00:00Z"),
  }),
  buildCandidate({
    candidateId: "tariq-al-fayed",
    name: "Tariq Al-Fayed",
    email: "t.alfayed@global.net",
    role: "Data Scientist",
    department: "Data",
    location: "International (Dubai)",
    experience: "3 Years",
    listStatus: "Applied",
    appliedAt: new Date("2023-10-07T08:00:00Z"),
  }),
  buildCandidate({
    candidateId: "lucia-valdes",
    name: "Lucia Valdes",
    email: "lvaldes@creative.com",
    role: "Marketing Lead",
    department: "Marketing",
    location: "Local (Miami)",
    experience: "7 Years",
    listStatus: "Declined",
    appliedAt: new Date("2023-10-06T11:00:00Z"),
  }),
  buildCandidate({
    candidateId: "brian-choi",
    name: "Brian Choi",
    email: "bchoi@devcloud.io",
    role: "DevOps Engineer",
    department: "Engineering",
    location: "International (Seoul)",
    experience: "4 Years",
    listStatus: "Interviewing",
    appliedAt: new Date("2023-10-05T13:00:00Z"),
  }),
];

const jobs = [
  {
    jobId: "senior-product-designer",
    title: "Senior Product Designer",
    department: "Product Design",
    location: "Remote",
    type: "Full-time",
    badge: "Urgent",
    applicants: 128,
    postedAt: new Date("2023-10-12T09:00:00Z"),
    status: "Active",
  },
  {
    jobId: "lead-backend-engineer",
    title: "Lead Backend Engineer",
    department: "Engineering",
    location: "London, UK",
    type: "Hybrid",
    badge: "Verified",
    applicants: 42,
    postedAt: new Date("2023-10-10T09:00:00Z"),
    status: "Active",
  },
  {
    jobId: "global-hr-manager",
    title: "Global HR Manager",
    department: "Human Resources",
    location: "New York, US",
    type: "Contract",
    badge: "In Progress",
    applicants: 89,
    postedAt: new Date("2023-10-08T09:00:00Z"),
    status: "Active",
  },
  {
    jobId: "frontend-development-intern",
    title: "Frontend Development Intern",
    department: "Engineering",
    location: "Berlin, DE",
    type: "Internship",
    badge: null,
    applicants: 312,
    postedAt: new Date("2023-10-05T09:00:00Z"),
    status: "Active",
  },
  {
    jobId: "growth-marketing-manager",
    title: "Growth Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    badge: null,
    applicants: 215,
    postedAt: new Date("2023-10-01T09:00:00Z"),
    status: "Active",
  },
];

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("candidates");

  await collection.createIndex({ candidateId: 1 }, { unique: true });

  const all = [candidate, ...moreCandidates];
  let upserted = 0;
  for (const c of all) {
    const result = await collection.updateOne(
      { candidateId: c.candidateId },
      { $set: c },
      { upsert: true }
    );
    if (result.upsertedCount) upserted += 1;
  }

  console.log(`Seeded ${all.length} candidates (${upserted} newly created).`);

  // Seed jobs
  const jobsCol = db.collection("jobs");
  await jobsCol.createIndex({ jobId: 1 }, { unique: true });
  let jobsUpserted = 0;
  for (const j of jobs) {
    const result = await jobsCol.updateOne(
      { jobId: j.jobId },
      { $set: { ...j, createdAt: new Date() } },
      { upsert: true }
    );
    if (result.upsertedCount) jobsUpserted += 1;
  }
  console.log(`Seeded ${jobs.length} jobs (${jobsUpserted} newly created).`);

  // Seed default system settings (idempotent)
  const settingsCol = db.collection("settings");
  await settingsCol.updateOne(
    { _id: "global" },
    {
      $setOnInsert: {
        _id: "global",
        data: {
          profile: {
            fullName: "Alex Thompson",
            email: "alex.thompson@recruitglobal.io",
            bio: "HR Director specialized in international talent acquisition and regional compliance strategies.",
          },
          organization: {
            name: "RecruitGlobal Inc.",
            hqLocation: "New York, NY",
            brandColor: "#0058BE",
          },
          notifications: { email: true, push: false, sla: true },
          security: { twoFactor: true },
        },
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log("Seeded default system settings.");

  // Seed countries + cities (idempotent by name)
  const countriesCol = db.collection("countries");
  const countries = [
    { name: "UAE", code: "AE", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"] },
    { name: "Saudi Arabia", code: "SA", cities: ["Riyadh", "Jeddah", "Dammam", "Mecca"] },
    { name: "Qatar", code: "QA", cities: ["Doha", "Al Rayyan"] },
    { name: "Kuwait", code: "KW", cities: ["Kuwait City", "Hawalli"] },
    { name: "Oman", code: "OM", cities: ["Muscat", "Salalah"] },
    { name: "Bahrain", code: "BH", cities: ["Manama", "Riffa"] },
    { name: "Egypt", code: "EG", cities: ["Cairo", "Alexandria", "Giza"] },
    { name: "Jordan", code: "JO", cities: ["Amman", "Zarqa", "Irbid"] },
    { name: "Iraq", code: "IQ", cities: ["Baghdad", "Basra", "Erbil"] },
    { name: "Lebanon", code: "LB", cities: ["Beirut", "Tripoli"] },
    { name: "India", code: "IN", cities: ["Mumbai", "Bengaluru", "Delhi"] },
    { name: "Pakistan", code: "PK", cities: ["Karachi", "Lahore", "Islamabad"] },
    { name: "United Kingdom", code: "GB", cities: ["London", "Manchester"] },
    { name: "Germany", code: "DE", cities: ["Berlin", "Munich"] },
    { name: "United States", code: "US", cities: ["New York", "San Francisco"] },
    { name: "Singapore", code: "SG", cities: ["Singapore"] },
    { name: "France", code: "FR", cities: ["Paris"] },
    { name: "Netherlands", code: "NL", cities: ["Amsterdam"] },
  ];
  let countriesUpserted = 0;
  for (const c of countries) {
    const existing = await countriesCol.findOne({ name: c.name });
    if (existing) continue;
    await countriesCol.insertOne({
      name: c.name,
      code: c.code,
      cities: c.cities.map((name) => ({
        id: new ObjectId().toString(),
        name,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    countriesUpserted += 1;
  }
  console.log(`Seeded ${countries.length} countries (${countriesUpserted} newly created).`);

  // Seed job categories / industries (idempotent by name)
  const categoriesCol = db.collection("categories");
  const categories = [
    { name: "Healthcare", description: "Medical, nursing, and clinical roles." },
    { name: "Academic", description: "Teaching, research, and education." },
    { name: "Catering", description: "Food service and hospitality." },
    { name: "Engineering", description: "All engineering disciplines." },
    { name: "Accounting", description: "Bookkeeping, audit, and accounts." },
    { name: "Finance & Consulting", description: "Finance, advisory, and consulting." },
    { name: "Customer Service", description: "Support and client relations." },
    { name: "Retail Sales", description: "Retail and in-store sales." },
    { name: "Admin", description: "Administration and office support." },
    { name: "Software", description: "Software development and IT." },
    { name: "HSE", description: "Health, Safety & Environment." },
    { name: "Marketing", description: "Growth, content, and brand." },
    { name: "Management", description: "Leadership and operations." },
    { name: "R&D", description: "Research and development." },
    { name: "Human Resources", description: "Talent acquisition and people ops." },
    { name: "Procurement", description: "Sourcing and purchasing." },
    { name: "Design", description: "UX, UI, and product design." },
    { name: "Legal", description: "Legal and compliance." },
    { name: "Architecture", description: "Building and structural design." },
    { name: "Investment", description: "Investment and asset management." },
    { name: "Sales", description: "B2B and field sales." },
    { name: "Security", description: "Physical and cyber security." },
    { name: "Logistics", description: "Supply chain and logistics." },
    { name: "Drivers", description: "Truck, delivery, and transport driving roles." },
    { name: "Journalism", description: "News, media, and reporting." },
    { name: "Translation", description: "Language and translation services." },
  ];
  let categoriesUpserted = 0;
  for (const cat of categories) {
    const existing = await categoriesCol.findOne({ name: cat.name });
    if (existing) continue;
    await categoriesCol.insertOne({
      name: cat.name,
      description: cat.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    categoriesUpserted += 1;
  }
  console.log(`Seeded ${categories.length} categories (${categoriesUpserted} newly created).`);

  // Seed industries (idempotent by name)
  const industriesCol = db.collection("industries");
  const industries = [
    { name: "IT", description: "Information technology and software services." },
    { name: "Hospitality", description: "Hotels, restaurants, and tourism." },
    { name: "Banking and Finance", description: "Banking, insurance, and financial services." },
    { name: "Consulting", description: "Management and professional consulting." },
    { name: "Construction", description: "Building, infrastructure, and real estate development." },
    { name: "Recruitment", description: "Staffing, headhunting, and HR services." },
    { name: "Education", description: "Schools, universities, and training." },
    { name: "IT Hardware", description: "Hardware manufacturing and electronics." },
    { name: "E-commerce", description: "Online retail and digital commerce." },
    { name: "Medical", description: "Healthcare and medical services." },
    { name: "Consumer Durables", description: "Appliances, furniture, and consumer goods." },
    { name: "Oil and Gas", description: "Energy, petroleum, and petrochemicals." },
    { name: "Accounting", description: "Audit, tax, and accounting services." },
    { name: "Engineering", description: "Engineering and technical services." },
    { name: "FMCG", description: "Fast-moving consumer goods." },
    { name: "Real Estate", description: "Property sales, leasing, and management." },
    { name: "Telecom", description: "Telecommunications and networking." },
    { name: "Advertising", description: "Marketing, media, and advertising." },
    { name: "Automobile", description: "Automotive manufacturing and sales." },
    { name: "Logistics", description: "Transport, warehousing, and supply chain." },
    { name: "Power Generation", description: "Electricity generation and utilities." },
    { name: "NGO", description: "Non-governmental and nonprofit organizations." },
    { name: "Retail", description: "Retail trade and store operations." },
    { name: "Pharmaceutical", description: "Pharma manufacturing and research." },
    { name: "Steel Fabrication", description: "Metal works and steel manufacturing." },
  ];
  let industriesUpserted = 0;
  for (const ind of industries) {
    const existing = await industriesCol.findOne({ name: ind.name });
    if (existing) continue;
    await industriesCol.insertOne({
      name: ind.name,
      description: ind.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    industriesUpserted += 1;
  }
  console.log(`Seeded ${industries.length} industries (${industriesUpserted} newly created).`);

  // Seed posting freshness options
  const postingFreshnessCol = db.collection("postingFreshness");
  const postingFreshness = [
    { name: "0-3 days", description: "Very fresh postings." },
    { name: "3-7 days", description: "Recent postings." },
    { name: "7-14 days", description: "Less than 2 weeks old." },
    { name: "14-30 days", description: "Within the last month." },
  ];
  let postingFreshnessUpserted = 0;
  for (const item of postingFreshness) {
    const existing = await postingFreshnessCol.findOne({ name: item.name });
    if (existing) continue;
    await postingFreshnessCol.insertOne({ ...item, createdAt: new Date(), updatedAt: new Date() });
    postingFreshnessUpserted += 1;
  }
  console.log(`Seeded ${postingFreshness.length} posting freshness options (${postingFreshnessUpserted} newly created).`);

  // Seed experience levels
  const experienceCol = db.collection("experience");
  const experienceLevels = [
    { name: "Entry Level", description: "0-2 years experience." },
    { name: "Mid Level", description: "2-5 years experience." },
    { name: "Senior Level", description: "5-10 years experience." },
    { name: "Expert", description: "10+ years experience." },
  ];
  let experienceUpserted = 0;
  for (const item of experienceLevels) {
    const existing = await experienceCol.findOne({ name: item.name });
    if (existing) continue;
    await experienceCol.insertOne({ ...item, createdAt: new Date(), updatedAt: new Date() });
    experienceUpserted += 1;
  }
  console.log(`Seeded ${experienceLevels.length} experience levels (${experienceUpserted} newly created).`);

  // Seed gender options
  const genderCol = db.collection("gender");
  const genders = [
    { name: "Male", description: "" },
    { name: "Female", description: "" },
    { name: "Other", description: "" },
  ];
  let genderUpserted = 0;
  for (const item of genders) {
    const existing = await genderCol.findOne({ name: item.name });
    if (existing) continue;
    await genderCol.insertOne({ ...item, createdAt: new Date(), updatedAt: new Date() });
    genderUpserted += 1;
  }
  console.log(`Seeded ${genders.length} gender options (${genderUpserted} newly created).`);

  // Seed monthly salary ranges
  const monthlySalaryCol = db.collection("monthlySalary");
  const monthlySalaries = [
    { name: "Less than 1000", description: "" },
    { name: "1000-3000", description: "" },
    { name: "3000-5000", description: "" },
    { name: "5000-10000", description: "" },
    { name: "10000+", description: "" },
  ];
  let monthlySalaryUpserted = 0;
  for (const item of monthlySalaries) {
    const existing = await monthlySalaryCol.findOne({ name: item.name });
    if (existing) continue;
    await monthlySalaryCol.insertOne({ ...item, createdAt: new Date(), updatedAt: new Date() });
    monthlySalaryUpserted += 1;
  }
  console.log(`Seeded ${monthlySalaries.length} monthly salary ranges (${monthlySalaryUpserted} newly created).`);

  // Seed nationalities
  const nationalityCol = db.collection("nationality");
  const nationalities = [
    { name: "UAE", description: "United Arab Emirates" },
    { name: "Saudi Arabia", description: "" },
    { name: "Qatar", description: "" },
    { name: "Kuwait", description: "" },
    { name: "Bahrain", description: "" },
    { name: "Oman", description: "" },
    { name: "Egypt", description: "" },
    { name: "India", description: "" },
    { name: "Pakistan", description: "" },
    { name: "Philippines", description: "" },
    { name: "UK", description: "United Kingdom" },
    { name: "USA", description: "United States of America" },
  ];
  let nationalityUpserted = 0;
  for (const item of nationalities) {
    const existing = await nationalityCol.findOne({ name: item.name });
    if (existing) continue;
    await nationalityCol.insertOne({ ...item, createdAt: new Date(), updatedAt: new Date() });
    nationalityUpserted += 1;
  }
  console.log(`Seeded ${nationalities.length} nationalities (${nationalityUpserted} newly created).`);

  // Seed job roles with counts (idempotent by name)
  const rolesCol = db.collection("roles");
  const roles = [
    { name: "Healthcare", category: "Healthcare", count: 1406 },
    { name: "Academic", category: "Academic", count: 1026 },
    { name: "Catering", category: "Catering", count: 870 },
    { name: "Civil Engineering", category: "Engineering", count: 847 },
    { name: "Accounting", category: "Accounting", count: 720 },
    { name: "Finance & Consulting", category: "Finance & Consulting", count: 665 },
    { name: "Mechanical Engineering", category: "Engineering", count: 646 },
    { name: "Customer Service", category: "Customer Service", count: 596 },
    { name: "Retail Sales", category: "Retail Sales", count: 532 },
    { name: "Admin", category: "Admin", count: 523 },
    { name: "Software", category: "Software", count: 360 },
    { name: "HSE", category: "HSE", count: 315 },
    { name: "Marketing", category: "Marketing", count: 308 },
    { name: "Management", category: "Management", count: 243 },
    { name: "R&D", category: "R&D", count: 198 },
    { name: "HR", category: "Human Resources", count: 197 },
    { name: "Procurement", category: "Procurement", count: 187 },
    { name: "Design", category: "Design", count: 117 },
    { name: "Legal", category: "Legal", count: 99 },
    { name: "Architecture", category: "Architecture", count: 87 },
    { name: "Investment", category: "Investment", count: 82 },
    { name: "Petroleum Engineering", category: "Engineering", count: 73 },
    { name: "Electronics Engineering", category: "Engineering", count: 72 },
    { name: "Sales", category: "Sales", count: 58 },
    { name: "Chemical Engineering", category: "Engineering", count: 50 },
    { name: "Security", category: "Security", count: 43 },
    { name: "Logistics", category: "Logistics", count: 36 },
    { name: "Drivers", category: "Drivers", count: 28 },
    { name: "Power Engineering", category: "Engineering", count: 30 },
    { name: "Network Admin", category: "Software", count: 29 },
    { name: "Telesales", category: "Sales", count: 17 },
    { name: "Journalism", category: "Journalism", count: 1 },
    { name: "Translation", category: "Translation", count: 1 },
  ];
  let rolesUpserted = 0;
  for (const role of roles) {
    const res = await rolesCol.updateOne(
      { name: role.name },
      {
        $set: { category: role.category, count: role.count, updatedAt: new Date() },
        $setOnInsert: { name: role.name, createdAt: new Date() },
      },
      { upsert: true }
    );
    if (res.upsertedCount) rolesUpserted += 1;
  }
  console.log(`Seeded ${roles.length} roles (${rolesUpserted} newly created).`);

  // Seed job types with counts (idempotent by name)
  const jobTypesCol = db.collection("jobtypes");
  const jobTypes = [
    { name: "Full-time", count: 10412 },
    { name: "Contract", count: 14 },
    { name: "Part-time", count: 9 },
    { name: "Temporary", count: 5 },
    { name: "Internship", count: 0 },
  ];
  let jobTypesUpserted = 0;
  for (const jt of jobTypes) {
    const res = await jobTypesCol.updateOne(
      { name: jt.name },
      { $set: { count: jt.count, updatedAt: new Date() }, $setOnInsert: { name: jt.name, createdAt: new Date() } },
      { upsert: true }
    );
    if (res.upsertedCount) jobTypesUpserted += 1;
  }
  console.log(`Seeded ${jobTypes.length} job types (${jobTypesUpserted} newly created).`);

  // Seed experience levels with counts (idempotent by name)
  const levelsCol = db.collection("levels");
  const levels = [
    { name: "Experienced professional", count: 12279 },
    { name: "Supervisor / Manager", count: 6437 },
    { name: "Student/ Fresh graduate", count: 3534 },
    { name: "Junior Professional", count: 2356 },
    { name: "Top Management / Director", count: 0 },
  ];
  let levelsUpserted = 0;
  for (const lv of levels) {
    const res = await levelsCol.updateOne(
      { name: lv.name },
      { $set: { count: lv.count, updatedAt: new Date() }, $setOnInsert: { name: lv.name, createdAt: new Date() } },
      { upsert: true }
    );
    if (res.upsertedCount) levelsUpserted += 1;
  }
  console.log(`Seeded ${levels.length} experience levels (${levelsUpserted} newly created).`);

  // Seed a batch of realistic jobs spanning countries, roles, types, and levels
  // so the /jobs filters return meaningful results (idempotent by jobId).
  const jobsCol2 = db.collection("jobs");

  // Curated "showcase" jobs designed to satisfy EVERY filter value at least once:
  // all job types, all experience levels, remote/hybrid/on-site, salary edges,
  // every industry, and at least one job in every seeded country/city.
  const daysAgo = (n) => new Date(Date.now() - n * 864e5);
  const showcase = [
    // --- All job types (one each) ---
    { jobId: "sc-fulltime-doctor-dubai", title: "Consultant Physician", department: "Healthcare", category: "Healthcare", role: "Healthcare", location: "Dubai, UAE", type: "Full-time", experience: "Experienced professional", remotePolicy: "On-site", minSalary: 240000, maxSalary: 360000, currency: "AED", skills: ["Healthcare", "Medicine"], badge: "Verified", applicants: 64, postedAt: daysAgo(0) },
    { jobId: "sc-contract-civil-riyadh", title: "Contract Civil Engineer", department: "Civil Engineering", category: "Engineering", role: "Civil Engineering", location: "Riyadh, Saudi Arabia", type: "Contract", experience: "Supervisor / Manager", remotePolicy: "On-site", minSalary: 180000, maxSalary: 260000, currency: "SAR", skills: ["Civil Engineering", "Site"], badge: "Urgent", applicants: 22, postedAt: daysAgo(1) },
    { jobId: "sc-parttime-catering-doha", title: "Part-time Catering Assistant", department: "Catering", category: "Catering", role: "Catering", location: "Doha, Qatar", type: "Part-time", experience: "Student/ Fresh graduate", remotePolicy: "On-site", minSalary: 36000, maxSalary: 54000, currency: "QAR", skills: ["Catering"], badge: null, applicants: 130, postedAt: daysAgo(2) },
    { jobId: "sc-temporary-retail-cairo", title: "Seasonal Retail Associate", department: "Retail Sales", category: "Retail Sales", role: "Retail Sales", location: "Cairo, Egypt", type: "Temporary", experience: "Junior Professional", remotePolicy: "On-site", minSalary: 30000, maxSalary: 48000, currency: "EGP", skills: ["Retail Sales"], badge: null, applicants: 210, postedAt: daysAgo(3) },
    { jobId: "sc-internship-software-amman", title: "Software Engineering Intern", department: "Software", category: "Software", role: "Software", location: "Amman, Jordan", type: "Internship", experience: "Student/ Fresh graduate", remotePolicy: "Hybrid", minSalary: 30000, maxSalary: 42000, currency: "JOD", skills: ["Software", "React"], badge: null, applicants: 340, postedAt: daysAgo(4) },

    // --- Remote & Hybrid coverage + top salary edge ---
    { jobId: "sc-remote-fullstack", title: "Remote Full Stack Engineer", department: "Software", category: "Software", role: "Software", location: "Remote", type: "Full-time", experience: "Experienced professional", remotePolicy: "Remote", minSalary: 120000, maxSalary: 160000, currency: "$", skills: ["Software", "Node", "React"], badge: "Featured", applicants: 512, postedAt: daysAgo(0) },
    { jobId: "sc-hybrid-marketing-dubai", title: "Hybrid Marketing Manager", department: "Marketing", category: "Marketing", role: "Marketing", location: "Dubai, UAE", type: "Full-time", experience: "Supervisor / Manager", remotePolicy: "Hybrid", minSalary: 180000, maxSalary: 240000, currency: "AED", skills: ["Marketing", "Brand"], badge: null, applicants: 88, postedAt: daysAgo(5) },
    { jobId: "sc-director-management-riyadh", title: "Managing Director", department: "Management", category: "Management", role: "Management", location: "Riyadh, Saudi Arabia", type: "Full-time", experience: "Top Management / Director", remotePolicy: "On-site", minSalary: 420000, maxSalary: 600000, currency: "SAR", skills: ["Management", "Strategy"], badge: "Verified", applicants: 12, postedAt: daysAgo(6) },

    // --- One job per remaining industry (to satisfy the Industry filter) ---
    { jobId: "sc-academic-lecturer-abudhabi", title: "University Lecturer", department: "Academic", category: "Academic", role: "Academic", location: "Abu Dhabi, UAE", type: "Full-time", experience: "Experienced professional", remotePolicy: "On-site", minSalary: 180000, maxSalary: 260000, currency: "AED", skills: ["Academic", "Teaching"], badge: null, applicants: 76, postedAt: daysAgo(7) },
    { jobId: "sc-accounting-jeddah", title: "Senior Accountant", department: "Accounting", category: "Accounting", role: "Accounting", location: "Jeddah, Saudi Arabia", type: "Full-time", experience: "Experienced professional", remotePolicy: "Hybrid", minSalary: 96000, maxSalary: 144000, currency: "SAR", skills: ["Accounting"], badge: null, applicants: 143, postedAt: daysAgo(8) },
    { jobId: "sc-finance-consultant-manama", title: "Finance Consultant", department: "Finance & Consulting", category: "Finance & Consulting", role: "Finance & Consulting", location: "Manama, Bahrain", type: "Contract", experience: "Supervisor / Manager", remotePolicy: "Hybrid", minSalary: 132000, maxSalary: 192000, currency: "$", skills: ["Finance & Consulting"], badge: null, applicants: 54, postedAt: daysAgo(9) },
    { jobId: "sc-customer-service-kuwait", title: "Customer Service Representative", department: "Customer Service", category: "Customer Service", role: "Customer Service", location: "Kuwait City, Kuwait", type: "Full-time", experience: "Junior Professional", remotePolicy: "On-site", minSalary: 48000, maxSalary: 72000, currency: "$", skills: ["Customer Service"], badge: null, applicants: 267, postedAt: daysAgo(10) },
    { jobId: "sc-admin-muscat", title: "Office Administrator", department: "Admin", category: "Admin", role: "Admin", location: "Muscat, Oman", type: "Full-time", experience: "Junior Professional", remotePolicy: "On-site", minSalary: 42000, maxSalary: 66000, currency: "$", skills: ["Admin"], badge: null, applicants: 189, postedAt: daysAgo(11) },
    { jobId: "sc-hse-officer-basra", title: "HSE Officer", department: "HSE", category: "HSE", role: "HSE", location: "Basra, Iraq", type: "Contract", experience: "Experienced professional", remotePolicy: "On-site", minSalary: 96000, maxSalary: 156000, currency: "$", skills: ["HSE", "Safety"], badge: "Urgent", applicants: 41, postedAt: daysAgo(12) },
    { jobId: "sc-rd-scientist-beirut", title: "R&D Scientist", department: "R&D", category: "R&D", role: "R&D", location: "Beirut, Lebanon", type: "Full-time", experience: "Experienced professional", remotePolicy: "Hybrid", minSalary: 84000, maxSalary: 132000, currency: "$", skills: ["R&D"], badge: null, applicants: 33, postedAt: daysAgo(13) },
    { jobId: "sc-hr-partner-mumbai", title: "HR Business Partner", department: "Human Resources", category: "Human Resources", role: "HR", location: "Mumbai, India", type: "Full-time", experience: "Supervisor / Manager", remotePolicy: "Hybrid", minSalary: 60000, maxSalary: 96000, currency: "$", skills: ["HR"], badge: null, applicants: 121, postedAt: daysAgo(14) },
    { jobId: "sc-procurement-karachi", title: "Procurement Specialist", department: "Procurement", category: "Procurement", role: "Procurement", location: "Karachi, Pakistan", type: "Full-time", experience: "Experienced professional", remotePolicy: "On-site", minSalary: 42000, maxSalary: 72000, currency: "$", skills: ["Procurement"], badge: null, applicants: 97, postedAt: daysAgo(15) },
    { jobId: "sc-design-uiux-london", title: "UI/UX Designer", department: "Design", category: "Design", role: "Design", location: "London, United Kingdom", type: "Full-time", experience: "Experienced professional", remotePolicy: "Remote", minSalary: 90000, maxSalary: 130000, currency: "£", skills: ["Design", "Figma"], badge: "Featured", applicants: 205, postedAt: daysAgo(1) },
    { jobId: "sc-legal-counsel-berlin", title: "Legal Counsel", department: "Legal", category: "Legal", role: "Legal", location: "Berlin, Germany", type: "Full-time", experience: "Supervisor / Manager", remotePolicy: "Hybrid", minSalary: 96000, maxSalary: 140000, currency: "€", skills: ["Legal"], badge: null, applicants: 47, postedAt: daysAgo(16) },
    { jobId: "sc-architect-munich", title: "Senior Architect", department: "Architecture", category: "Architecture", role: "Architecture", location: "Munich, Germany", type: "Full-time", experience: "Supervisor / Manager", remotePolicy: "On-site", minSalary: 84000, maxSalary: 120000, currency: "€", skills: ["Architecture"], badge: null, applicants: 39, postedAt: daysAgo(17) },
    { jobId: "sc-investment-analyst-newyork", title: "Investment Analyst", department: "Investment", category: "Investment", role: "Investment", location: "New York, United States", type: "Full-time", experience: "Junior Professional", remotePolicy: "Hybrid", minSalary: 110000, maxSalary: 150000, currency: "$", skills: ["Investment"], badge: "Featured", applicants: 312, postedAt: daysAgo(2) },
    { jobId: "sc-sales-exec-singapore", title: "Sales Executive", department: "Sales", category: "Sales", role: "Sales", location: "Singapore", type: "Full-time", experience: "Junior Professional", remotePolicy: "On-site", minSalary: 60000, maxSalary: 96000, currency: "$", skills: ["Sales"], badge: null, applicants: 154, postedAt: daysAgo(18) },
    { jobId: "sc-security-guard-paris", title: "Security Supervisor", department: "Security", category: "Security", role: "Security", location: "Paris, France", type: "Full-time", experience: "Experienced professional", remotePolicy: "On-site", minSalary: 42000, maxSalary: 66000, currency: "€", skills: ["Security"], badge: null, applicants: 61, postedAt: daysAgo(19) },
    { jobId: "sc-logistics-amsterdam", title: "Logistics Coordinator", department: "Logistics", category: "Logistics", role: "Logistics", location: "Amsterdam, Netherlands", type: "Full-time", experience: "Junior Professional", remotePolicy: "Hybrid", minSalary: 54000, maxSalary: 84000, currency: "€", skills: ["Logistics"], badge: null, applicants: 73, postedAt: daysAgo(3) },
    { jobId: "sc-journalist-cairo", title: "Staff Journalist", department: "Journalism", category: "Journalism", role: "Journalism", location: "Alexandria, Egypt", type: "Contract", experience: "Junior Professional", remotePolicy: "Remote", minSalary: 30000, maxSalary: 54000, currency: "EGP", skills: ["Journalism"], badge: null, applicants: 18, postedAt: daysAgo(4) },
    { jobId: "sc-translator-remote", title: "Arabic-English Translator", department: "Translation", category: "Translation", role: "Translation", location: "Remote", type: "Contract", experience: "Experienced professional", remotePolicy: "Remote", minSalary: 36000, maxSalary: 60000, currency: "$", skills: ["Translation"], badge: null, applicants: 26, postedAt: daysAgo(5) },

    // --- Germany Driver Jobs ---
    { jobId: "sc-truck-driver-berlin", title: "Truck Driver", department: "Drivers", category: "Drivers", role: "Driver", location: "Berlin, Germany", type: "Full-time", experience: "Experienced professional", remotePolicy: "On-site", minSalary: 42000, maxSalary: 58000, currency: "€", skills: ["Truck Driving", "Logistics", "Driving License"], badge: "Urgent", applicants: 34, postedAt: daysAgo(1) },
    { jobId: "sc-delivery-driver-munich", title: "Delivery Driver", department: "Drivers", category: "Drivers", role: "Driver", location: "Munich, Germany", type: "Full-time", experience: "Junior Professional", remotePolicy: "On-site", minSalary: 34000, maxSalary: 46000, currency: "€", skills: ["Delivery", "Driving", "Navigation"], badge: null, applicants: 67, postedAt: daysAgo(3) },
    { jobId: "sc-longhaul-driver-hamburg", title: "Long-haul Truck Driver", department: "Drivers", category: "Drivers", role: "Driver", location: "Hamburg, Germany", type: "Full-time", experience: "Experienced professional", remotePolicy: "On-site", minSalary: 48000, maxSalary: 64000, currency: "€", skills: ["Truck Driving", "Long-haul", "Logistics"], badge: "Featured", applicants: 45, postedAt: daysAgo(2) },
    { jobId: "sc-courier-driver-frankfurt", title: "Courier Driver", department: "Drivers", category: "Drivers", role: "Driver", location: "Frankfurt, Germany", type: "Part-time", experience: "Student/ Fresh graduate", remotePolicy: "On-site", minSalary: 22000, maxSalary: 32000, currency: "€", skills: ["Courier", "Driving", "Time Management"], badge: null, applicants: 89, postedAt: daysAgo(5) },
    { jobId: "sc-bus-driver-cologne", title: "Bus Driver", department: "Drivers", category: "Drivers", role: "Driver", location: "Cologne, Germany", type: "Full-time", experience: "Experienced professional", remotePolicy: "On-site", minSalary: 36000, maxSalary: 48000, currency: "€", skills: ["Bus Driving", "Public Transport", "Safety"], badge: null, applicants: 23, postedAt: daysAgo(7) },
  ];

  const roleTitles = {
    Healthcare: ["Registered Nurse", "Medical Officer", "Lab Technician"],
    "Civil Engineering": ["Site Civil Engineer", "Structural Engineer"],
    Accounting: ["Senior Accountant", "Accounts Payable Officer"],
    Software: ["Full Stack Developer", "Backend Engineer", "QA Engineer"],
    Marketing: ["Digital Marketing Specialist", "Brand Manager"],
    "Customer Service": ["Customer Support Agent", "Call Center Rep"],
    Admin: ["Executive Assistant", "Office Administrator"],
    Sales: ["Sales Executive", "Account Manager"],
    HR: ["HR Business Partner", "Recruitment Specialist"],
    Design: ["UI/UX Designer", "Graphic Designer"],
    Logistics: ["Logistics Coordinator", "Warehouse Supervisor"],
    Drivers: ["Truck Driver", "Delivery Driver", "Bus Driver"],
  };
  const cityByCountry = Object.fromEntries(countries.map((c) => [c.name, c.cities]));
  const typeNames = ["Full-time", "Contract", "Part-time", "Temporary", "Internship"];
  const levelNames = levels.map((l) => l.name);
  const currencies = { UAE: "AED", "Saudi Arabia": "SAR", Qatar: "QAR", Egypt: "EGP", Jordan: "JOD" };
  const targetCountries = ["UAE", "Saudi Arabia", "Qatar", "Egypt", "Jordan", "Kuwait", "Oman", "India", "Germany"];

  const generated = [];
  let idx = 0;
  for (const [role, titles] of Object.entries(roleTitles)) {
    for (const country of targetCountries) {
      const cities = cityByCountry[country] || [country];
      const city = cities[idx % cities.length];
      const title = titles[idx % titles.length];
      const type = typeNames[idx % typeNames.length];
      const level = levelNames[idx % levelNames.length];
      const cur = currencies[country] || "$";
      const base = 4000 + (idx % 9) * 1500;
      generated.push({
        jobId: `gen-${role}-${country}-${idx}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: `${title}`,
        department: role,
        category: role,
        role,
        location: `${city}, ${country}`,
        type,
        experience: level,
        minSalary: base * 12,
        maxSalary: (base + 3000) * 12,
        currency: cur,
        skills: [role, title.split(" ")[0]],
        badge: idx % 7 === 0 ? "Urgent" : null,
        applicants: (idx * 13) % 300,
        postedAt: new Date(Date.now() - (idx % 20) * 864e5),
        status: "Active",
      });
      idx += 1;
    }
  }
  let genUpserted = 0;
  const allSeedJobs = [...showcase, ...generated];
  for (const j of allSeedJobs) {
    const doc = { status: "Active", ...j };
    const res = await jobsCol2.updateOne(
      { jobId: doc.jobId },
      { $set: { ...doc, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    if (res.upsertedCount) genUpserted += 1;
  }
  console.log(`Seeded ${allSeedJobs.length} sample jobs (${genUpserted} newly created).`);

  // --- Employers (linked with admin) ---
  const employersCol = db.collection("employers");
  await employersCol.createIndex({ email: 1 }, { unique: true });
  const employerSeed = [
    {
      name: "Acme Design Co.",
      email: "employer@acme.com",
      company: "Acme Design Co.",
      industry: "Information Technology",
      location: "San Francisco, CA",
      description: "Award-winning product design studio building delightful digital experiences.",
      password: "password123",
      status: "Active",
      // Link the existing showcase employer job(s) to this employer.
      linkJobIds: ["EMP-000002"],
    },
    {
      name: "Nimbus Systems",
      email: "employer@nimbus.io",
      company: "Nimbus Systems",
      industry: "Information Technology",
      location: "Austin, TX",
      description: "Cloud infrastructure company scaling reliable platforms for the enterprise.",
      password: "password123",
      status: "Active",
      linkJobIds: ["EMP-000003"],
    },
  ];
  let empUpserted = 0;
  for (const e of employerSeed) {
    const { linkJobIds, ...doc } = e;
    await employersCol.updateOne(
      { email: doc.email },
      { $set: { ...doc, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date(), logoId: null } },
      { upsert: true }
    );
    const emp = await employersCol.findOne({ email: doc.email });
    if (emp) {
      empUpserted += 1;
      // Link the employer's showcase jobs by stamping employerId + createdBy.
      if (Array.isArray(linkJobIds) && linkJobIds.length) {
        await jobsCol2.updateMany(
          { jobId: { $in: linkJobIds } },
          { $set: { employerId: emp._id.toString(), createdBy: doc.email } }
        );
      }
    }
  }
  console.log(`Seeded ${employerSeed.length} employers (${empUpserted} upserted) and linked their jobs.`);

  // --- Admin user (for Admin Portal login) ---
  const adminsCol = db.collection("admins");
  await adminsCol.createIndex({ email: 1 }, { unique: true });
  const adminSeed = [
    {
      name: "System Administrator",
      email: "admin@organization.com",
      // Test credentials requested for QA: admin / 123
      username: "admin",
      password: "admin123",
      role: "Super Admin",
      status: "Active",
    },
  ];
  let adminUpserted = 0;
  for (const a of adminSeed) {
    const res = await adminsCol.updateOne(
      { email: a.email },
      { $set: { ...a, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    if (res.upsertedCount) adminUpserted += 1;
  }
  console.log(`Seeded ${adminSeed.length} admin(s) (${adminUpserted} newly created).`);

  await client.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
