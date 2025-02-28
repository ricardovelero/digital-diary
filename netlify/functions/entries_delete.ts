import { Handler } from "@netlify/functions";
import { connectToDB } from "./utils/db";
import { validateAuth } from "./utils/auth";
import { validateMethod } from "./utils/requestHelpers";
import { ObjectId } from "mongodb";

/**
 * Deletes an entry in the database.
 * @param event The Netlify function event object.
 * @returns An object with status code and body or an error.
 */
const handler: Handler = async (event) => {
  // Validate authorization and extract user email
  const { isAuthorized, userEmail, errorResponse } = validateAuth(event);
  if (!isAuthorized) return errorResponse;

  // Validate HTTP method
  const { isValid, errorResponse: methodError } = validateMethod(
    event,
    "DELETE"
  );
  if (!isValid) return methodError;

  try {
    const entriesCollection = await connectToDB("diaryDB", "entries");
    const { id } = event.queryStringParameters || {};

    // Validate ID format
    if (!id || !ObjectId.isValid(id)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid entry ID." }),
      };
    }

    const objectId = ObjectId.createFromHexString(id);

    // Ensure the user is deleting their own entry
    const result = await entriesCollection.deleteOne({
      _id: objectId,
      userEmail,
    });

    if (result.deletedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Entry not found or access denied." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "entry deleted successfully.", id }),
    };
  } catch (error) {
    console.error("Error deleting entry:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error when deleting an entry.",
      }),
    };
  }
};

export { handler };
