## Feature-based architecture vs Domain-based architecture

## Feature-based architecture

You organize code around **user-facing features**. Each feature folder holds everything that feature needs: components, services, routes, models and state. In modern Angular it's usually a lazy-loaded route with standalone components.

```
src/app/
├── core/              # singletons: auth, interceptors, layout shell
├── shared/            # reusable UI: buttons, pipes
└── features/
    ├── product-list/
    │   ├── product-list.component.ts
    │   ├── product-list.routes.ts
    │   └── product.service.ts
    ├── cart/
    ├── checkout/
    └── user-profile/
```

## Domain-based architecture

You organize code around **business domains** (bounded contexts, in Domain-Driven Design terms) such as Catalog, Ordering, Billing or Identity. One domain can include several features. Inside each domain, code is usually split into **layers with strict dependency rules**.

```
libs/
├── catalog/
│   ├── feature-search/      # smart components, routes
│   ├── feature-detail/
│   ├── ui/                  # dumb, presentational components
│   ├── data-access/         # services, state, API calls
│   ├── domain/              # models, business rules
│   └── util/
├── ordering/
│   ├── feature-cart/
│   ├── feature-checkout/
│   ├── ui/
│   └── data-access/
└── shared/
    ├── ui/
    └── util/
```


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