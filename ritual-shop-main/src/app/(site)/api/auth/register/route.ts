import { login } from "@payloadcms/next/auth";
import { getPayload } from "payload";
import { NextResponse } from "next/server";

import config from "@payload-config";

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const firstName = getRequiredField(formData, "firstName");
  const lastName = getRequiredField(formData, "lastName");
  const email = getRequiredField(formData, "email");
  const password = getRequiredField(formData, "password");
  const passwordConfirm = getRequiredField(formData, "passwordConfirm");

  if (!firstName || !lastName || !email || !password || !passwordConfirm) {
    return redirectWithError(request, "missing_fields");
  }

  if (password !== passwordConfirm) {
    return redirectWithError(request, "password_mismatch");
  }

  try {
    const payload = await getPayload({
      config,
      cron: true,
    });

    await payload.create({
      collection: "customers",
      data: {
        email: email.trim().toLowerCase(),
        firstName,
        lastName,
        password,
      },
      draft: false,
      overrideAccess: true,
    });

    await login({
      collection: "customers",
      config,
      email: email.trim().toLowerCase(),
      password,
    });
  } catch {
    return redirectWithError(request, "register_failed");
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

function redirectWithError(request: Request, errorCode: string): NextResponse {
  const url = new URL("/register", request.url);

  url.searchParams.set("error", errorCode);

  return NextResponse.redirect(url, {
    status: 303,
  });
}
