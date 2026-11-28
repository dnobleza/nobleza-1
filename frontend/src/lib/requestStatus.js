// Shared facts about project requests. The values on the left are what the
// backend stores; the text on the right is what people read.

// The five stepper steps, in order. Cancelled and declined are NOT steps.
export const STEPS = [
  'submitted',
  'in_review',
  'quoted',
  'in_progress',
  'completed',
];

export const STATUS_LABELS = {
  submitted: 'Submitted',
  in_review: 'In review',
  quoted: 'Quoted',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
};

export const PROJECT_TYPE_LABELS = {
  website: 'Website',
  web_app: 'Web app',
  mobile_app: 'Mobile app',
  automation: 'Automation',
  ui_ux: 'UI/UX design',
  maintenance: 'Maintenance',
  other: 'Other',
};

// 'submitted' -> 1 ... 'completed' -> 5. Anything else -> 0.
// indexOf returns -1 when the value is not in the list, and -1 + 1 = 0.
export function getStepNumber(status) {
  return STEPS.indexOf(status) + 1;
}
