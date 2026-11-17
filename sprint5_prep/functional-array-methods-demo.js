/**
 * Functional programming with arrays: map, filter, forEach, reduce
 * -----------------------------------------------------------------
 * The data below looks like rows returned from a "users" table
 * (e.g. SELECT * FROM users). All examples are pure: they never change
 * the original array. They return NEW values instead.
 *
 * Run with:  node functional-array-methods-demo.js
 */

// ---------------------------------------------------------------------------
// Fake database result
// ---------------------------------------------------------------------------
const users = [
  { id: 1, first_name: "Ava",    last_name: "Johnson", email: "ava.j@example.com",    role: "admin",  department: "Engineering", salary: 125000, is_active: true,  created_at: "2021-03-14", last_login: "2026-11-01" },
  { id: 2, first_name: "Liam",   last_name: "Smith",   email: "liam.s@example.com",   role: "user",   department: "Marketing",   salary: 68000,  is_active: true,  created_at: "2022-07-02", last_login: "2026-10-28" },
  { id: 3, first_name: "Noah",   last_name: "Brown",   email: "noah.b@example.com",   role: "user",   department: "Engineering", salary: 98000,  is_active: false, created_at: "2020-11-23", last_login: "2025-12-15" },
  { id: 4, first_name: "Emma",   last_name: "Davis",   email: "emma.d@example.com",   role: "editor", department: "Content",     salary: 72000,  is_active: true,  created_at: "2023-01-09", last_login: "2026-11-07" },
  { id: 5, first_name: "Olivia", last_name: "Wilson",  email: "olivia.w@example.com", role: "user",   department: "Sales",       salary: 61000,  is_active: true,  created_at: "2024-05-18", last_login: "2026-09-30" },
  { id: 6, first_name: "Mason",  last_name: "Garcia",  email: "mason.g@example.com",  role: "admin",  department: "Engineering", salary: 140000, is_active: true,  created_at: "2019-08-30", last_login: "2026-11-06" },
  { id: 7, first_name: "Sophia", last_name: "Martinez",email: "sophia.m@example.com", role: "editor", department: "Content",     salary: 75000,  is_active: false, created_at: "2022-02-11", last_login: "2026-02-20" },
  { id: 8, first_name: "Lucas",  last_name: "Lee",     email: "lucas.l@example.com",  role: "user",   department: "Sales",       salary: 58000,  is_active: true,  created_at: "2025-06-01", last_login: "2026-11-05" },
];

const heading = (title) => console.log(`\n${"=".repeat(60)}\n${title}\n${"=".repeat(60)}`);
const money = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// ---------------------------------------------------------------------------
// 1. map — transform every item into something new (same length out)
// ---------------------------------------------------------------------------
heading("map — shape DB rows into what the frontend needs");

// Real-life use: an API should never send salary or internal fields to the
// browser. Map each DB row into a public "DTO" with camelCase keys.
const toPublicUser = (u) => ({
  id: u.id,
  fullName: `${u.first_name} ${u.last_name}`,
  email: u.email,
  role: u.role,
});

const publicUsers = users.map(toPublicUser);
console.log(publicUsers.slice(0, 3));
console.log(`...${publicUsers.length} users mapped. Original row still has salary?`, "salary" in users[0]);

// Simple map: pull out one field.
const emails = users.map((u) => u.email);
console.log("\nMailing list:", emails.join(", "));

// ---------------------------------------------------------------------------
// 2. filter — keep only the items that pass a test (same or fewer out)
// ---------------------------------------------------------------------------
heading("filter — find the users you care about");

// Small, reusable "predicate" functions read like plain English.
const isActive = (u) => u.is_active;
const isAdmin = (u) => u.role === "admin";
const inDepartment = (dept) => (u) => u.department === dept; // returns a predicate

const activeUsers = users.filter(isActive);
console.log(`Active users: ${activeUsers.length} of ${users.length}`);

const activeAdmins = users.filter(isActive).filter(isAdmin);
console.log("Active admins:", activeAdmins.map((u) => u.first_name));

const engineers = users.filter(inDepartment("Engineering"));
console.log("Engineering:", engineers.map((u) => u.first_name));

// Real-life use: find accounts nobody has used in 6+ months.
const daysSince = (dateStr, today = new Date("2026-11-08")) =>
  Math.floor((today - new Date(dateStr)) / (1000 * 60 * 60 * 24));

const staleAccounts = users.filter((u) => daysSince(u.last_login) > 180);
console.log("Stale accounts (no login in 180+ days):",
  staleAccounts.map((u) => `${u.first_name} (${daysSince(u.last_login)} days)`));

// ---------------------------------------------------------------------------
// 3. forEach — do something with each item (returns nothing)
// ---------------------------------------------------------------------------
heading("forEach — side effects like logging, sending emails, writing files");

// Use forEach when the goal is an ACTION, not a new array.
// Real-life use: send a "we miss you" email to each stale account.
const sendEmail = (to, subject) => console.log(`📧 To: ${to.padEnd(22)} | ${subject}`);

staleAccounts.forEach((u) =>
  sendEmail(u.email, `We miss you, ${u.first_name}! Come back and log in.`)
);

// forEach also gives you the index — handy for printing a numbered table.
console.log("\nUser directory:");
users.forEach((u, i) => {
  const status = u.is_active ? "active" : "inactive";
  console.log(`${String(i + 1).padStart(2)}. ${`${u.first_name} ${u.last_name}`.padEnd(17)} ${u.role.padEnd(7)} ${status}`);
});

// ---------------------------------------------------------------------------
// 4. reduce — boil an array down to ONE value (number, object, anything)
// ---------------------------------------------------------------------------
heading("reduce — totals, groupings, and lookups");

// a) A single number: total payroll.
const totalPayroll = users.reduce((sum, u) => sum + u.salary, 0);
console.log("Total payroll:", money(totalPayroll));

// b) Count by a field: how many users per role?
const countByRole = users.reduce((counts, u) => {
  counts[u.role] = (counts[u.role] || 0) + 1;
  return counts;
}, {});
console.log("Users per role:", countByRole);

// c) Group into arrays: users by department.
const byDepartment = users.reduce((groups, u) => {
  (groups[u.department] ||= []).push(u.first_name);
  return groups;
}, {});
console.log("Users by department:", byDepartment);

// d) Build a lookup table: get any user by id instantly, instead of
//    searching the whole array each time.
const usersById = users.reduce((lookup, u) => ({ ...lookup, [u.id]: u }), {});
console.log("Lookup user #6:", usersById[6].first_name, usersById[6].last_name);

// e) Find the max: highest paid user.
const topEarner = users.reduce((top, u) => (u.salary > top.salary ? u : top));
console.log(`Top earner: ${topEarner.first_name} at ${money(topEarner.salary)}`);

// ---------------------------------------------------------------------------
// 5. Putting it together — chaining into a data pipeline
// ---------------------------------------------------------------------------
heading("Chaining — a department salary report in one pipeline");

// Real-life use: "Average salary of ACTIVE users per department, highest first."
// Each step does one small job and hands a new array to the next.
const report = Object.entries(
  users
    .filter(isActive)                                   // keep active users
    .reduce((acc, u) => {                               // group salaries by dept
      (acc[u.department] ||= []).push(u.salary);
      return acc;
    }, {})
)
  .map(([department, salaries]) => ({                    // compute stats per dept
    department,
    headcount: salaries.length,
    average: salaries.reduce((a, b) => a + b, 0) / salaries.length,
  }))
  .sort((a, b) => b.average - a.average);               // highest first

report.forEach((r) =>
  console.log(`${r.department.padEnd(12)} ${String(r.headcount).padStart(2)} people   avg ${money(r.average)}`)
);

// ---------------------------------------------------------------------------
// Proof that nothing was mutated
// ---------------------------------------------------------------------------
heading("Immutability check");
console.log(`Original array still has ${users.length} users,`,
  `first row keys: ${Object.keys(users[0]).length} (unchanged).`);

heading("Cheat sheet");
console.log(`
  map(fn)          -> NEW array, same length, each item transformed
  filter(fn)       -> NEW array, only items where fn returns true
  forEach(fn)      -> returns undefined; use it for side effects (log, send, save)
  reduce(fn, init) -> ONE value built up item by item (sum, object, lookup...)
`);
