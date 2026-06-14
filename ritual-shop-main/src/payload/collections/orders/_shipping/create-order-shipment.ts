import { Buffer } from "node:buffer";

import type { PayloadRequest } from "payload";

import type { Customer, Order, Product, SiteSetting } from "../../../../../payload-types";

type OrderAddress = NonNullable<Order["shippingAddress"]>;
type ShipmentCreationResult = {
  raw: Record<string, unknown>;
  status: string;
  trackingCode: null | string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function normalizeCountryCode(country: null | string | undefined) {
  const normalized = (country ?? "").trim().toUpperCase();

  if (!normalized || normalized === "CROATIA" || normalized === "HRVATSKA") {
    return "HR";
  }

  return normalized.length === 2 ? normalized : "HR";
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function formatAmount(value: null | number | undefined) {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return "0.00";
  }

  return numericValue.toFixed(2);
}

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getShippingAddress(order: Order) {
  return asRecord(order.shippingAddress) as OrderAddress;
}

function getBillingAddress(order: Order) {
  return asRecord(order.billingAddress) as OrderAddress;
}

function getFirstEntry(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

function getParcelRecord(value: unknown) {
  return asRecord(getFirstEntry(value));
}

function isCashOnDeliveryOrder(order: Order) {
  return getText(order.payment?.method) === "cash";
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

function getRecipientContact(order: Order, customer: Customer | null) {
  const shippingAddress = getShippingAddress(order);
  const billingAddress = getBillingAddress(order);
  const fullName = [shippingAddress.firstName, shippingAddress.lastName].filter(Boolean).join(" ").trim();

  return {
    email:
      getText(order.guestEmail) ||
      getText(customer?.email) ||
      "",
    name:
      fullName ||
      [billingAddress.firstName, billingAddress.lastName].filter(Boolean).join(" ").trim() ||
      [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim() ||
      "Kupac",
    phone:
      getText(shippingAddress.phone) ||
      getText(billingAddress.phone) ||
      getText(customer?.phone) ||
      "",
  };
}

function parseWeightLabelToKilograms(label: unknown) {
  const value = getText(label).toLowerCase();

  if (!value) {
    return null;
  }

  const match = value.match(/(\d+(?:[.,]\d+)?)/);

  if (!match) {
    return null;
  }

  const numericValue = Number.parseFloat(match[1].replace(",", "."));

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  if (value.includes("kg")) {
    return numericValue;
  }

  if (value.includes("g")) {
    return numericValue / 1000;
  }

  return null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getProductDetails(product: Product | null) {
  if (!product) {
    return {};
  }

  switch (product.productType) {
    case "single_serve_beverage":
      return asRecord(product.singleServeDetails);
    case "packaged_coffee":
      return asRecord(product.packagedCoffeeDetails);
    case "equipment":
      return asRecord(product.equipmentDetails);
    case "accessory":
      return asRecord(product.accessoryDetails);
    case "drink_mix_ingredient":
      return asRecord(product.drinkMixDetails);
    case "technical_consumable":
      return asRecord(product.technicalConsumableDetails);
    case "tea_matcha":
      return asRecord(product.teaMatchaDetails);
    case "cold_beverage_concentrate":
      return asRecord(product.coldBeverageDetails);
    case "confectionery_snack":
      return asRecord(product.confectioneryDetails);
    default:
      return {};
  }
}

function resolveProductWeightKg(product: Product | null) {
  const details = getProductDetails(product);
  const netContent = asRecord(details.netContent);
  const amount = getNumber(netContent.amount);
  const unit = getText(netContent.unit).toLowerCase();
  const displayWeight = parseWeightLabelToKilograms(netContent.display);

  if (displayWeight) {
    return displayWeight;
  }

  if (!amount) {
    return null;
  }

  if (unit === "kg") {
    return amount;
  }

  if (unit === "g") {
    return amount / 1000;
  }

  return null;
}

async function estimateOrderWeightKg(req: PayloadRequest, order: Order) {
  const uniqueProductIds = Array.from(
    new Set(
      order.items
        .map((item) =>
          typeof item.product === "number"
            ? item.product
            : item.product && typeof item.product === "object" && "id" in item.product
              ? Number(item.product.id)
              : null,
        )
        .filter((value): value is number => Number.isFinite(value)),
    ),
  );

  const products = await Promise.all(
    uniqueProductIds.map(async (productId) => {
      try {
        const product = (await req.payload.findByID({
          collection: "products",
          depth: 0,
          id: productId,
          req,
        })) as Product;

        return [productId, product] as const;
      } catch {
        return [productId, null] as const;
      }
    }),
  );

  const productsById = new Map(products);
  let totalWeight = 0;

  for (const item of order.items) {
    const productId =
      typeof item.product === "number"
        ? item.product
        : item.product && typeof item.product === "object" && "id" in item.product
          ? Number(item.product.id)
          : null;
    const product = productId ? (productsById.get(productId) ?? null) : null;
    const parsedWeight = resolveProductWeightKg(product);

    totalWeight += (parsedWeight ?? 0.25) * Number(item.quantity ?? 1);
  }

  return Math.max(0.25, Number(totalWeight.toFixed(2)));
}

async function loadSiteSettings(req: PayloadRequest) {
  return (await req.payload.findGlobal({
    depth: 0,
    req,
    slug: "site-settings",
  })) as SiteSetting;
}

async function createGlsShipment(
  req: PayloadRequest,
  order: Order,
  siteSettings: SiteSetting,
): Promise<ShipmentCreationResult> {
  const config = siteSettings.gls;
  const shippingAddress = getShippingAddress(order);
  const recipient = getRecipientContact(order, await getCustomer(req, order));
  const apiBaseUrl = getText(config?.apiBaseUrl);
  const userName = getText(config?.username);
  const password = getText(config?.password);
  const shipperContactId = getText(config?.clientNumber) || userName;

  if (!apiBaseUrl || !userName || !password || !shipperContactId) {
    throw new Error("GLS konfiguracija nije potpuna.");
  }

  const totalWeight = await estimateOrderWeightKg(req, order);
  const isCashOnDelivery = isCashOnDeliveryOrder(order);
  const codAmount = formatAmount(order.totals?.grandTotal);
  const middleware = getText(siteSettings.siteName) || "Ritual Shop";
  const productCode = getText(config?.serviceCode).toUpperCase() || "PARCEL";
  const shipmentUrl = (() => {
    const sanitizedUrl = apiBaseUrl.replace(/\/+$/, "");

    return /^https?:\/\/[^/]+$/i.test(sanitizedUrl)
      ? joinUrl(sanitizedUrl, "/backend/rs/shipments")
      : sanitizedUrl;
  })();
  const response = await fetch(shipmentUrl, {
    body: JSON.stringify({
      Shipment: {
        Consignee: {
          Address: {
            City: getText(shippingAddress.city),
            CountryCode: normalizeCountryCode(getText(shippingAddress.country)),
            MobilePhoneNumber: recipient.phone || undefined,
            Name1: recipient.name,
            Street: getText(shippingAddress.addressLine1),
            StreetNumber: getText(shippingAddress.addressLine2) || undefined,
            ZIPCode: getText(shippingAddress.postalCode),
            eMail: recipient.email || undefined,
          },
        },
        Middleware: middleware,
        Product: productCode,
        ShipmentReference: [order.orderNumber],
        ShipmentUnit: [
          {
            Service: isCashOnDelivery
              ? [
                  {
                    Cash: {
                      Amount: codAmount,
                      Currency: "EUR",
                      Reason: `Narudžba ${order.orderNumber}`,
                      ServiceName: "service_cash",
                    },
                  },
                ]
              : undefined,
            ShipmentUnitReference: `${order.orderNumber}-1`,
            Weight: totalWeight,
          },
        ],
        Shipper: {
          ContactID: shipperContactId,
        },
        ShippingDate: new Date().toISOString().slice(0, 10),
      },
      PrintingOptions: {
        ReturnLabels: {
          LabelFormat: "PDF",
          TemplateSet: "NONE",
        },
      },
    }),
    headers: {
      Accept: "application/glsVersion1+json, application/json",
      Authorization: `Basic ${Buffer.from(`${userName}:${password}`).toString("base64")}`,
      "Content-Type": "application/glsVersion1+json",
    },
    method: "POST",
  });
  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok || payload.success === false) {
    throw new Error(getText(payload.message) || "GLS kreiranje pošiljke nije uspjelo.");
  }

  const createdShipment = asRecord(payload.CreatedShipment ?? payload.createdShipment);
  const parcelData = getParcelRecord(createdShipment.ParcelData ?? createdShipment.parcelData);
  const trackingCode = getText(parcelData.ParcelNumber) || getText(parcelData.TrackID) || null;

  return {
    raw: payload,
    status: "created",
    trackingCode,
  };
}

async function getBoxNowAccessToken(apiBaseUrl: string, clientId: string, clientSecret: string) {
  const tokenUrl = joinUrl(apiBaseUrl, "/auth-sessions");
  const response = await fetch(tokenUrl, {
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(getText(payload.message) || "BOX NOW autentikacija nije uspjela.");
  }

  const accessToken =
    getText(payload.access_token) ||
    getText(payload.accessToken) ||
    getText(payload.token);

  if (!accessToken) {
    throw new Error("BOX NOW nije vratio pristupni token.");
  }

  return accessToken;
}

async function createBoxNowShipment(
  req: PayloadRequest,
  order: Order,
  siteSettings: SiteSetting,
): Promise<ShipmentCreationResult> {
  const config = siteSettings.boxNow;
  const pickupPoint = asRecord(order.shipping?.pickupPoint);
  const recipient = getRecipientContact(order, await getCustomer(req, order));
  const apiBaseUrl = getText(config?.apiBaseUrl);
  const clientId = getText(config?.clientId);
  const clientSecret = getText(config?.clientSecret);
  const originId = getText(config?.originId);
  const typeOfService = getText(config?.typeOfService);

  if (!apiBaseUrl || !clientId || !clientSecret || !originId || !typeOfService) {
    throw new Error("BOX NOW konfiguracija nije potpuna.");
  }

  const destinationId = getText(pickupPoint.externalId) || getText(pickupPoint.id);

  if (!destinationId) {
    throw new Error("Nedostaje BOX NOW lokacija za dostavu.");
  }

  const token = await getBoxNowAccessToken(apiBaseUrl, clientId, clientSecret);
  const totalWeight = await estimateOrderWeightKg(req, order);
  const paymentMode =
    isCashOnDeliveryOrder(order) || getText(config?.paymentMode).toLowerCase() === "cod" ? "cod" : "prepaid";
  const amountToBeCollected = paymentMode === "cod" ? formatAmount(order.totals?.grandTotal) : "0.00";
  const invoiceValue = formatAmount(order.totals?.grandTotal);
  const configuredCompartmentSize =
    typeof config?.compartmentSize === "number" && Number.isFinite(config.compartmentSize)
      ? Math.trunc(config.compartmentSize)
      : null;

  if (originId === "any-apm" && !configuredCompartmentSize) {
    throw new Error("BOX NOW any-apm origin zahtijeva definiranu veličinu pretinca.");
  }

  const response = await fetch(joinUrl(apiBaseUrl, "/delivery-requests"), {
    body: JSON.stringify({
      allowReturn: false,
      amountToBeCollected,
      description: `Ritual order ${order.orderNumber}`,
      destination: {
        contactEmail: recipient.email || undefined,
        contactName: recipient.name,
        contactNumber: recipient.phone || undefined,
        locationId: destinationId,
      },
      invoiceValue,
      items: [
        {
          ...(configuredCompartmentSize ? { compartmentSize: configuredCompartmentSize } : {}),
          id: `${order.orderNumber}-1`,
          name: "Ritual order",
          value: invoiceValue,
          weight: totalWeight,
        },
      ],
      orderNumber: order.orderNumber,
      origin: {
        contactEmail: getText(siteSettings.primaryEmail),
        contactName: getText(siteSettings.siteName),
        contactNumber: getText(siteSettings.phone),
        locationId: originId,
      },
      paymentMode,
      typeOfService,
    }),
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(getText(payload.message) || "BOX NOW kreiranje pošiljke nije uspjelo.");
  }

  const parcels = Array.isArray(payload.parcels) ? payload.parcels : [];
  const firstParcel = getParcelRecord(parcels);
  const trackingCode = getText(firstParcel.id) || getText(payload.referenceNumber) || getText(payload.id) || null;

  return {
    raw: payload,
    status: "created",
    trackingCode,
  };
}

async function createCarrierShipment(req: PayloadRequest, order: Order, siteSettings: SiteSetting) {
  switch (order.shipping?.provider) {
    case "gls":
      return createGlsShipment(req, order, siteSettings);
    case "box-now":
      return createBoxNowShipment(req, order, siteSettings);
    default:
      throw new Error("Nepodržan pružatelj dostave.");
  }
}

function shouldCreateShipment(order: Order, previousOrder: null | Order | undefined, req: PayloadRequest) {
  if (req.context && typeof req.context === "object" && "skipShipmentSync" in req.context) {
    return false;
  }

  if (order.status !== "processing" || previousOrder?.status === "processing") {
    return false;
  }

  if (!order.shipping?.provider || !order.shipping?.method) {
    return false;
  }

  return true;
}

export async function syncOrderShipment(req: PayloadRequest, order: Order, previousOrder?: null | Order) {
  if (!shouldCreateShipment(order, previousOrder, req)) {
    return;
  }

  const siteSettings = await loadSiteSettings(req);

  req.context = {
    ...(req.context ?? {}),
    skipShipmentSync: true,
  };

  try {
    const result = await createCarrierShipment(req, order, siteSettings);

    await req.payload.update({
      collection: "orders",
      data: {
        shipping: {
          ...asRecord(order.shipping),
          raw: {
            ...asRecord(order.shipping?.raw),
            response: result.raw,
            shipmentCreatedAt: new Date().toISOString(),
          },
          status: result.status,
          trackingCode: result.trackingCode,
        },
      },
      id: order.id,
      req,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kreiranje pošiljke nije uspjelo.";

    await req.payload.update({
      collection: "orders",
      data: {
        shipping: {
          ...asRecord(order.shipping),
          raw: {
            ...asRecord(order.shipping?.raw),
            error: message,
            shipmentFailedAt: new Date().toISOString(),
          },
          status: "creation-failed",
        },
      },
      id: order.id,
      req,
    });
  }
}
