import { Handler } from "@netlify/functions";
import { connectToDB } from "./utils/db";
import { validateAuth } from "./utils/auth";

/**
 * Retrieves entries for the authenticated user.
 */
const handler: Handler = async (event) => {
  // Validate authorization and extract user email
  const { isAuthorized, userEmail, errorResponse } = validateAuth(event);
  if (!isAuthorized) return errorResponse;

  try {
    // Connect to the entries collection
    const entriesCollection = await connectToDB("diaryDB", "entries");

    // Fetch only the contacts that belong to the logged-in user
    const entries = await entriesCollection.find({ userEmail }).toArray();

    // Format entries and convert ObjectId to string
    const formattedEntries = entries.map(({ _id, ...entry }) => ({
      ...entry,
      id: _id.toString(),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(formattedEntries),
    };
  } catch (error) {
    console.error("Error fetching entries:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error fetching entries.",
      }),
    };
  }
};

export { handler };
