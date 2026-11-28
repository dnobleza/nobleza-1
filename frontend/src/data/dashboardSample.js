// SAMPLE DATA ONLY. Delete this file once the real endpoints exist.
// Each export has the shape of one backend answer (dashboard-design.md §5).

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Dates are counted back from today, so "2 days ago" stays true.
function daysAgo(days) {
  return new Date(Date.now() - days * DAY_IN_MS).toISOString();
}

const DESIGN_NOTE =
  "Design mockups are ready for your feedback. We'll start building the booking flow next week.";

// GET /api/v1/dashboard/summary
export const sampleSummary = {
  counts: {
    submitted: 0,
    in_review: 1,
    quoted: 0,
    in_progress: 1,
    completed: 3,
    cancelled: 1,
    declined: 0,
  },
  active: 2,
  total: 6,
  recentUpdates: [
    {
      id: 'update-1',
      requestId: 'request-1',
      requestTitle: 'Booking app',
      fromStatus: 'quoted',
      toStatus: 'in_progress',
      note: DESIGN_NOTE,
      createdAt: daysAgo(2),
    },
    {
      id: 'update-2',
      requestId: 'request-2',
      requestTitle: 'Bakery website',
      fromStatus: 'submitted',
      toStatus: 'in_review',
      note: null,
      createdAt: daysAgo(3),
    },
    {
      id: 'update-3',
      requestId: 'request-3',
      requestTitle: 'Inventory automation',
      fromStatus: 'in_progress',
      toStatus: 'completed',
      note: null,
      createdAt: daysAgo(8),
    },
    {
      id: 'update-4',
      requestId: 'request-4',
      requestTitle: 'Logo refresh',
      fromStatus: 'in_review',
      toStatus: 'cancelled',
      note: null,
      createdAt: daysAgo(35),
    },
  ],
};

// GET /api/v1/requests/:id (the featured project)
export const sampleFeaturedRequest = {
  request: {
    id: 'request-1',
    title: 'Booking app',
    projectType: 'web_app',
    description: 'Online booking for our customers.',
    budgetRange: '100k_250k',
    targetDate: null,
    status: 'in_progress',
    createdAt: daysAgo(16),
    updatedAt: daysAgo(2),
    history: [
      {
        id: 'history-1',
        fromStatus: null,
        toStatus: 'submitted',
        note: null,
        createdAt: daysAgo(16),
      },
      {
        id: 'history-2',
        fromStatus: 'submitted',
        toStatus: 'in_review',
        note: null,
        createdAt: daysAgo(15),
      },
      {
        id: 'history-3',
        fromStatus: 'in_review',
        toStatus: 'quoted',
        note: null,
        createdAt: daysAgo(13),
      },
      {
        id: 'history-4',
        fromStatus: 'quoted',
        toStatus: 'in_progress',
        note: DESIGN_NOTE,
        createdAt: daysAgo(2),
      },
    ],
  },
};

// GET /api/v1/requests?limit=5 (newest update first)
// "lastStep" is a proposed field: the list has no history, and cancelled rows
// need it for "Stopped at step X".
export const sampleRequests = {
  requests: [
    {
      id: 'request-1',
      title: 'Booking app',
      projectType: 'web_app',
      budgetRange: '100k_250k',
      targetDate: null,
      status: 'in_progress',
      createdAt: daysAgo(16),
      updatedAt: daysAgo(2),
      lastStep: 4,
    },
    {
      id: 'request-2',
      title: 'Bakery website',
      projectType: 'website',
      budgetRange: 'below_50k',
      targetDate: null,
      status: 'in_review',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(3),
      lastStep: 2,
    },
    {
      id: 'request-3',
      title: 'Inventory automation',
      projectType: 'automation',
      budgetRange: '50k_100k',
      targetDate: null,
      status: 'completed',
      createdAt: daysAgo(60),
      updatedAt: daysAgo(8),
      lastStep: 5,
    },
    {
      id: 'request-4',
      title: 'Logo refresh',
      projectType: 'ui_ux',
      budgetRange: 'not_sure',
      targetDate: null,
      status: 'cancelled',
      createdAt: daysAgo(50),
      updatedAt: daysAgo(35),
      lastStep: 2,
    },
  ],
  page: 1,
  total: 6,
};

export const sampleHasUnread = true;
