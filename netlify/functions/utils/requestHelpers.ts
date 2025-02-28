import { HandlerEvent as APIGatewayEvent } from "@netlify/functions";

/**
 * Validates the HTTP method of the request.
 * @param event The Netlify function event object.
 * @param allowedMethod The expected HTTP method (e.g., "GET", "POST", "PUT", "DELETE").
 * @returns An object containing the validation result and an error response if invalid.
 */
export function validateMethod(
  event: APIGatewayEvent,
  allowedMethod: string
): { isValid: boolean; errorResponse?: any } {
  if (event.httpMethod !== allowedMethod) {
    return {
      isValid: false,
      errorResponse: {
        statusCode: 405,
        body: JSON.stringify({
          error: `Method Not Allowed. Expected: ${allowedMethod}`,
        }),
      },
    };
  }

  return { isValid: true };
}

/**
 * Extracts and validates the user email from the request query parameters.
 * @param event The Netlify function event object.
 * @returns The user email if valid, or an error response object.
 */
export function getUserEmail(event: APIGatewayEvent): {
  email?: string;
  errorResponse?: any;
} {
  const queryParams = new URLSearchParams(event.rawQuery);
  const userEmail = queryParams.get("email");

  if (!userEmail) {
    return {
      errorResponse: {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing email parameter." }),
      },
    };
  }

  return { email: userEmail };
}
