import { randomUUID } from "node:crypto";

import * as arctic from "arctic";
import { getPayload } from "payload";

import type { Customer } from "../../../../../../payload-types";
import config from "@payload-config";

const oauthProviders = ["facebook", "google"] as const;

export type OAuthProvider = (typeof oauthProviders)[number];

type OAuthProfile = {
  email: null | string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  provider: OAuthProvider;
  providerUserId: string;
  rawProfile: Record<string, unknown>;
};

export function isOAuthProvider(value: string): value is OAuthProvider {
  return oauthProviders.includes(value as OAuthProvider);
}

export function createAuthorizationURL(provider: OAuthProvider, request: Request): {
  authorizationURL: URL;
  codeVerifier?: string;
  state: string;
} {
  const state = arctic.generateState();

  if (provider === "google") {
    const codeVerifier = arctic.generateCodeVerifier();
    const google = new arctic.Google(
      getRequiredEnv("GOOGLE_CLIENT_ID"),
      getRequiredEnv("GOOGLE_CLIENT_SECRET"),
      getRedirectURI(provider, request),
    );

    return {
      authorizationURL: google.createAuthorizationURL(state, codeVerifier, [
        "openid",
        "profile",
        "email",
      ]),
      codeVerifier,
      state,
    };
  }

  const facebook = new arctic.Facebook(
    getRequiredEnv("FACEBOOK_CLIENT_ID"),
    getRequiredEnv("FACEBOOK_CLIENT_SECRET"),
    getRedirectURI(provider, request),
  );

  return {
    authorizationURL: facebook.createAuthorizationURL(state, ["email", "public_profile"]),
    state,
  };
}

export async function getOAuthProfile(args: {
  code: string;
  codeVerifier?: string;
  provider: OAuthProvider;
  request: Request;
}): Promise<OAuthProfile> {
  if (args.provider === "google") {
    return getGoogleProfile(args.code, args.codeVerifier, args.request);
  }

  return getFacebookProfile(args.code, args.request);
}

export async function resolveCustomerFromOAuthProfile(
  profile: OAuthProfile,
): Promise<Customer> {
  const payload = await getPayload({
    config,
    cron: true,
  });
  const existingIdentity = await payload.find({
    collection: "customer-identities",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      providerKey: {
        equals: getProviderKey(profile.provider, profile.providerUserId),
      },
    },
  });

  const linkedIdentity = existingIdentity.docs[0];

  if (linkedIdentity) {
    const customerID =
      typeof linkedIdentity.customer === "number"
        ? linkedIdentity.customer
        : linkedIdentity.customer.id;

    return payload.findByID({
      collection: "customers",
      id: customerID,
      overrideAccess: true,
    });
  }

  if (!profile.email) {
    throw new Error("missing_provider_email");
  }

  const normalizedEmail = normalizeEmail(profile.email);
  const existingCustomer = await findCustomerByEmail(normalizedEmail);

  if (existingCustomer) {
    if (!profile.emailVerified) {
      throw new Error("link_with_password");
    }

    await createIdentity({
      customerID: existingCustomer.id,
      profile,
    });

    return existingCustomer;
  }

  const createdCustomer = await payload.create({
    collection: "customers",
    data: {
      email: normalizedEmail,
      firstName: profile.firstName,
      lastName: profile.lastName,
      password: randomUUID(),
    },
    draft: false,
    overrideAccess: true,
  });

  await createIdentity({
    customerID: createdCustomer.id,
    profile,
  });

  return createdCustomer;
}

export function getOAuthStateCookieName(provider: OAuthProvider): string {
  return `ritual-oauth-${provider}-state`;
}

export function getOAuthCodeVerifierCookieName(provider: OAuthProvider): string {
  return `ritual-oauth-${provider}-code-verifier`;
}

function getProviderKey(provider: OAuthProvider, providerUserId: string): string {
  return `${provider}:${providerUserId}`;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error("oauth_unavailable");
  }

  return value;
}

function getRedirectURI(provider: OAuthProvider, request: Request): string {
  return new URL(`/api/auth/oauth/${provider}/callback`, request.url).toString();
}

async function getGoogleProfile(
  code: string,
  codeVerifier: string | undefined,
  request: Request,
): Promise<OAuthProfile> {
  if (!codeVerifier) {
    throw new Error("oauth_failed");
  }

  const google = new arctic.Google(
    getRequiredEnv("GOOGLE_CLIENT_ID"),
    getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    getRedirectURI("google", request),
  );
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("oauth_failed");
  }

  const rawProfile = (await response.json()) as {
    email?: string;
    email_verified?: boolean;
    family_name?: string;
    given_name?: string;
    sub?: string;
  };

  if (!rawProfile.sub) {
    throw new Error("oauth_failed");
  }

  const names = normalizeNames({
    email: rawProfile.email,
    firstName: rawProfile.given_name,
    lastName: rawProfile.family_name,
  });

  return {
    email: rawProfile.email ? normalizeEmail(rawProfile.email) : null,
    emailVerified: Boolean(rawProfile.email_verified),
    firstName: names.firstName,
    lastName: names.lastName,
    provider: "google",
    providerUserId: rawProfile.sub,
    rawProfile,
  };
}

async function getFacebookProfile(code: string, request: Request): Promise<OAuthProfile> {
  const facebook = new arctic.Facebook(
    getRequiredEnv("FACEBOOK_CLIENT_ID"),
    getRequiredEnv("FACEBOOK_CLIENT_SECRET"),
    getRedirectURI("facebook", request),
  );
  const tokens = await facebook.validateAuthorizationCode(code);
  const response = await fetch(
    `https://graph.facebook.com/me?fields=id,email,first_name,last_name,name&access_token=${encodeURIComponent(
      tokens.accessToken(),
    )}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("oauth_failed");
  }

  const rawProfile = (await response.json()) as {
    email?: string;
    first_name?: string;
    id?: string;
    last_name?: string;
    name?: string;
  };

  if (!rawProfile.id) {
    throw new Error("oauth_failed");
  }

  const names = normalizeNames({
    email: rawProfile.email,
    firstName: rawProfile.first_name,
    fullName: rawProfile.name,
    lastName: rawProfile.last_name,
  });

  return {
    email: rawProfile.email ? normalizeEmail(rawProfile.email) : null,
    emailVerified: false,
    firstName: names.firstName,
    lastName: names.lastName,
    provider: "facebook",
    providerUserId: rawProfile.id,
    rawProfile,
  };
}

async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const payload = await getPayload({
    config,
    cron: true,
  });
  const result = await payload.find({
    collection: "customers",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      email: {
        equals: email,
      },
    },
  });

  return result.docs[0] ?? null;
}

async function createIdentity(args: {
  customerID: number;
  profile: OAuthProfile;
}): Promise<void> {
  const payload = await getPayload({
    config,
    cron: true,
  });

  await payload.create({
    collection: "customer-identities",
    data: {
      customer: args.customerID,
      provider: args.profile.provider,
      providerEmail: args.profile.email,
      providerEmailVerified: args.profile.emailVerified,
      providerKey: getProviderKey(args.profile.provider, args.profile.providerUserId),
      providerUserId: args.profile.providerUserId,
      rawProfile: args.profile.rawProfile,
    },
    overrideAccess: true,
  });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeNames(args: {
  email?: string;
  firstName?: string;
  fullName?: string;
  lastName?: string;
}): {
  firstName: string;
  lastName: string;
} {
  const firstName = args.firstName?.trim();
  const lastName = args.lastName?.trim();

  if (firstName && lastName) {
    return {
      firstName,
      lastName,
    };
  }

  if (args.fullName?.trim()) {
    const parts = args.fullName.trim().split(/\s+/);
    const normalizedFirstName = firstName ?? parts[0];
    const normalizedLastName = lastName ?? parts.slice(1).join(" ");

    if (normalizedFirstName && normalizedLastName) {
      return {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
      };
    }

    if (normalizedFirstName) {
      return {
        firstName: normalizedFirstName,
        lastName: "Kupac",
      };
    }
  }

  if (firstName) {
    return {
      firstName,
      lastName: lastName || "Kupac",
    };
  }

  const emailLocalPart = args.email?.split("@")[0]?.trim();

  return {
    firstName: emailLocalPart || "Ritual",
    lastName: "Kupac",
  };
}
