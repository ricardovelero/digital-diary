import { Handler } from "@netlify/functions";
import { connectToDB } from "./utils/db";
import { validateAuth } from "./utils/auth";
import { validateMethod } from "./utils/requestHelpers";

/**
 * Creates a new contact in the database and associates it with the authenticated user.
 * @param event The Netlify function event object.
 * @returns An object with status code and body with either a succesfull entry or an error.
 */
const handler: Handler = async (event) => {
  // Validate authorization and extract user email
  const { isAuthorized, userEmail, errorResponse } = validateAuth(event);
  if (!isAuthorized) return errorResponse;

  // Validate HTTP method
  const { isValid, errorResponse: methodError } = validateMethod(event, "POST");
  if (!isValid) return methodError;

  try {
    // Connect to the entries collection
    const contactsCollection = await connectToDB("diatyDB", "entries");
    const body = event.body ? JSON.parse(event.body) : null;

    // Validate request body
    if (!body || typeof body !== "object") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body." }),
      };
    }

    const { title, content, mood } = body;

    // Validate required fields
    if (!title?.trim() || !content?.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Title and content are required." }),
      };
    }

    // Ensure fields are properly sanitized
    const cleanedEntry = {
      userEmail,
      title: title.trim(),
      content: content.trim(),
      mood: typeof mood === "string" ? mood.trim() : null,
      createdAt: new Date(),
    };

    // Insert the new entry
    const result = await contactsCollection.insertOne(cleanedEntry);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Entry created successfully.",
        id: result.insertedId,
        ...cleanedEntry,
      }),
    };
  } catch (error) {
    console.error("Error creating entry:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error when creating an entry.",
      }),
    };
  }
};
export { handler };
