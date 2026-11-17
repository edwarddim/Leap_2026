Here are four folder structures for students to classify. Each one comes from a different kind of app, so students can't match them to the earlier examples by name. The answer key is at the end, so you can remove it before sharing.

**The question for students:** *For each structure, decide whether it follows a feature-based architecture, a domain-based architecture, or neither. Point to at least two clues in the folders that support your answer.*

---

### Example A: Fitness tracking app

```
src/app/
├── core/
│   ├── auth.interceptor.ts
│   ├── auth.service.ts
│   └── layout/
│       ├── header.component.ts
│       └── sidebar.component.ts
├── shared/
│   ├── components/
│   │   ├── chart.component.ts
│   │   └── stat-card.component.ts
│   └── pipes/
│       └── duration.pipe.ts
└── features/
    ├── dashboard/
    │   ├── dashboard.component.ts
    │   ├── dashboard.routes.ts
    │   └── dashboard.service.ts
    ├── workout-log/
    │   ├── workout-log.component.ts
    │   ├── workout-form.component.ts
    │   ├── workout-log.routes.ts
    │   └── workout.service.ts
    ├── nutrition/
    │   ├── meal-list.component.ts
    │   ├── nutrition.routes.ts
    │   └── nutrition.service.ts
    └── settings/
        ├── settings.component.ts
        └── settings.routes.ts
```

---

### Example B: Hospital management system

```
libs/
├── patients/
│   ├── feature-registration/
│   ├── feature-medical-history/
│   ├── ui/
│   │   └── patient-card/
│   ├── data-access/
│   │   ├── patient.store.ts
│   │   └── patient-api.service.ts
│   ├── domain/
│   │   ├── patient.model.ts
│   │   └── insurance-rules.ts
│   └── index.ts
├── scheduling/
│   ├── feature-book-appointment/
│   ├── feature-doctor-calendar/
│   ├── ui/
│   ├── data-access/
│   ├── domain/
│   └── index.ts
├── billing/
│   ├── feature-invoices/
│   ├── data-access/
│   ├── domain/
│   └── index.ts
└── shared/
    ├── ui/
    └── util/
apps/
├── staff-portal/
└── patient-portal/
```

---

### Example C: School learning platform

```
src/app/
├── components/
│   ├── course-list.component.ts
│   ├── course-detail.component.ts
│   ├── quiz.component.ts
│   ├── grade-table.component.ts
│   └── student-profile.component.ts
├── services/
│   ├── course.service.ts
│   ├── quiz.service.ts
│   ├── grade.service.ts
│   └── student.service.ts
├── models/
│   ├── course.model.ts
│   ├── quiz.model.ts
│   └── student.model.ts
├── pipes/
│   └── letter-grade.pipe.ts
└── guards/
    └── teacher.guard.ts
```

---

### Example D: Banking app (harder)

```
src/app/
├── core/
├── shared/
└── features/
    ├── accounts/
    │   ├── account-overview/
    │   │   ├── account-overview.component.ts
    │   │   └── account-overview.routes.ts
    │   ├── statements/
    │   ├── data-access/
    │   │   └── accounts-api.service.ts
    │   └── index.ts
    ├── payments/
    │   ├── transfer/
    │   ├── pay-bills/
    │   ├── data-access/
    │   │   └── payments-api.service.ts
    │   └── index.ts
    └── cards/
        ├── card-list/
        ├── freeze-card/
        └── index.ts
.eslintrc.json   ← contains a boundaries rule:
                   "features/payments may only import from
                    features/accounts/index.ts"
```

---

## Answer key

**A: Feature-based.** Each folder under `features/` is a screen or route (dashboard, workout log, settings). Each feature holds its own component, routes and service in a flat layout. There are no layers inside features and no business-domain grouping. `core/` and `shared/` are the usual companions. *Possible discussion question:* where would you put workout logic that the dashboard also needs? (Probably `shared/`, which shows the "dumping ground" risk.)

**B: Domain-based.** The top-level folders are business areas (patients, scheduling, billing), not screens. Each domain has several `feature-*` libraries and consistent layers (`ui`, `data-access`, `domain`). The `index.ts` files act as public APIs. Two apps share the same domain libraries, a typical sign of an Nx monorepo. Business rules such as `insurance-rules.ts` sit in a `domain` layer apart from the UI.

**C: Neither. It's type-based (organized by technical layer).** All components sit together, all services sit together, and so on. Code is grouped by *what kind of file it is*, not by feature or domain. Students often mistake this for one of the two. It's the structure both architectures are designed to replace, because working on the quiz feature means touching four different folders.

**D: A hybrid, leaning domain-based.** It sits in `features/`, but the folders under it are business domains (accounts, payments, cards), and each one holds several user features. Some domains have their own `data-access` layer and an `index.ts` public API. A lint rule enforces boundaries between domains. This is the "middle path" from earlier: a feature-based app growing toward domain-based structure. *Grading tip:* accept either answer if the student points out the domain grouping, the public APIs and the boundary rule.