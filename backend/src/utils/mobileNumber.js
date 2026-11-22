// Turn "0917 123-4567" or "+63 917 123 4567" into "+639171234567".
// Returns null if it is not a Philippine mobile number.
// Shared by register and login validation, so both accept exactly the same formats.
function normalizeMobileNumber(value) {
  const compact = value.replace(/[\s-]/g, '');
  if (/^09\d{9}$/.test(compact)) return '+63' + compact.slice(1);
  if (/^\+639\d{9}$/.test(compact)) return compact;
  return null;
}

module.exports = { normalizeMobileNumber };
