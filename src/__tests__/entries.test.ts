/**
 * @jest-environment node
 */

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import { handler as createEntry } from "../../netlify/functions/entries_create";
import { handler as readEntries } from "../../netlify/functions/entries_read";
import { handler as updateEntry } from "../../netlify/functions/entries_update";
import { handler as deleteEntry } from "../../netlify/functions/entries_delete";

// Mock Netlify Auth to always return an auth user.
vi.mock("../../netlify/functions/utils/auth", () => ({
  validateAuth: () => ({
    isAuthorized: true,
    userEmail: "test@example.com",
    errorResponse: null,
  }),
}));

// Mock unauth user.
const mockUnauthorizedUser = async () => {
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
const fakeContactId = new ObjectId().toString();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;
  client = await MongoClient.connect(mongoUri);
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

  it("should update an existing entry", async () => {
    // First, insert a new note to update
    const insertEvent = {
      httpMethod: "POST",
      body: JSON.stringify({
        title: "An Entry",
        content: "Original note content",
        mood: "Happy",
      }),
      headers: {
        authorization: "Bearer mock-token",
      },
    } as any;

    const insertResponse = await createEntry(insertEvent, context);
    if (!insertResponse) {
      throw new Error("Handler returned void instead of a response");
    }
    expect(insertResponse.statusCode).toBe(201);

    const insertBody = JSON.parse(insertResponse.body ?? "{}");
    const entryId = insertBody.id;

    // Now, update the note
    const event = {
      httpMethod: "PUT",
      body: JSON.stringify({
        id: entryId,
        title: "Updated Entry",
        content: "Updated entry content",
      }),
      headers: {
        authorization: "Bearer mock-token",
      },
    } as any;

    const response = await updateEntry(event, context);
    if (!response) {
      throw new Error("Handler returned void instead of a response");
    }

    console.log("Update Entry Full Response:", response);

    expect(response.statusCode).toBe(200);

    const safeBody = typeof response.body === "string" ? response.body : "{}";
    const body = JSON.parse(safeBody);

    console.log("Update Entry Response Body:", body);

    expect(body.content).toBe("Updated entry content");
  });

  it("should delete an entry", async () => {
    const event = {
      httpMethod: "DELETE",
      queryStringParameters: { id: entryId },
    } as any;

    const response = await deleteEntry(event, context);
    if (!response) {
      throw new Error("Handler returned void instead of a response"); // Fails if handler does not return
    }

    console.log("🆑 Delete Entry Full Response:", response);

    expect(response.statusCode).toBe(200);
  });
});

describe("Unauthorized Access", () => {
  const context = {} as any; // Mock context object

  it("should return 401 Unauthorized when trying to create a note without auth", async () => {
    await mockUnauthorizedUser(); // Switch to an Unauthorized User

    const event = {
      httpMethod: "POST",
      body: JSON.stringify({
        contactId: fakeContactId,
        content: "This is a test",
        title: "Test entry",
        mood: "Yes!",
      }),
    } as any;

    const response = await createEntry(event, context);

    if (!response) {
      throw new Error("Handler returned void instead of a response"); // Fails if handler does not return
    }

    console.log("Error in Unauthorized:", response);

    expect(response.statusCode).toBe(401);

    expect(JSON.parse(response.body ?? "{}").error).toBe("Unauthorized");

    mockAuthorizedUser(); // 🔄 Restore Authorized User for the next tests
  });
});
