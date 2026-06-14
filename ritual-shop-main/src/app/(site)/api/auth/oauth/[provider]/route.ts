import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createAuthorizationURL,
  getOAuthCodeVerifierCookieName,
  getOAuthStateCookieName,
  isOAuthProvider,
} from "../../_lib/oauth";

type RouteContext = {
  params: Promise<{
    provider: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    return redirectWithError(request, "oauth_failed");
  }

  try {
    const { authorizationURL, codeVerifier, state } = createAuthorizationURL(provider, request);
    const cookieStore = await cookies();

    cookieStore.set(getOAuthStateCookieName(provider), state, {
      httpOnly: true,
      maxAge: 60 * 10,
      path: "/",
      sameSite: "lax",
      secure: new URL(request.url).protocol === "https:",
    });

    if (codeVerifier) {
      cookieStore.set(getOAuthCodeVerifierCookieName(provider), codeVerifier, {
        httpOnly: true,
        maxAge: 60 * 10,
        path: "/",
        sameSite: "lax",
        secure: new URL(request.url).protocol === "https:",
      });
    }

    return NextResponse.redirect(authorizationURL, {
      status: 302,
    });
  } catch (error) {
    const errorCode = error instanceof Error ? error.message : "oauth_failed";

    return redirectWithError(request, errorCode);
  }
}

function redirectWithError(request: Request, errorCode: string): NextResponse {
  const url = new URL("/login", request.url);

  url.searchParams.set("error", errorCode);

  return NextResponse.redirect(url, {
    status: 303,
  });
}
