import { HandlerEvent as APIGatewayEvent } from "@netlify/functions";
import jwt from "jsonwebtoken";

/**
 * Validates the authorization header and extracts user identity.
 * @param event The Netlify function event object.
 * @returns An object containing authoriztion status, user email, and error response if unauthorized.
 */
export function validateAuth(event: APIGatewayEvent): {
  isAuthorized: boolean;
  userEmail?: string;
  errorResponse?: any;
} {
  const authHeader = event.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      isAuthorized: false,
      errorResponse: {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized" }),
      },
    };
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    // Decode JWT w/o verification, for Netlify already validates it.
    const decoded: any = jwt.decode(token);
    const userEmail = decoded?.email;

    if (!userEmail) {
      return {
        isAuthorized: false,
        errorResponse: {
          statuscode: 401,
          body: JSON.stringify({ error: "Invalid token: Email not found." }),
        },
      };
    }

    return {
      isAuthorized: true,
      userEmail,
    };
  } catch (error) {
    return {
      isAuthorized: false,
      errorResponse: {
        statuscode: 401,
        body: JSON.stringify({ error: "Invalid token." }),
      },
    };
  }
}
