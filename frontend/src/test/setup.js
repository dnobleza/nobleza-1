// Runs before every test file.
// jest-dom adds readable checks such as toBeInTheDocument().
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Remove what the last test drew, so tests don't see each other's elements.
afterEach(() => {
  cleanup();
});
