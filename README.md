# Introduction

A mini customer support ticket management system built with Next.js 15, Prisma ORM, SQLite, and Tailwind CSS. The Customer is able to add the issue and the support team can view the issue along with the customer details and can update the status.

---

# Tech Used

FrontEnd: Next.js FrameWork using Typescript along with Tailwind and React.

Backend: Next.js API routes , Prisma ORM

Database: SQLite

Validation: Zod

Testing: Jest , Supertest

---

## Project Structure

- supportdesk_app/
- supportdesk_app/prisma/schema.prisma   #prisma Schema
supportdesk_app/src/app/layout.tsx     # Root layout 
supportdesk_app/src/app/page.tsx       # Main dashboard page
supportdesk_app/src/app/globals.css    #Tailwind 

supportdesk_app/src/app/api/ticket/route.ts  #GET and POST for Tickets
supportdesk_app/src/app/api/ticket/[id]/route.ts  #GET the ticket by id used for filtering
supportdesk_app/src/app/api/Dashboard/route.ts    #GET for the couting the database to show stats

supportdesk_app/src/components/DashboardStats.tsx  #stats that will on Dashboard
supportdesk_app/src/components/CreateTicketForm.tsx # Ticket creation form
supportdesk_app/src/components/TicketGrid.tsx      # Table with search, filters, pagination
supportdesk_app/src/components/TicketDrawer.tsx    # Slide-in detail panel with status editor
supportdesk_app/src/components/Badges.tsx      # PriorityBadge + StatusPill components 

supportdesk_app/src/lib/type.ts                # Shared TypeScript interfaces

supportdesk_app/src/lib/prisma.ts              # Prisma connection database

supportdesk_app/src/lib/validation.ts         # Zod schemas + computeIsUrgent

supportdesk_app/tests/api.test.js             # Node.js integration test suite

---


## Features

- Create support tickets
- Input validation
- Ticket listing
- Search tickets
- Filter by status
- Filter by priority
- Sorted by creation date
- Ticket details page
- Update ticket status
- Automatic urgent ticket detection
- Dashboard statistics
- Responsive interface
- Error handling

---


## Installation & Setup

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Set up the database

Push the Prisma schema to create the SQLite file:

```bash
npx prisma db push
```

This creates `prisma/dev.db` and generates the Prisma client.

### Step 3 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4 — (Optional) Open Prisma Studio

A visual browser for your SQLite database:

```bash
npm run db:studio
```

---

## Running Tests

The test suite is a Node.js script that fires real HTTP requests against the local dev server. **The server must be running before executing tests.**

```bash
# Terminal 1 — start the server
npm run dev

# Terminal 2 — run all tests
npm test
```

The test suite covers five suites:

1. **Input validation** — short descriptions, bad emails, missing fields, invalid priority values all return `400`.
2. **Urgency logic** — `HIGH` priority tickets and descriptions containing "urgent" are flagged `isUrgent: true`; normal `MEDIUM` tickets are not.
3. **Status mutations** — invalid status values are rejected with `400`; valid updates return `200` with a refreshed `updatedAt` timestamp; non-existent ticket IDs return `404`.
4. **Dashboard stats** — the `/api/dashboard` endpoint returns all five aggregate counters as numbers.
5. **Pagination** — the paginated list endpoint respects `pageSize` and returns a well-formed `pagination` object.

---

## Validation Rules

Customer Name
- Required
-  min 10 chars

Customer Email
- Required
- Must be valid email format

Subject
- Required

Description
- Minimum 10 characters

Priority
- Low
- Medium
- High

Status
- Open
- In Progress
- Resolved

---


## Duplicate Email Decision

**Decision**:
Allow multiple tickets from the same email.

Reason:

A customer may have multiple independent issues.
Blocking duplicate emails could prevent legitimate support requests.

Advantages

- Customers can report multiple problems
- Realistic support workflow
- Better customer experience

**Our approach:** Duplicate emails are fully permitted. Instead, when a support agent opens a ticket's detail drawer, the system queries for all other tickets filed by the same email address and displays a **"Past Tickets Counter"** (e.g. "This customer has 3 other tickets on file"). This gives agents instant context about a customer's history without preventing new tickets from being created.

Disadvantages
- Duplicate tickets may exist

Future Improvement
Group tickets by customer profile and show previous ticket history.

---

## Urgent Ticket Detection

A ticket is automatically marked as urgent if:
- Priority is High
OR
- Description contains the word "urgent"
The comparison is case-insensitive.

This logic is implemented in the backend.

---

## Initiative Feature: 

# Client-Server Pagination

The ticket list supports full server-side pagination via query parameters:

```
GET /api/tickets?page=2&pageSize=10&search=login&priority=HIGH&status=OPEN
```

**How it works:**
- The API uses Prisma's `skip`/`take` to fetch only the requested window of records.
- The response includes a `pagination` object: `{ page, pageSize, total, totalPages }`.
- The frontend `TicketGrid` component tracks `page` state and renders Previous/Next controls, along with a "Showing X–Y of Z tickets" summary.
- Filters (search text, priority, status) reset the page counter to 1 automatically.

**Why this matters at scale:** Without pagination, fetching all tickets in a single query becomes a bottleneck as volume grows — both in database query time and network payload size. Server-side pagination keeps each response bounded regardless of total ticket count, enabling smooth operation at thousands of records. The debounced search input (300ms delay) prevents excessive API calls while the agent types.



# Customer Ticket History**

I added the ability to view all previous tickets created by the same customer by searching.

Why

Support agents can quickly understand previous issues.

Problem Solved

- Faster support
- Better customer context

Future Improvements

- Customer profile page
- Ticket timeline


---

## API Endpoints

POST    /api/tickets
Create ticket

GET     /api/tickets
Get all tickets

GET     /api/tickets/:id
Get ticket details

PATCH   /api/tickets/:id
Update ticket

PATCH   /api/tickets/:id/status
Update status

GET     /api/dashboard
Dashboard statistics

---

## Assumptions

- Ticket IDs are auto-generated.
- Every ticket belongs to one customer.
- Authentication is not added.
- Only support staff can update ticket status.

---

## Error Handling

The backend validates all incoming requests.

Errors return appropriate HTTP status codes.

Examples

400 Bad Request

404 Not Found

500 Internal Server Error

----


## Known Limitations & Future Roadmap

## Known Limitations

- No authentication
- SQLite not suitable for production
- No email notifications
- No file attachments
- auditing every action

## Future Work

- Authentication
- Role-based permissions
- File attachments
- Email notifications
- Ticket assignment
- Comments
- Activity logs
- Docker support


# Declaration:
I confirm that I completed this challenge without using generative AI, an AI coding assistant,
or an AI-enabled editor. I understand the submitted code and can explain and modify it.


# ScreenShot is in here
C:\Users\DELL\Desktop\supportdesk_app\public\image.png