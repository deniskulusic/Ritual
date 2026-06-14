import { cookies } from "next/headers";
import { createLocalReq, getFieldsToSign, getPayload, jwtSign } from "payload";
import { addSessionToUser, generatePayloadCookie } from "payload/shared";

import type { Customer } from "../../../../../../payload-types";
import config from "@payload-config";

type CustomerWithCollection = Customer & {
  collection: "customers";
};

export async function signInCustomer(
  customer: Customer,
  request?: Request,
): Promise<void> {
  const payload = await getPayload({
    config,
    cron: true,
  });

  const collectionConfig = payload.collections.customers?.config;

  if (!collectionConfig?.auth) {
    throw new Error("Customers auth config is not available.");
  }

  const authCustomer: CustomerWithCollection = {
    ...customer,
    collection: "customers",
  };

  const req = await createLocalReq(
    {
      req: {
        headers: request ? new Headers(request.headers) : new Headers(),
        url: request?.url,
      },
      user: authCustomer,
    },
    payload,
  );

  const { sid } = await addSessionToUser({
    collectionConfig,
    payload,
    req,
    user: authCustomer,
  });

  const { token } = await jwtSign({
    fieldsToSign: getFieldsToSign({
      collectionConfig,
      email: authCustomer.email,
      sid,
      user: authCustomer,
    }),
    secret: payload.config.secret,
    tokenExpiration: collectionConfig.auth.tokenExpiration,
  });

  const payloadCookie = generatePayloadCookie({
    collectionAuthConfig: collectionConfig.auth,
    cookiePrefix: payload.config.cookiePrefix,
    returnCookieAsObject: true,
    token,
  });

  const cookieStore = await cookies();

  cookieStore.set(payloadCookie.name, payloadCookie.value ?? "", {
    domain: payloadCookie.domain,
    expires: payloadCookie.expires ? new Date(payloadCookie.expires) : undefined,
    httpOnly: payloadCookie.httpOnly,
    path: payloadCookie.path,
    sameSite: payloadCookie.sameSite?.toLowerCase() as "lax" | "none" | "strict",
    secure: payloadCookie.secure,
  });
}
