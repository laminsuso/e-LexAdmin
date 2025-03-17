import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// ✅ Ensure `window` exists
global.window = global;

// ✅ Mock `localStorage`
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
