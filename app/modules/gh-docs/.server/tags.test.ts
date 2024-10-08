import { getLatestVersionHeads } from "./tags";

describe("getLatestVersionHeads", () => {
  it("gets the latest version heads", () => {
    const tags = [
      "1.0.0",
      "1.1.0",
      "1.1.1",
      "1.1.2",
      "2.0.0",
      "2.0.1",
      "2.1.0",
      "2.1.1",
      "3.0.0",
      "3.1.0",
      "3.2.0",
    ];
    const heads = getLatestVersionHeads(tags);
    expect(heads).toEqual(["3.2.0", "2.1.1", "1.1.2"]);
  });

  it("doesn't depend on order", () => {
    const tags = [
      "3.2.0",
      "1.0.0",
      "1.1.0",
      "2.1.0",
      "1.1.2",
      "1.1.1",
      "2.0.0",
      "2.0.1",
      "2.1.1",
      "3.0.0",
      "3.1.0",
    ];
    const heads = getLatestVersionHeads(tags);
    expect(heads).toEqual(["3.2.0", "2.1.1", "1.1.2"]);
  });
});
