#!/usr/bin/env node
// tests/api.test.js
// Run with: node tests/api.test.js
// Requires the Next.js dev server to be running on http://localhost:3000

const BASE = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function patch(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, data: await res.json() };
}

// ─── SUITE 1: Input Validation ──────────────────────────────────────────────
async function testValidation() {
  console.log("\n[Suite 1] Input Validation");

  // Description too short
  const r1 = await post("/api/tickets", {
    customerName: "Alice",
    customerEmail: "alice@example.com",
    subject: "Test",
    description: "short",
    priority: "LOW",
  });
  assert("Short description returns 400", r1.status === 400);
  assert(
    "Error body contains description field error",
    Array.isArray(r1.data?.details?.description)
  );

  // Bad email
  const r2 = await post("/api/tickets", {
    customerName: "Alice",
    customerEmail: "not-an-email",
    subject: "Test subject",
    description: "This is a long enough description.",
    priority: "MEDIUM",
  });
  assert("Invalid email returns 400", r2.status === 400);
  assert(
    "Error body contains email field error",
    Array.isArray(r2.data?.details?.customerEmail)
  );

  // Missing required customerName
  const r3 = await post("/api/tickets", {
    customerName: "",
    customerEmail: "alice@example.com",
    subject: "Test subject",
    description: "This is a long enough description.",
    priority: "MEDIUM",
  });
  assert("Empty customer name returns 400", r3.status === 400);

  // Invalid priority value
  const r4 = await post("/api/tickets", {
    customerName: "Alice",
    customerEmail: "alice@example.com",
    subject: "Test subject",
    description: "This is a long enough description.",
    priority: "CRITICAL",
  });
  assert("Invalid priority returns 400", r4.status === 400);
}

// ─── SUITE 2: Urgency Logic ──────────────────────────────────────────────────
async function testUrgencyLogic() {
  console.log("\n[Suite 2] Urgency Logic");

  // HIGH priority → isUrgent = true
  const r1 = await post("/api/tickets", {
    customerName: "Bob High",
    customerEmail: "bob@example.com",
    subject: "High priority test",
    description: "This is a standard high priority ticket with no keywords.",
    priority: "HIGH",
  });
  assert("HIGH priority ticket is created (201)", r1.status === 201);
  assert(
    "HIGH priority ticket has isUrgent = true",
    r1.data?.isUrgent === true,
    `got isUrgent=${r1.data?.isUrgent}`
  );

  // LOW priority + "urgent" in description → isUrgent = true
  const r2 = await post("/api/tickets", {
    customerName: "Carol Urgent",
    customerEmail: "carol@example.com",
    subject: "Low priority with urgent keyword",
    description:
      "This seems urgent to me, please help as soon as possible here.",
    priority: "LOW",
  });
  assert(
    'LOW priority ticket with "urgent" keyword is created (201)',
    r2.status === 201
  );
  assert(
    'LOW priority + "urgent" word → isUrgent = true',
    r2.data?.isUrgent === true,
    `got isUrgent=${r2.data?.isUrgent}`
  );

  // MEDIUM priority, no urgent keyword → isUrgent = false
  const r3 = await post("/api/tickets", {
    customerName: "Dave Normal",
    customerEmail: "dave@example.com",
    subject: "Normal medium ticket",
    description: "Everything is fine, no rush on this one at all.",
    priority: "MEDIUM",
  });
  assert("MEDIUM priority normal ticket is created (201)", r3.status === 201);
  assert(
    "MEDIUM priority normal ticket has isUrgent = false",
    r3.data?.isUrgent === false,
    `got isUrgent=${r3.data?.isUrgent}`
  );
}

// ─── SUITE 3: Status State Mutations ─────────────────────────────────────────
async function testStatusMutations() {
  console.log("\n[Suite 3] Status State Mutations");

  // Create a baseline ticket
  const create = await post("/api/tickets", {
    customerName: "Eve Status",
    customerEmail: "eve@example.com",
    subject: "Status mutation test ticket",
    description: "This ticket will be used to test status updates properly.",
    priority: "LOW",
  });
  assert("Test ticket created for mutation tests", create.status === 201);

  const ticketId = create.data?.id;
  if (!ticketId) {
    console.error("  ! Could not get ticket ID, skipping mutation tests.");
    failed += 3;
    return;
  }

  // Invalid status → 400
  const r1 = await patch(`/api/tickets/${ticketId}`, { status: "CLOSED" });
  assert(
    "Invalid status value returns 400",
    r1.status === 400,
    `got status=${r1.status}`
  );

  // Valid status update → 200
  const r2 = await patch(`/api/tickets/${ticketId}`, {
    status: "IN_PROGRESS",
  });
  assert(
    "Valid status update returns 200",
    r2.status === 200,
    `got status=${r2.status}`
  );
  assert(
    "Updated ticket status is IN_PROGRESS",
    r2.data?.status === "IN_PROGRESS",
    `got status=${r2.data?.status}`
  );

  // Verify updatedAt changed
  const originalUpdatedAt = create.data?.updatedAt;
  assert(
    "updatedAt timestamp is refreshed on status update",
    r2.data?.updatedAt !== originalUpdatedAt,
    `original=${originalUpdatedAt}, new=${r2.data?.updatedAt}`
  );

  // Update to RESOLVED
  const r3 = await patch(`/api/tickets/${ticketId}`, { status: "RESOLVED" });
  assert(
    "Status can be updated to RESOLVED",
    r3.data?.status === "RESOLVED",
    `got status=${r3.data?.status}`
  );

  // PATCH non-existent ticket → 404
  const r4 = await patch("/api/tickets/00000000-0000-0000-0000-000000000000", {
    status: "OPEN",
  });
  assert(
    "PATCH non-existent ticket returns 404",
    r4.status === 404,
    `got status=${r4.status}`
  );
}

// ─── SUITE 4: Dashboard Stats ─────────────────────────────────────────────────
async function testDashboard() {
  console.log("\n[Suite 4] Dashboard Stats");

  const r = await get("/api/dashboard");
  assert("Dashboard returns 200", r.status === 200);
  assert(
    "Dashboard has totalTickets",
    typeof r.data?.totalTickets === "number"
  );
  assert("Dashboard has openCount", typeof r.data?.openCount === "number");
  assert(
    "Dashboard has inProgressCount",
    typeof r.data?.inProgressCount === "number"
  );
  assert(
    "Dashboard has resolvedCount",
    typeof r.data?.resolvedCount === "number"
  );
  assert("Dashboard has urgentCount", typeof r.data?.urgentCount === "number");
}

// ─── SUITE 5: Pagination ──────────────────────────────────────────────────────
async function testPagination() {
  console.log("\n[Suite 5] Pagination");

  const r = await get("/api/tickets?page=1&pageSize=5");
  assert("Paginated list returns 200", r.status === 200);
  assert(
    "Pagination object is present",
    typeof r.data?.pagination === "object"
  );
  assert(
    "Pagination pageSize is respected",
    r.data?.tickets?.length <= 5,
    `got ${r.data?.tickets?.length} tickets`
  );
  assert(
    "Pagination has totalPages",
    typeof r.data?.pagination?.totalPages === "number"
  );
}

// ─── RUNNER ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("SupportDesk API Test Suite");
  console.log("==========================");
  console.log(`Target: ${BASE}`);

  try {
    // Quick health check
    const health = await get("/api/dashboard");
    if (health.status !== 200) {
      console.error(
        "\n⚠  Server does not appear to be running or database is not ready."
      );
      console.error(
        "   Run: npx prisma db push && npm run dev  — then re-run this script.\n"
      );
      process.exit(1);
    }
  } catch {
    console.error(
      "\n⚠  Cannot connect to server at",
      BASE,
      "— is it running?\n"
    );
    process.exit(1);
  }

  await testValidation();
  await testUrgencyLogic();
  await testStatusMutations();
  await testDashboard();
  await testPagination();

  console.log("\n──────────────────────────");
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("All tests passed! 🎉");
    process.exit(0);
  }
}

main();
