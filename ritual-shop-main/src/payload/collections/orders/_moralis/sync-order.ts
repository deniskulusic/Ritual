import type { PayloadRequest } from "payload";

import type { Customer, Order } from "../../../../../payload-types";
import {
  createMoralisBusinessCustomer,
  createMoralisOrderHeader,
  createMoralisOrderLines,
  createMoralisPrivateCustomer,
  findMoralisBusinessCustomer,
  findMoralisPrivateCustomer,
} from "./client";
import { getMoralisConfig } from "../../../integrations/moralis/config";

type MoralisCustomerMatch = {
  raw: null | Record<string, unknown>;
  sifPar: number;
  sifPj: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const parsed = Number(value.replace(",", ".").trim());

  return Number.isFinite(parsed) ? parsed : 0;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatMoralisDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  return `${day}.${month}.${year}`;
}

function formatMoralisDateTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${formatMoralisDate(date)} ${hours}:${minutes}:${seconds}`;
}

function getOrderCreatedAt(order: Order) {
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();

  return Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;
}

function getBillingAddress(order: Order) {
  return asRecord(order.billingAddress);
}

function getOrderItems(order: Order) {
  return Array.isArray(order.items) ? order.items : [];
}

async function getCustomer(req: PayloadRequest, order: Order) {
  const customerId =
    typeof order.customer === "number"
      ? order.customer
      : order.customer && typeof order.customer === "object" && "id" in order.customer
        ? Number(order.customer.id)
        : null;

  if (!customerId) {
    return null;
  }

  try {
    return (await req.payload.findByID({
      collection: "customers",
      depth: 0,
      id: customerId,
      req,
    })) as Customer;
  } catch {
    return null;
  }
}

function getPrivateBuyerEmail(order: Order, customer: Customer | null) {
  return (
    getText(order.guestEmail) ||
    getText(customer?.email) ||
    getText(getBillingAddress(order).email)
  ).toLowerCase();
}

function getPrivateBuyerKey(email: string) {
  const config = getMoralisConfig();

  return `${config.privateBuyerPrefix}${email}`;
}

function getPrivateBuyerDisplayName(order: Order, customer: Customer | null) {
  const billingAddress = getBillingAddress(order);
  const fullName =
    [getText(billingAddress.firstName), getText(billingAddress.lastName)]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    [getText(customer?.firstName), getText(customer?.lastName)]
      .filter(Boolean)
      .join(" ")
      .trim();

  return fullName || getPrivateBuyerEmail(order, customer);
}

function getBillingAddressLine(order: Order) {
  const billingAddress = getBillingAddress(order);

  return [getText(billingAddress.addressLine1), getText(billingAddress.addressLine2)]
    .filter(Boolean)
    .join(" ")
    .trim();
}

async function resolveMoralisCustomer(args: {
  customer: Customer | null;
  order: Order;
  rawLog: Record<string, unknown>;
}) {
  const { customer, order, rawLog } = args;
  const billingAddress = getBillingAddress(order);
  const isBusiness = billingAddress.isBusiness === true;

  if (isBusiness) {
    const taxId = getText(billingAddress.taxId);

    if (!taxId) {
      throw new Error("Moralis sync requires a tax ID for business invoices.");
    }

    const existingBusinessCustomer = await findMoralisBusinessCustomer(taxId);

    rawLog.customerLookup = {
      kind: "business",
      request: {
        taxId,
      },
      response: existingBusinessCustomer?.raw ?? null,
    };

    if (existingBusinessCustomer) {
      return {
        customerKey: taxId,
        customerType: "business" as const,
        match: {
          raw: existingBusinessCustomer.raw,
          sifPar: existingBusinessCustomer.sifPar,
          sifPj: -1,
        } satisfies MoralisCustomerMatch,
      };
    }

    const createdBusinessCustomer = await createMoralisBusinessCustomer({
      address: getBillingAddressLine(order),
      companyName: getText(billingAddress.company) || getPrivateBuyerDisplayName(order, customer),
      createdOn: formatMoralisDate(getOrderCreatedAt(order)),
      taxId,
    });

    rawLog.customerCreate = createdBusinessCustomer.raw;

    return {
      customerKey: taxId,
      customerType: "business" as const,
      match: {
        raw: createdBusinessCustomer.raw.result ?? {},
        sifPar: createdBusinessCustomer.documentRef.sifPar,
        sifPj: createdBusinessCustomer.documentRef.sifPj,
      } satisfies MoralisCustomerMatch,
    };
  }

  const email = getPrivateBuyerEmail(order, customer);

  if (!email) {
    throw new Error("Moralis sync requires an email for private buyers.");
  }

  const privateBuyerKey = getPrivateBuyerKey(email);
  const existingPrivateCustomer = await findMoralisPrivateCustomer(privateBuyerKey);

  rawLog.customerLookup = {
    kind: "private",
    request: {
      privateBuyerKey,
    },
    response: existingPrivateCustomer?.raw ?? null,
  };

  if (existingPrivateCustomer) {
    return {
      customerKey: privateBuyerKey,
      customerType: "private" as const,
      match: {
        raw: existingPrivateCustomer.raw,
        sifPar: existingPrivateCustomer.sifPar,
        sifPj: existingPrivateCustomer.sifPj,
      } satisfies MoralisCustomerMatch,
    };
  }

  const createdPrivateCustomer = await createMoralisPrivateCustomer({
    address: getBillingAddressLine(order),
    city: getText(billingAddress.city),
    country: getText(billingAddress.country) || "Hrvatska",
    name: getPrivateBuyerDisplayName(order, customer),
    privateBuyerKey,
  });

  rawLog.customerCreate = createdPrivateCustomer.raw;

  return {
    customerKey: privateBuyerKey,
    customerType: "private" as const,
    match: {
      raw: createdPrivateCustomer.raw.result ?? {},
      sifPar: createdPrivateCustomer.documentRef.sifPar,
      sifPj: createdPrivateCustomer.documentRef.sifPj,
    } satisfies MoralisCustomerMatch,
  };
}

function getFiskalPaymentCode(order: Order) {
  switch (getText(order.payment?.method)) {
    case "cash":
      return "G";
    case "card":
      return "K";
    case "bank":
      return "T";
    default:
      return "O";
  }
}

function getMoralisLineItems(order: Order) {
  return getOrderItems(order).map((item, index) => {
    const line = asRecord(item);
    const itemID = getText(line.itemID);
    const quantity = getNumber(line.quantity);
    const unitPrice = getNumber(line.unitPrice);
    const lineTotal = getNumber(line.lineTotal);
    const discountTotal = getNumber(line.discountTotal);
    const rawDiscountPercent =
      lineTotal > 0 ? roundCurrency((discountTotal / lineTotal) * 100) : getNumber(line.discountPercent);
    const discountPercent = Math.max(0, rawDiscountPercent);

    if (!itemID) {
      throw new Error(`Moralis sync requires itemID on order line ${index + 1}.`);
    }

    if (quantity <= 0) {
      throw new Error(`Moralis sync requires quantity on order line ${index + 1}.`);
    }

    if (unitPrice < 0) {
      throw new Error(`Moralis sync requires a valid unit price on order line ${index + 1}.`);
    }

    return {
      discountPercent,
      itemID,
      quantity,
      unitPrice,
    };
  });
}

function shouldSyncMoralisOrder(
  order: Order,
  previousOrder: null | Order | undefined,
  req: PayloadRequest,
) {
  if (previousOrder) {
    return false;
  }

  if (req.context && typeof req.context === "object" && "skipMoralisOrderSync" in req.context) {
    return false;
  }

  return getOrderItems(order).length > 0;
}

async function updateMoralisState(args: {
  data: Record<string, unknown>;
  order: Order;
  req: PayloadRequest;
}) {
  const { data, order, req } = args;

  req.context = {
    ...(req.context ?? {}),
    skipMoralisOrderSync: true,
  };

  await req.payload.update({
    collection: "orders",
    data,
    id: order.id,
    req,
  });
}

export async function syncMoralisOrder(
  req: PayloadRequest,
  order: Order,
  previousOrder?: null | Order,
) {
  if (!shouldSyncMoralisOrder(order, previousOrder, req)) {
    return;
  }

  const rawLog: Record<string, unknown> = {};
  const customer = await getCustomer(req, order);

  try {
    const moralisCustomer = await resolveMoralisCustomer({
      customer,
      order,
      rawLog,
    });
    const createdAt = getOrderCreatedAt(order);
    const createdHeader = await createMoralisOrderHeader({
      createdOn: {
        date: formatMoralisDate(createdAt),
        dateTime: formatMoralisDateTime(createdAt),
        year: createdAt.getFullYear(),
      },
      fiskalPaymentCode: getFiskalPaymentCode(order),
      sifPar: moralisCustomer.match.sifPar,
      sifPj: moralisCustomer.match.sifPj,
    });

    rawLog.orderHeader = createdHeader.raw;

    const lineItems = getMoralisLineItems(order);
    const createdLines = await createMoralisOrderLines({
      brDok: createdHeader.documentRef.brDok,
      intBr: createdHeader.documentRef.intBr,
      items: lineItems,
      posJed: createdHeader.posJed,
      salesUnitCode: createdHeader.salesUnitCode,
    });

    rawLog.orderLines = createdLines.raw;

    await updateMoralisState({
      data: {
        moralis: {
          brDok: createdHeader.documentRef.brDok,
          customerKey: moralisCustomer.customerKey,
          customerType: moralisCustomer.customerType,
          failedAt: null,
          intBr: createdHeader.documentRef.intBr,
          lastError: "",
          raw: rawLog,
          sifPar: moralisCustomer.match.sifPar,
          sifPj: moralisCustomer.match.sifPj,
          status: "synced",
          syncedAt: new Date().toISOString(),
        },
      },
      order,
      req,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Moralis order sync failed.";

    try {
      await updateMoralisState({
        data: {
          moralis: {
            ...asRecord(order.moralis),
            failedAt: new Date().toISOString(),
            lastError: message,
            raw: rawLog,
            status: "failed",
          },
        },
        order,
        req,
      });
    } catch (persistError) {
      const persistMessage =
        persistError instanceof Error ? persistError.message : "Unable to persist Moralis failure state.";

      req.payload.logger.error(
        `Moralis order sync persistence failed for order ${order.id}: ${persistMessage}`,
      );
    }
  }
}
