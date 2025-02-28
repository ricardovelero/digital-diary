import { Handler } from "@netlify/functions";
import { connectToDB } from "./utils/db";
import { validateAuth } from "./utils/auth";
import { validateMethod } from "./utils/requestHelpers";
import { ObjectId } from "mongodb";

/**
 * Updates a new entry in the database.
 * @param event The Netlify function event object.
 * @returns An object with status code and body with either a successful entry update or an error.
 */
const handler: Handler = async (event) => {
  // Validate authorization
  const { isAuthorized, userEmail, errorResponse } = validateAuth(event);
  if (!isAuthorized) return errorResponse;

  // Validate HTTP method
  const { isValid, errorResponse: methodError } = validateMethod(event, "PUT");
  if (!isValid) return methodError;

  try {
    // Connect to the contacts collection
    const contactsCollection = await connectToDB("diaryDB", "entries");
    const body = event.body ? JSON.parse(event.body) : null;

    // Validate request body
    if (!body || typeof body !== "object") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body." }),
      };
    }

    const { id, title, content, mood } = body;

    // Validate ID format
    if (!id || !ObjectId.isValid(id)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid entry ID." }),
      };
    }

    // Validate required fields
    if (!title?.trim() || !content?.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Title and content are required." }),
      };
    }

    // Convert `id` safely
    const objectId = ObjectId.createFromHexString(id);

    // Update the contact
    const result = await contactsCollection.updateOne(
      { _id: objectId, userEmail },
      {
        $set: {
          title: title.trim(),
          content: content.trim(),
          mood: typeof mood === "string" ? mood.trim() : null,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Entry not found." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Entry updated successfully.",
        id,
        userEmail,
        title,
        content,
        mood,
      }),
    };
  } catch (error) {
    console.error("Error updating entry:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error updating entry." }),
    };
  }
};

export { handler };
