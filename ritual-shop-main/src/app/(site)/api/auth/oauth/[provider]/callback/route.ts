import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { signInCustomer } from "../../../_lib/sign-in-customer";
import {
  getOAuthCodeVerifierCookieName,
  getOAuthProfile,
  getOAuthStateCookieName,
  isOAuthProvider,
  resolveCustomerFromOAuthProfile,
} from "../../../_lib/oauth";

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

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const providerError = url.searchParams.get("error");

  if (providerError || !code || !state) {
    return redirectWithError(request, "oauth_failed");
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(getOAuthStateCookieName(provider))?.value;
  const codeVerifier = cookieStore.get(getOAuthCodeVerifierCookieName(provider))?.value;

  cookieStore.delete(getOAuthStateCookieName(provider));
  cookieStore.delete(getOAuthCodeVerifierCookieName(provider));

  if (!storedState || storedState !== state) {
    return redirectWithError(request, "oauth_failed");
  }

  try {
    const profile = await getOAuthProfile({
      code,
      codeVerifier,
      provider,
      request,
    });
    const customer = await resolveCustomerFromOAuthProfile(profile);

    await signInCustomer(customer, request);
  } catch (error) {
    const errorCode = error instanceof Error ? error.message : "oauth_failed";

    return redirectWithError(request, errorCode);
  }

  return NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });
}

function redirectWithError(request: Request, errorCode: string): NextResponse {
  const url = new URL("/login", request.url);

  url.searchParams.set("error", errorCode);

  return NextResponse.redirect(url, {
    status: 303,
  });
}
