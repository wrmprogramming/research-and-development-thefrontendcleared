// src/test/setup.ts

import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './msw/server';

// ============================================================
// MSW Setup
// ============================================================
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================================
// Mock: window.matchMedia
// ============================================================
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ============================================================
// Mock: window.scrollTo
// ============================================================
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// ============================================================
// Mock: URL APIs
// ============================================================
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock');
}
if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = vi.fn();
}

// ============================================================
// Mock: Element.scrollIntoView (jsdom پشتیبانی نمی‌کنه)
// ============================================================
Element.prototype.scrollIntoView = vi.fn();

// // src/test/setup.ts

// import '@testing-library/jest-dom/vitest';
// import { afterAll, afterEach, beforeAll, vi } from 'vitest';
// import { server } from './msw/server';

// // ============================================================
// // MSW Setup
// // ============================================================
// beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// // ============================================================
// // Mock: window.matchMedia
// // ============================================================
// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: vi.fn().mockImplementation((query) => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: vi.fn(),
//     removeListener: vi.fn(),
//     addEventListener: vi.fn(),
//     removeEventListener: vi.fn(),
//     dispatchEvent: vi.fn(),
//   })),
// });

// // ============================================================
// // Mock: window.scrollTo
// // ============================================================
// Object.defineProperty(window, 'scrollTo', {
//   writable: true,
//   value: vi.fn(),
// });

// // ============================================================
// // Mock: URL APIs
// // ============================================================
// if (!window.URL.createObjectURL) {
//   window.URL.createObjectURL = vi.fn(() => 'blob:mock');
// }
// if (!window.URL.revokeObjectURL) {
//   window.URL.revokeObjectURL = vi.fn();
// }