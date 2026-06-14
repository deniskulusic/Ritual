import type { PayloadRequest } from "payload";

import type { Cart, Order, Product } from "../../../../../payload-types";
import type {
  CheckoutAddressInput,
  CheckoutBuyerInput,
  CheckoutPaymentMethodId,
} from "../contracts";
import type { CartQuote } from "../quote-cart";
import type { CompleteCheckoutInput } from "./input";

type OrderAddress = NonNullable<Order["billingAddress"]>;
type CheckoutShippingOption = CartQuote["shippingOptions"][number];

const paymentLabels: Record<CheckoutPaymentMethodId, string> = {
  bank: "Virman",
  card: "Kartično plaćanje",
  cash: "Plaćanje pouzećem",
};

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toOrderAddress(address: CheckoutAddressInput): OrderAddress {
  const isBusiness = !!address.isBusiness;

  return {
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || "",
    city: address.city,
    company: isBusiness ? address.company || "" : "",
    country: address.country,
    firstName: address.firstName,
    isBusiness,
    lastName: address.lastName,
    phone: address.phone || "",
    postalCode: address.postalCode,
    region: address.region || "",
    taxId: isBusiness ? address.taxId || "" : "",
  };
}

function buildLockerShippingAddress(
  buyer: CheckoutBuyerInput,
  billingAddress: CheckoutAddressInput,
  pickupPoint: Record<string, unknown>,
): OrderAddress {
  return {
    addressLine1: getText(pickupPoint.addressLine1),
    addressLine2: "",
    city: getText(pickupPoint.city),
    company: "",
    country: getText(pickupPoint.country) || billingAddress.country,
    firstName: buyer.firstName,
    isBusiness: false,
    lastName: buyer.lastName,
    phone: buyer.phone,
    postalCode: getText(pickupPoint.postalCode),
    region: billingAddress.region || "",
    taxId: "",
  };
}

function getInitialOrderStatus(paymentMethodId: CheckoutPaymentMethodId) {
  return paymentMethodId === "cash" ? "pending" : "awaiting-payment";
}

function getInitialPaymentStatus(paymentMethodId: CheckoutPaymentMethodId) {
  return paymentMethodId === "cash" ? "pending" : "awaiting-payment";
}

async function findActiveCart(req: PayloadRequest) {
  if (req.user?.collection !== "customers") {
    return null;
  }

  const result = await req.payload.find({
    collection: "carts",
    depth: 0,
    limit: 1,
    req,
    sort: "-updatedAt",
    where: {
      and: [
        {
          customer: {
            equals: req.user.id,
          },
        },
        {
          status: {
            equals: "active",
          },
        },
      ],
    },
  });

  return (result.docs[0] as Cart | undefined) ?? null;
}

async function getProductsById(req: PayloadRequest, ids: number[]) {
  if (ids.length === 0) {
    return new Map<number, Product>();
  }

  const result = await req.payload.find({
    collection: "products",
    depth: 0,
    limit: ids.length,
    pagination: false,
    req,
    where: {
      id: {
        in: ids,
      },
    },
  });

  return new Map((result.docs as Product[]).map((product) => [product.id, product]));
}

export async function createCheckoutOrder(args: {
  cart: CartQuote;
  input: CompleteCheckoutInput;
  pickupPoint: Record<string, unknown>;
  req: PayloadRequest;
  selectedShipping: CheckoutShippingOption;
}): Promise<Order> {
  const { cart, input, pickupPoint, req, selectedShipping } = args;
  const productsById = await getProductsById(
    req,
    cart.items.map((item) => item.productId),
  );
  const orderStatus = getInitialOrderStatus(input.paymentMethodId);
  const shippingAddress =
    selectedShipping.kind === "locker"
      ? buildLockerShippingAddress(input.buyer, input.billingAddress, pickupPoint)
      : toOrderAddress(input.shippingAddress!);
  const billingAddress = toOrderAddress(input.billingAddress);

  const order = (await req.payload.create({
    collection: "orders",
    data: {
      billingAddress,
      customer: req.user?.collection === "customers" ? req.user.id : undefined,
      guestEmail: req.user?.collection === "customers" ? undefined : input.buyer.email,
      items: cart.items.map((item) => {
        const product = productsById.get(item.productId);
        const moralis = asRecord(product?.moralis);

        return {
          brandName: getText(product?.brand),
          discountPercent: item.discountPercent,
          discountTotal: item.discountTotal,
          finalLineTotal: item.finalLineTotal,
          itemID: getText(moralis.itemID),
          lineTotal: item.lineTotal,
          product: item.productId,
          productType: getText(product?.productType),
          quantity: item.quantity,
          sku: getText(moralis.sku),
          title: item.title,
          unitPrice: item.unitPrice,
        };
      }),
      promotion: cart.promotion
        ? {
            code: cart.promotion.code,
            description: cart.promotion.description,
            discount: cart.totals.discount,
            discountType: cart.promotion.discountType,
            discountValue: cart.promotion.discountValue,
            eligibleSubtotal: cart.promotion.eligibleSubtotal,
            name: cart.promotion.name,
            scope: cart.promotion.scope,
          }
        : undefined,
      orderNumber: "",
      payment: {
        amount: cart.totals.grandTotal,
        kind: "manual",
        label: paymentLabels[input.paymentMethodId],
        method: input.paymentMethodId,
        provider: "manual",
        status: getInitialPaymentStatus(input.paymentMethodId),
      },
      shipping: {
        method: selectedShipping.id,
        pickupPoint: selectedShipping.requiresPickupPoint ? pickupPoint : undefined,
        price: cart.totals.shipping,
        provider: selectedShipping.provider,
        status: "pending",
        trackingCode: null,
      },
      shippingAddress,
      status: orderStatus,
      statusTimeline: [
        {
          at: new Date().toISOString(),
          note: "Narudžba je kreirana kroz checkout.",
          status: orderStatus,
        },
      ],
      totals: {
        discount: cart.totals.discount,
        grandTotal: cart.totals.grandTotal,
        shipping: cart.totals.shipping,
        subtotal: cart.totals.subtotal,
      },
    },
    draft: false,
    req,
  })) as Order;

  const activeCart = await findActiveCart(req);

  if (activeCart) {
    await req.payload.update({
      collection: "carts",
      data: {
        status: "converted",
      },
      id: activeCart.id,
      req,
    });
  }

  return order;
}
