# Group Activity: Design a Feature-Based Angular Folder Structure

## Activity overview

Each group gets one application brief and designs its Angular folder structure using feature-based architecture. Groups then present and defend their structure to the class.

| Item | Details |
| --- | --- |
| Group size | 3–5 students |
| Time | 25 min design, 5 min per group presentation, 10 min class discussion |
| Materials | Whiteboard, large paper or a shared text editor |
| Assignment | One brief per group (Apps 1–6 below); two groups can take the same app and compare results |

**Each group hands in:**

1. A complete folder tree, down to file names for at least two features.
2. A short list of what goes in `core/` and `shared/`, with one sentence each on why it belongs there.
3. One design decision the group argued about, and how they settled it.
4. Answers to the app's challenge question.

## Rules for your structure

Your structure must follow these feature-based conventions:

- **One folder per user-facing feature** under `features/`. A feature is usually one screen or route, or a closely related group of them.
- **Everything a feature needs lives inside its folder:** components, its routes file, services used only by that feature, and its models.
- **`core/`** holds app-wide singletons that load once: auth, HTTP interceptors, guards, the layout shell and global error handling.
- **`shared/`** holds reusable, feature-agnostic pieces: UI components, pipes, directives and helpers that two or more features use. Nothing in `shared/` should know about a specific feature.
- **Each feature is lazy-loaded** through its own `*.routes.ts` file.
- **Features don't import from inside other features.** If two features need the same thing, decide whether it belongs in `shared/` or `core/`.

Starter skeleton:

```
src/app/
├── core/
├── shared/
├── features/
│   └── <feature-name>/
│       ├── <feature-name>.component.ts
│       ├── <feature-name>.routes.ts
│       └── <feature-name>.service.ts
├── app.component.ts
└── app.routes.ts
```
> [!Note]
> You do not need to create the component, routes, and services files. Just create the folder for the features.


## Application briefs

Each brief lists what the app must do. Turn these requirements into features, and decide what goes in `core/` and `shared/`.

### App 1: QuickBite (food delivery)

Customers order food from local restaurants and track their delivery.

- Sign up and log in; only logged-in users can order.
- Browse restaurants, filter by cuisine, and search by name.
- View a restaurant's menu and add dishes to a cart.
- Check out with a saved address and payment method.
- Track an active order on a live status screen (preparing, on the way, delivered).
- View past orders and reorder with one click.
- Leave a star rating and review for a restaurant.
- A price display (e.g. $12.50) and a star-rating widget appear on many screens.

**Challenge question:** The cart icon with an item count shows in the header on every page. Where does the cart's state live, and why?

### App 2: PageTurn (public library)

Library members find and borrow books; librarians manage the catalog.

- Members log in with their library card number.
- Search the catalog by title, author or ISBN, and view a book's details and availability.
- Place a hold on a book that is checked out.
- "My account" shows current loans, due dates, holds and late fees.
- Renew a loan up to two times.
- Librarians (a separate role) add, edit and remove books.
- Librarians see a report of overdue books.
- Date formatting ("Due in 3 days") is used across several screens.

**Challenge question:** Librarian screens must be hidden from regular members. Is the librarian area one feature or several, and where does the role check go?

### App 3: StageDoor (concert ticketing)

Fans buy tickets for concerts and manage them on their phone.

- Home page with featured and upcoming concerts.
- Search concerts by artist, city or date.
- Concert details page with venue, lineup and price tiers.
- Pick seats on an interactive seat map.
- Checkout with a 10-minute countdown timer that holds the seats.
- "My tickets" shows purchased tickets with a QR code for entry.
- Transfer a ticket to a friend by email.
- Follow favorite artists and get notified about new shows.

**Challenge question:** The countdown timer appears on the seat map and the checkout page. Is it part of one feature, or does it go in `shared/`?

### App 4: TaskFlow (team task board)

Small teams plan work on Kanban boards.

- Log in and belong to one or more teams.
- A team has several boards; each board has columns (To do, Doing, Done).
- Create, edit and drag task cards between columns.
- Task detail panel with description, assignee, due date, comments and attachments.
- "My tasks" lists every task assigned to me across all boards.
- Team settings: invite members, change roles, rename the team.
- Notifications when someone assigns you a task or comments.
- User avatars appear on cards, comments, settings and notifications.

**Challenge question:** The task detail panel opens from both a board and "My tasks". Which feature owns it?

### App 5: Wanderly (travel booking)

Travelers search for and book flights and hotels.

- Search flights by origin, destination, dates and number of passengers.
- Search hotels by city and dates, with filters for price and rating.
- Compare results and view flight or hotel details.
- Book a flight, a hotel, or both together as a "trip".
- Trips page shows upcoming and past trips with booking references.
- Cancel a booking within the allowed window.
- User profile with saved passport details and preferences.
- Prices show in the user's chosen currency everywhere.

**Challenge question:** Flights and hotels have similar search forms and result lists. Do you make one "search" feature or two separate features?

### App 6: PawMatch (pet adoption)

Animal shelters list pets, and families apply to adopt them.

- Browse adoptable pets with filters for species, age, size and location.
- Pet profile page with photos, personality notes and shelter contact.
- Save favorite pets to a shortlist.
- Fill in a multi-step adoption application (household, experience, references).
- Applicants track the status of their applications.
- Shelter staff (a separate role) add pets, update their status and review applications.
- Message thread between an applicant and the shelter about an application.
- A photo gallery component is used on pet profiles and in the shelter's "add pet" form.

**Challenge question:** The adoption application is long and multi-step. How do you organize the step components inside the feature folder?

## Presentation and peer review

Each group gets 5 minutes. They walk the class through the folder tree, explain their `core/` and `shared/` choices, and answer their challenge question.

The audience then asks questions like these:

- If you added a new feature tomorrow (for example, a chat screen), where would it go? Would you have to change any existing folder?
- Is anything in `shared/` used by only one feature? If so, should it move into that feature?
- Does any feature import directly from inside another feature?
- Which feature would get the biggest as the app grows? How would you split it?
- If two teams worked on this app, how would you divide the features between them?

**Class discussion (10 min):** Compare groups that had the same app. Where did they draw feature lines differently, and which version would be easier to maintain in a year?

---

## Facilitator guide

The trees below are one reasonable answer per app, not the only correct one. Give credit for any structure that follows the rules and that the group can justify. Remove this section before handing the activity to students.

### App 1: QuickBite

```
src/app/
├── core/            auth.service, auth.guard, auth.interceptor, layout/header
├── shared/          price.pipe, star-rating.component, search-box.component
└── features/
    ├── auth/            login, signup
    ├── restaurants/     restaurant-list, restaurant-filters, restaurant.service
    ├── menu/            menu, dish-card
    ├── cart/            cart.component, cart.store
    ├── checkout/        checkout, address-picker, payment-picker
    ├── order-tracking/  order-status, order-tracking.service
    ├── order-history/   order-list, reorder
    └── reviews/         review-form
```

**Challenge answer:** The cart state is app-wide and the header reads it, so `cart.store` (or `cart.service`) is often placed in `core/`. Keeping it in `features/cart/` and exposing it through a public `index.ts` is also acceptable. Either way, the header should not import from deep inside the cart feature.

### App 2: PageTurn

```
src/app/
├── core/            auth.service, auth.guard, role.guard, layout/
├── shared/          due-date.pipe, book-cover.component
└── features/
    ├── login/
    ├── catalog/         catalog-search, book-detail, catalog.service
    ├── holds/           place-hold
    ├── my-account/      loans, holds-list, fees, renew-loan
    └── librarian/
        ├── manage-books/    book-form, book-admin.service
        ├── overdue-report/
        └── librarian.routes.ts   (protected by role.guard)
```

**Challenge answer:** One `librarian/` feature with sub-features works well, because it gives a single lazy route to protect. The role check is a guard in `core/`, applied in `librarian.routes.ts`.

### App 3: StageDoor

```
src/app/
├── core/            auth, notification.service, layout/
├── shared/          countdown-timer.component, concert-card.component, qr-code.component
└── features/
    ├── home/
    ├── concert-search/
    ├── concert-detail/
    ├── seat-selection/  seat-map, seat-hold.service
    ├── checkout/
    ├── my-tickets/      ticket-list, ticket-detail, transfer-ticket
    └── artists/         artist-page, follow-artist
```

**Challenge answer:** The timer's display component is generic, so it goes in `shared/`. The logic that holds the seats (`seat-hold.service`) is business logic and stays in a feature. Strong groups notice that seat selection and checkout could be one `booking/` feature, which avoids sharing state between two features.

### App 4: TaskFlow

```
src/app/
├── core/            auth, current-team.service, notification.service, layout/
├── shared/          avatar.component, date-picker.component, file-upload.component
└── features/
    ├── boards/          board-list, board-view, column, task-card
    ├── task-detail/     task-detail-panel, comments, attachments, task.service
    ├── my-tasks/
    ├── team-settings/   members, invite-member, rename-team
    └── notifications/   notification-list
```

**Challenge answer:** Making `task-detail/` its own feature, opened as a route or outlet from both places, avoids `my-tasks` importing from `boards`. Putting the panel in `boards/` and exporting it publicly is acceptable if the group explains the dependency.

### App 5: Wanderly

```
src/app/
├── core/            auth, currency.service, layout/
├── shared/          currency.pipe, date-range-picker, passenger-picker, results-list-layout
└── features/
    ├── flights/         flight-search, flight-results, flight-detail, flight.service
    ├── hotels/          hotel-search, hotel-results, hotel-detail, hotel.service
    ├── booking/         booking-summary, booking.service
    ├── trips/           trip-list, trip-detail, cancel-booking
    └── profile/         passport-details, preferences
```

**Challenge answer:** Two features is usually better: flights and hotels have different filters, data and rules. The parts that really are generic (date picker, results layout) go in `shared/`. A single "search" feature tends to fill up with if/else branches.

### App 6: PawMatch

```
src/app/
├── core/            auth, role.guard, layout/
├── shared/          photo-gallery.component, stepper.component, message-thread.component
└── features/
    ├── pet-browse/      pet-list, pet-filters
    ├── pet-profile/
    ├── shortlist/
    ├── adoption-application/
    │   ├── steps/
    │   │   ├── household-step.component.ts
    │   │   ├── experience-step.component.ts
    │   │   └── references-step.component.ts
    │   ├── application-form.component.ts
    │   ├── application.service.ts
    │   └── adoption-application.routes.ts
    ├── my-applications/ application-status, application-messages
    └── shelter/         manage-pets, review-applications
```

**Challenge answer:** A `steps/` subfolder keeps the feature tidy, with the parent form component coordinating the steps. Each step can be a child route, so users can go back without losing data.

### Rubric

| Criterion | Strong (3) | Developing (2) | Needs work (1) |
| --- | --- | --- | --- |
| Feature boundaries | Every requirement maps to a clear feature; folder names match user-facing screens | Most features are clear; one or two are too broad or too narrow | Folders are by file type, or features are mixed together |
| `core/` vs `shared/` | Singletons in `core/`, reusable UI in `shared/`, every choice justified | Mostly correct, with one or two misplaced items | No clear difference between the two |
| Feature independence | No cross-feature imports; shared needs handled deliberately | One cross-feature dependency, acknowledged | Several features depend on each other's internals |
| Lazy loading | Each feature has its own routes file | Some features have routes files | No routing considered |
| Challenge question | Clear answer with trade-offs explained | Answer given without trade-offs | Not answered |
| Presentation | Clear, confident defense of decisions | Explains the structure but struggles with questions | Hard to follow |
