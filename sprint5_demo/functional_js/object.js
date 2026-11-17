
const users = [
  { id: 1, 
    first_name: "Ava",    
    last_name: "Johnson", 
    email: "ava.j@example.com",    
    role: "admin",  
    department: "Engineering", 
    salary: 125000, 
    is_active: true,  
    created_at: "2021-03-14", 
    last_login: "2026-11-01" 
  },
  { id: 2, first_name: "Liam",   last_name: "Smith",   email: "liam.s@example.com",   role: "user",   department: "Marketing",   salary: 68000,  is_active: true,  created_at: "2022-07-02", last_login: "2026-10-28" },
  { id: 3, first_name: "Noah",   last_name: "Brown",   email: "noah.b@example.com",   role: "user",   department: "Engineering", salary: 98000,  is_active: false, created_at: "2020-11-23", last_login: "2025-12-15" },
  { id: 4, first_name: "Emma",   last_name: "Davis",   email: "emma.d@example.com",   role: "editor", department: "Content",     salary: 72000,  is_active: true,  created_at: "2023-01-09", last_login: "2026-11-07" },
  { id: 5, first_name: "Olivia", last_name: "Wilson",  email: "olivia.w@example.com", role: "user",   department: "Sales",       salary: 61000,  is_active: true,  created_at: "2024-05-18", last_login: "2026-09-30" },
  { id: 6, first_name: "Mason",  last_name: "Garcia",  email: "mason.g@example.com",  role: "admin",  department: "Engineering", salary: 140000, is_active: true,  created_at: "2019-08-30", last_login: "2026-11-06" },
  { id: 7, first_name: "Sophia", last_name: "Martinez",email: "sophia.m@example.com", role: "editor", department: "Content",     salary: 75000,  is_active: false, created_at: "2022-02-11", last_login: "2026-02-20" },
  { id: 8, first_name: "Lucas",  last_name: "Lee",     email: "lucas.l@example.com",  role: "user",   department: "Sales",       salary: 58000,  is_active: true,  created_at: "2025-06-01", last_login: "2026-11-05" },
];

const toPublicUser = (u) => ({
  id: u.id,
  fullName: `${u.first_name} ${u.last_name}`,
  email: u.email,
  role: u.role,
});

const publicUsers = users.map(toPublicUser);
// console.log(publicUsers)

// ---------------------------------------------------------------------------
// 2. filter — keep only the items that pass a test (same or fewer out)
// ---------------------------------------------------------------------------
const isActive = (u) => u.is_active;
const isAdmin = (u) => u.role === "admin";
const inDepartment = (dept) => (u) => u.department === dept; // returns a predicate

// ALL ACTIVE USERS
const activeUsers = users.filter(isActive);
const adminUsers = users.filter(isAdmin);
// let activeUsers = users.filter((u) => !isActive(u));
console.log(activeUsers)

const engineers = users.filter(inDepartment("Engineering"))


// ---------------------------------------------------------------------------
// 4. reduce — boil an array down to ONE value (number, object, anything)
// ---------------------------------------------------------------------------

// TOTAL PAYROLL
const payroll = users.reduce((sum, u) => sum + u.salary, 0)

const byDepartment = users.reduce((groups, u) => {
  (groups[u.department] ||= []).push(u.first_name);
  return groups;
}, {});