import { Handler } from "@netlify/functions";
import { connectToDB } from "./utils/db";
import { validateAuth } from "./utils/auth";
import { ObjectId } from "mongodb";

/**
 * Retrieves entries for the authenticated user.
 */
const handler: Handler = async (event) => {
  // Validate authorization and extract user email
  const { isAuthorized, userEmail, errorResponse } = validateAuth(event);
  if (!isAuthorized) return errorResponse;

  if (!event.queryStringParameters || !event.queryStringParameters.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing entry ID" }),
    };
  }

  const entryId = event.queryStringParameters.id;

  try {
    // Connect to the entries collection
    const entriesCollection = await connectToDB("diaryDB", "entries");

    // Fetch only the entries that belong to the logged-in user
    const entry = await entriesCollection.findOne({
      _id: new ObjectId(entryId),
      userEmail,
    });

    if (!entry) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Entry not found" }),
      };
    }

    // Format the entry and convert ObjectId to a string
    const formattedentry = {
      ...entry,
      id: entry._id.toString(),
    };

    return {
      statusCode: 200,
      body: JSON.stringify(formattedentry),
    };
  } catch (error) {
    console.error("Error fetching entries:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error fetching an entry",
      }),
    };
  }
};

export { handler };
