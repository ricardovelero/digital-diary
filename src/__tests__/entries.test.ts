/**
 * @jest-environment node
 */

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { handler as createEntry } from "../../netlify/functions/entries_create";
import { handler as readEntries } from "../../netlify/functions/entries_read";

// Mock Netlify Auth to always return an auth user.
vi.mock("../../netlify/functions/utils/auth", () => ({
  validateAuth: () => ({
    isAuthorized: true,
    userEmail: "test@example.com",
    errorResponse: null,
  }),
}));

// Mock unauth user.
const mockUnathorizedUser = async () => {
  const authModule = await import("../../netlify/functions/utils/auth");

  vi.spyOn(authModule, "validateAuth").mockReturnValue({
    isAuthorized: false,
    errorResponse: {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized" }),
    },
  });
};

// Mock restore auth User
const mockAuthorizedUser = async () => {
  const authModule = await import("../../netlify/functions/utils/auth");

  vi.spyOn(authModule, "validateAuth").mockReturnValue({
    isAuthorized: true,
    userEmail: "test@example.com",
    errorResponse: null,
  });
};

// Mock MongoDB in memory.
let mongoServer: MongoMemoryServer;
let client: MongoClient;
let db: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;
  client = await MongoClient.connect(mongoUri);
  db = client.db();
});

afterAll(async () => {
  await client.close();
  await mongoServer.stop();
});

describe("Entries API", () => {
  let entryId: string;
  const context = {} as any; // Mock context object

  it("Should create a new entry", async () => {
    const event = {
      httpMethod: "POST",
      body: JSON.stringify({ title: "New entry", content: "Test entry" }),
    } as any;

    const response = await createEntry(event, context);
    if (!response)
      throw new Error("Handler returned void instead of a response"); // Fails if handler doesn't work

    console.log("New entry full response", response);

    expect(response.statusCode).toBe(201);
    const safeBody = typeof response.body === "string" ? response.body : "{}";
    const body = JSON.parse(safeBody);

    console.log("New entry response body:", body);

    expect(body.content).toBe("Test entry");
    entryId = body.id;
  });

  it("Should read entries for a user", async () => {
    const event = {
      httpMethod: "GET",
      body: JSON.stringify({
        title: "An entry",
        content: "Test reading entry",
      }),
    } as any;

    const response = await readEntries(event, context);
    if (!response) {
      throw new Error("Handler returned void instead of a response"); // Fails if handler does not return
    }
    console.log("Read entries full response:", response);

    expect(response.statusCode).toBe(200);
    const safeBody = typeof response.body === "string" ? response.body : "{}";
    const notes = JSON.parse(safeBody);
    console.log("Read entries response Body:", safeBody);

    expect(notes.length).toBeGreaterThan(0);
  });
});
