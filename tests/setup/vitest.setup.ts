import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

const routerMock = {
  replace: vi.fn(),
  push: vi.fn(),
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  routerMock.replace.mockReset();
  routerMock.push.mockReset();
});

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));
