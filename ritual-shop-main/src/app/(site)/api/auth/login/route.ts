import { login } from "@payloadcms/next/auth";
import { NextResponse } from "next/server";

import config from "@payload-config";

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const email = getRequiredField(formData, "email");
  const password = getRequiredField(formData, "password");

  if (!email || !password) {
    return redirectWithError(request, "/login", "missing_fields");
  }

  try {
    await login({
      collection: "customers",
      config,
      email: email.trim().toLowerCase(),
      password,
    });
  } catch {
    return redirectWithError(request, "/login", "invalid_credentials");
  }

  return NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });
}

function getRequiredField(formData: FormData, key: string): null | string {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function redirectWithError(
  request: Request,
  pathname: string,
  errorCode: string,
): NextResponse {
  const url = new URL(pathname, request.url);

  url.searchParams.set("error", errorCode);

  return NextResponse.redirect(url, {
    status: 303,
  });
}
