import { StrictMode } from "react";
import { render, waitFor } from "@testing-library/react";

import { PageViewBeacon } from "@/components/site/PageViewBeacon";

describe("PageViewBeacon", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("sends one page view when React reruns effects in StrictMode", async () => {
    const sendBeacon = jest.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: sendBeacon,
    });

    render(
      <StrictMode>
        <PageViewBeacon page="/no/kontakt" />
      </StrictMode>,
    );

    await waitFor(() => expect(sendBeacon).toHaveBeenCalledTimes(1));
    expect(sendBeacon.mock.calls[0][0]).toBe("/api/analytics/page-view");
  });

  it("sends another page view when the tracked page changes", async () => {
    const sendBeacon = jest.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: sendBeacon,
    });

    const { rerender } = render(<PageViewBeacon page="/no/kontakt" />);

    await waitFor(() => expect(sendBeacon).toHaveBeenCalledTimes(1));

    rerender(<PageViewBeacon page="/no/senja" />);

    await waitFor(() => expect(sendBeacon).toHaveBeenCalledTimes(2));
  });
});
