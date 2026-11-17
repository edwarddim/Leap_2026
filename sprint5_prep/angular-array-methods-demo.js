/**
 * map, filter, forEach, reduce — how they show up in an Angular app
 * ------------------------------------------------------------------
 * Real Angular code is TypeScript with decorators (@Component, @Injectable)
 * and needs the Angular CLI to run. To keep this demo runnable with plain
 * Node, this file:
 *   - writes services and components as normal JS classes
 *   - shows the real Angular decorator / template in a comment above each one
 *   - fakes HttpClient with a tiny Observable so `.pipe(map(...))` still works
 *   - "runs" the components by calling their lifecycle hooks by hand
 *
 * Run with:  node angular-array-methods-demo.js
 */

// ===========================================================================
// Tiny stand-ins for RxJS + HttpClient (in Angular these come from
// 'rxjs', 'rxjs/operators' and '@angular/common/http')
// ===========================================================================
class Observable {
  constructor(producer) { this.producer = producer; }
  subscribe(next) { this.producer(next); }
  pipe(...operators) { return operators.reduce((obs, op) => op(obs), this); } // reduce!
}
const of = (value) => new Observable((next) => next(value));
// RxJS map: transforms the WHOLE value an Observable emits (here: the entire array)
const rxMap = (fn) => (source) => new Observable((next) => source.subscribe((v) => next(fn(v))));

// What the backend sends back for GET /api/users and GET /api/products
const FAKE_DB = {
  "/api/users": [
    { id: 1, first_name: "Ava",    last_name: "Johnson",  email: "ava.j@example.com",    role: "admin",  is_active: true,  avatar_url: null },
    { id: 2, first_name: "Liam",   last_name: "Smith",    email: "liam.s@example.com",   role: "user",   is_active: true,  avatar_url: "/img/liam.png" },
    { id: 3, first_name: "Noah",   last_name: "Brown",    email: "noah.b@example.com",   role: "user",   is_active: false, avatar_url: null },
    { id: 4, first_name: "Emma",   last_name: "Davis",    email: "emma.d@example.com",   role: "editor", is_active: true,  avatar_url: "/img/emma.png" },
    { id: 5, first_name: "Olivia", last_name: "Wilson",   email: "olivia.w@example.com", role: "user",   is_active: true,  avatar_url: null },
    { id: 6, first_name: "Mason",  last_name: "Garcia",   email: "mason.g@example.com",  role: "admin",  is_active: true,  avatar_url: null },
  ],
  "/api/products": [
    { id: 101, name: "Mechanical Keyboard", price: 129.99, category: "Accessories" },
    { id: 102, name: "4K Monitor",          price: 399.0,  category: "Displays" },
    { id: 103, name: "USB-C Hub",           price: 49.5,   category: "Accessories" },
  ],
};
class HttpClient {
  get(url) { return of(structuredClone(FAKE_DB[url])); }
}

const heading = (t) => console.log(`\n${"=".repeat(64)}\n${t}\n${"=".repeat(64)}`);
const usd = (n) => `$${n.toFixed(2)}`;

// ===========================================================================
// 1. SERVICE — map the API response into the shape the UI wants
// ===========================================================================
/*
  @Injectable({ providedIn: 'root' })
  export class UserService {
    private http = inject(HttpClient);
    getUsers(): Observable<User[]> { ... }
  }
*/
class UserService {
  constructor(http) { this.http = http; }

  getUsers() {
    return this.http.get("/api/users").pipe(
      // ⚠️ Two different "maps" here — a very common Angular confusion:
      //   rxMap  (RxJS)  -> runs ONCE, receives the whole array
      //   .map   (Array) -> runs once PER USER inside that array
      rxMap((rows) => rows.map((row) => ({
        id: row.id,
        fullName: `${row.first_name} ${row.last_name}`,
        email: row.email,
        role: row.role,
        isActive: row.is_active,
        avatarUrl: row.avatar_url ?? "/img/default-avatar.png", // fill in defaults
        selected: false, // UI-only state the backend knows nothing about
      })))
    );
  }
}

// ===========================================================================
// 2. COMPONENT — a searchable, selectable user table
// ===========================================================================
/*
  @Component({
    selector: 'app-user-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <input [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Search..." />
      <select [(ngModel)]="roleFilter" (ngModelChange)="applyFilters()"> ... </select>

      @for (user of visibleUsers; track user.id) {
        <tr [class.inactive]="!user.isActive">
          <td><input type="checkbox" [checked]="user.selected" (change)="toggleSelected(user.id)" /></td>
          <td>{{ user.fullName }}</td> <td>{{ user.role }}</td>
        </tr>
      }

      <p>{{ stats.active }} active · {{ stats.inactive }} inactive</p>
      <button [disabled]="selectedCount === 0" (click)="emailSelected()">
        Email {{ selectedCount }} selected
      </button>
    `
  })
*/
class UserListComponent {
  users = [];          // everything from the server
  visibleUsers = [];   // what the @for loop renders
  searchTerm = "";
  roleFilter = "all";
  stats = {};

  constructor(userService) { this.userService = userService; }

  // Lifecycle hook — Angular calls this once after the component is created
  ngOnInit() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      this.applyFilters();
    });
  }

  // FILTER — runs every time the search box or role dropdown changes
  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();
    this.visibleUsers = this.users
      .filter((u) => this.roleFilter === "all" || u.role === this.roleFilter)
      .filter((u) => !term || u.fullName.toLowerCase().includes(term) || u.email.includes(term));
    this.stats = this.computeStats(this.visibleUsers);
  }

  // REDUCE — build the summary numbers shown under the table
  computeStats(list) {
    return list.reduce(
      (acc, u) => {
        acc[u.isActive ? "active" : "inactive"]++;
        acc.byRole[u.role] = (acc.byRole[u.role] || 0) + 1;
        return acc;
      },
      { active: 0, inactive: 0, byRole: {} }
    );
  }

  // MAP for immutable updates — with OnPush change detection Angular only
  // re-renders when it gets a NEW array/object reference. Mutating
  // `user.selected = true` in place can leave the screen out of date.
  toggleSelected(id) {
    this.users = this.users.map((u) => (u.id === id ? { ...u, selected: !u.selected } : u));
    this.applyFilters();
  }

  get selectedCount() {
    return this.users.filter((u) => u.selected).length;
  }

  // FOREACH — side effects: one action per selected user, no new array needed
  emailSelected() {
    this.users
      .filter((u) => u.selected)
      .forEach((u) => console.log(`  📧 queued email to ${u.email}`));
  }

  // Pretend this is the HTML template rendering
  render(label) {
    console.log(`\n[${label}]  search="${this.searchTerm}" role=${this.roleFilter}`);
    this.visibleUsers.forEach((u) =>
      console.log(`  ${u.selected ? "☑" : "☐"} ${u.fullName.padEnd(15)} ${u.role.padEnd(7)} ${u.isActive ? "" : "(inactive)"}`)
    );
    console.log(`  ${this.stats.active} active · ${this.stats.inactive} inactive · by role:`, this.stats.byRole);
    console.log(`  [Email ${this.selectedCount} selected]`);
  }
}

// ===========================================================================
// 3. COMPONENT — a shopping cart (reduce for totals, map for line items)
// ===========================================================================
/*
  @Component({
    selector: 'app-cart',
    template: `
      @for (line of lineItems; track line.id) {
        <div>{{ line.name }} × {{ line.qty }} = {{ line.lineTotal | currency }}</div>
      }
      <strong>Subtotal: {{ subtotal | currency }}</strong>
    `
  })
*/
class CartComponent {
  cart = [ { productId: 101, qty: 1 }, { productId: 103, qty: 3 }, { productId: 102, qty: 2 } ];
  lineItems = [];

  constructor(http) { this.http = http; }

  ngOnInit() {
    this.http.get("/api/products").subscribe((products) => {
      // REDUCE into a lookup object so each cart row finds its product fast
      const productsById = products.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

      // MAP cart rows (just ids + qty) into full line items for the template
      this.lineItems = this.cart.map(({ productId, qty }) => {
        const p = productsById[productId];
        return { id: p.id, name: p.name, category: p.category, qty, lineTotal: p.price * qty };
      });
    });
  }

  // Getters work like computed values in the template: {{ subtotal }}
  get subtotal() { return this.lineItems.reduce((sum, l) => sum + l.lineTotal, 0); }
  get itemCount() { return this.lineItems.reduce((sum, l) => sum + l.qty, 0); }
  get totalsByCategory() {
    return this.lineItems.reduce((acc, l) => {
      acc[l.category] = (acc[l.category] || 0) + l.lineTotal;
      return acc;
    }, {});
  }

  render() {
    this.lineItems.forEach((l) =>
      console.log(`  ${l.name.padEnd(20)} × ${l.qty}  = ${usd(l.lineTotal).padStart(9)}`)
    );
    console.log(`  ${"-".repeat(40)}`);
    console.log(`  ${this.itemCount} items                  Subtotal ${usd(this.subtotal)}`);
    Object.entries(this.totalsByCategory).forEach(([cat, total]) =>
      console.log(`    ${cat.padEnd(12)} ${usd(total)}`)
    );
  }
}

// ===========================================================================
// 4. REACTIVE FORM — forEach to build controls, reduce to validate
// ===========================================================================
/*
  In Angular:
    this.form = this.fb.group({});
    fields.forEach(f => this.form.addControl(f.key, new FormControl('', f.required ? Validators.required : null)));
*/
class DynamicFormComponent {
  // Field definitions often come from a config file or the server
  fields = [
    { key: "fullName", label: "Full name", required: true },
    { key: "email",    label: "Email",     required: true },
    { key: "company",  label: "Company",   required: false },
  ];
  controls = {};

  ngOnInit() {
    // FOREACH — register a control for each field definition (a side effect)
    this.fields.forEach((f) => { this.controls[f.key] = { value: "", required: f.required }; });
  }

  setValue(key, value) { this.controls[key].value = value; }

  // REDUCE + FILTER + MAP — collect error messages for the template
  get errors() {
    return this.fields
      .filter((f) => this.controls[f.key].required && !this.controls[f.key].value)
      .map((f) => `${f.label} is required`);
  }
  get valid() {
    return Object.values(this.controls).reduce((ok, c) => ok && (!c.required || !!c.value), true);
  }
}

// ===========================================================================
// "Bootstrapping" the app — Angular would do all of this for you
// ===========================================================================
const http = new HttpClient();

heading("UserListComponent — map (service), filter, reduce, forEach");
const userList = new UserListComponent(new UserService(http));
userList.ngOnInit();
userList.render("initial load");

userList.searchTerm = "son";        // user types in the search box
userList.applyFilters();
userList.render("after typing 'son'");

userList.searchTerm = "";
userList.roleFilter = "admin";      // user picks a role from the dropdown
userList.applyFilters();
userList.render("role = admin");

const before = userList.users;
userList.toggleSelected(1);         // user ticks two checkboxes
userList.toggleSelected(6);
userList.render("after selecting Ava & Mason");
console.log(`  New array reference after toggle? ${before !== userList.users} (OnPush will re-render)`);

console.log("\n  Clicking 'Email selected':");
userList.emailSelected();

heading("CartComponent — reduce for lookups & totals, map for line items");
const cart = new CartComponent(http);
cart.ngOnInit();
cart.render();

heading("DynamicFormComponent — forEach to build, filter/map/reduce to validate");
const form = new DynamicFormComponent();
form.ngOnInit();
console.log("  Empty form valid?", form.valid, "| errors:", form.errors);
form.setValue("fullName", "Ava Johnson");
console.log("  After name typed  ", form.valid, "| errors:", form.errors);
form.setValue("email", "ava.j@example.com");
console.log("  After email typed ", form.valid, "| errors:", form.errors);

heading("Where each method usually lives in Angular");
console.log(`
  map      -> services: turn API rows into UI models (inside RxJS pipe(map(...)))
              components: immutable updates so OnPush change detection notices
  filter   -> search boxes, dropdown filters, "selected" items, form errors
  forEach  -> side effects: building form controls, sending requests, logging
  reduce   -> totals and counts in getters, grouping, id lookups
`);
