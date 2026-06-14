"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from "react";

import type {
  CheckoutOrderRequest,
  CheckoutOrderResponse,
} from "@/payload/collections/carts/contracts";
import { normalizePromoCodeInput } from "@/payload/collections/carts/promo-contract";
import {
  formatEuro,
  isLockerShippingMethod,
  type ShippingPickupPoint,
} from "@/payload/collections/carts/shipping-contract";

import { CartAddOverlay } from "./cart-add-overlay";
import { CartContext } from "./context";
import { deriveCartState } from "./derived-cart";
import { getFallbackItem } from "./fallback-item";
import {
  normalizeLocalCart,
  readStoredCart,
  cartStorageKey,
} from "./storage";
import type {
  CartAddOverlayState,
  CartProviderProps,
  CartQuote,
  LocalCart,
} from "./types";

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<LocalCart>({
    items: [],
    promoCode: null,
    shippingOptionId: null,
    shippingPickupPoint: null,
  });
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartAddOverlay, setCartAddOverlay] = useState<CartAddOverlayState | null>(null);
  const [isCheckoutPending, setIsCheckoutPending] = useState(false);
  const [isQuotePending, setIsQuotePending] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isSyncPending, setIsSyncPending] = useState(false);
  const [, startTransition] = useTransition();
  const quoteRequestRef = useRef(0);
  const syncRequestRef = useRef(0);
  const addOverlayPhaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeOverlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyingServerRef = useRef(false);
  const quoteAbortRef = useRef<AbortController | null>(null);
  const syncAbortRef = useRef<AbortController | null>(null);

  const applyQuotedCart = useEffectEvent((nextQuote: CartQuote) => {
    applyingServerRef.current = true;
    startTransition(() => {
      setCart(nextQuote.localCart);
      setQuote(nextQuote);
    });
  });

  const scheduleCartAddOverlayPhase = useEffectEvent((phase: CartAddOverlayState["phase"]) => {
    if (addOverlayPhaseTimeoutRef.current) {
      clearTimeout(addOverlayPhaseTimeoutRef.current);
    }

    addOverlayPhaseTimeoutRef.current = setTimeout(() => {
      setCartAddOverlay((current) =>
        current && current.phase === "loading"
          ? {
              ...current,
              phase,
            }
          : current,
      );
      addOverlayPhaseTimeoutRef.current = null;
    }, 350);
  });

  const requestCloseCartAddOverlay = useCallback(() => {
    if (addOverlayPhaseTimeoutRef.current) {
      clearTimeout(addOverlayPhaseTimeoutRef.current);
      addOverlayPhaseTimeoutRef.current = null;
    }

    if (closeOverlayTimeoutRef.current) {
      clearTimeout(closeOverlayTimeoutRef.current);
    }

    setCartAddOverlay((current) =>
      current
        ? {
            ...current,
            phase: current.phase === "error" ? "closing-error" : "closing-added",
          }
        : current,
    );

    closeOverlayTimeoutRef.current = setTimeout(() => {
      setCartAddOverlay(null);
      closeOverlayTimeoutRef.current = null;
    }, 350);
  }, []);

  const quoteCart = useEffectEvent(async (nextCart: LocalCart) => {
    const requestId = ++quoteRequestRef.current;
    quoteAbortRef.current?.abort();
    const controller = new AbortController();
    quoteAbortRef.current = controller;
    setIsQuotePending(true);

    try {
      const response = await fetch("/api/carts/quote", {
        body: JSON.stringify(nextCart),
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        if (requestId === quoteRequestRef.current) {
          scheduleCartAddOverlayPhase("error");
        }
        return;
      }

      const payload = (await response.json()) as { cart: CartQuote };

      if (requestId !== quoteRequestRef.current) {
        return;
      }

      applyQuotedCart(payload.cart);

      if (cartAddOverlay?.phase === "loading") {
        const overlayAdjustedOut = payload.cart.adjustments.some(
          (adjustment) =>
            adjustment.productSlug === cartAddOverlay.productSlug &&
            (adjustment.type === "removed" || adjustment.type === "unavailable"),
        );
        const overlayStillPresent = payload.cart.localCart.items.some(
          (item) => item.productSlug === cartAddOverlay.productSlug,
        );

        scheduleCartAddOverlayPhase(
          overlayAdjustedOut || !overlayStillPresent ? "error" : "added",
        );
      }
    } catch {
      if (controller.signal.aborted) {
        return;
      }

      if (requestId === quoteRequestRef.current) {
        scheduleCartAddOverlayPhase("error");
      }
    } finally {
      if (quoteAbortRef.current === controller) {
        quoteAbortRef.current = null;
      }

      if (requestId === quoteRequestRef.current) {
        setIsQuotePending(false);
      }
    }
  });

  const syncCart = useEffectEvent(async (nextCart: LocalCart, applyResult = false) => {
    const requestId = ++syncRequestRef.current;
    syncAbortRef.current?.abort();
    const controller = new AbortController();
    syncAbortRef.current = controller;
    setIsSyncPending(true);

    try {
      const response = await fetch("/api/carts/sync", {
        body: JSON.stringify(nextCart),
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: controller.signal,
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (!response.ok) {
        return;
      }

      if (!applyResult) {
        return;
      }

      const payload = (await response.json()) as { cart: CartQuote; isAuthenticated: boolean };

      if (requestId !== syncRequestRef.current) {
        return;
      }

      setIsAuthenticated(payload.isAuthenticated);
      applyQuotedCart(payload.cart);
    } catch {
      if (controller.signal.aborted) {
        return;
      }
    } finally {
      if (syncAbortRef.current === controller) {
        syncAbortRef.current = null;
      }

      if (requestId === syncRequestRef.current) {
        setIsSyncPending(false);
      }
    }
  });

  const placeOrder = useCallback(
    async (input: Omit<CheckoutOrderRequest, "cart">): Promise<CheckoutOrderResponse> => {
      setIsCheckoutPending(true);

      try {
        const response = await fetch("/api/carts/checkout", {
          body: JSON.stringify({
            ...input,
            cart,
          }),
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const payload = (await response.json()) as
          | ({ error?: string } & Partial<CheckoutOrderResponse>)
          | undefined;

        if (!response.ok) {
          throw new Error(payload?.error || "Narudžbu trenutno nije moguće dovršiti.");
        }

        applyingServerRef.current = true;
        startTransition(() => {
          setCart({
            items: [],
            promoCode: null,
            shippingOptionId: null,
            shippingPickupPoint: null,
          });
          if (closeOverlayTimeoutRef.current) {
            clearTimeout(closeOverlayTimeoutRef.current);
            closeOverlayTimeoutRef.current = null;
          }
          setCartAddOverlay(null);
          setQuote(null);
        });

        return payload as CheckoutOrderResponse;
      } finally {
        setIsCheckoutPending(false);
      }
    },
    [cart, startTransition],
  );

  useEffect(() => {
    const storedCart = readStoredCart();

    setCart(storedCart);
    setHasHydrated(true);

    let cancelled = false;
    const controller = new AbortController();

    void (async () => {
      try {
        const response = await fetch("/api/carts/active", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok || cancelled) {
          if (storedCart.items.length > 0) {
            await quoteCart(storedCart);
          }
          return;
        }

        const payload = (await response.json()) as {
          cart: CartQuote | null;
          isAuthenticated: boolean;
        };

        if (cancelled) {
          return;
        }

        setIsAuthenticated(payload.isAuthenticated);

        if (payload.isAuthenticated && storedCart.items.length > 0) {
          await syncCart(storedCart, true);
          return;
        }

        if (payload.cart) {
          applyQuotedCart(payload.cart);
          return;
        }

        if (storedCart.items.length > 0) {
          await quoteCart(storedCart);
        }
      } catch {
        if (controller.signal.aborted) {
          return;
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      quoteAbortRef.current?.abort();
      syncAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));

    if (isRestoring) {
      return;
    }

    if (applyingServerRef.current) {
      applyingServerRef.current = false;
      return;
    }

    void quoteCart(cart);

    if (isAuthenticated) {
      void syncCart(cart);
    }
  }, [cart, hasHydrated, isAuthenticated, isRestoring]);

  useEffect(() => {
    return () => {
      if (addOverlayPhaseTimeoutRef.current) {
        clearTimeout(addOverlayPhaseTimeoutRef.current);
        addOverlayPhaseTimeoutRef.current = null;
      }

      if (closeOverlayTimeoutRef.current) {
        clearTimeout(closeOverlayTimeoutRef.current);
        closeOverlayTimeoutRef.current = null;
      }
    };
  }, []);

  const {
    adjustments,
    boxNowWidgetConfig,
    cartItems,
    itemCount,
    promoCodeError,
    promotion,
    selectedShippingOption,
    shippingOptions,
    shippingPickupPoint,
    totals,
  } = deriveCartState(cart, quote);
  const isAddPending = cartAddOverlay?.phase === "loading";
  const activeAddProductSlug = isAddPending ? cartAddOverlay.productSlug : null;
  const overlayProduct = cartAddOverlay
    ? (() => {
        const currentItem = cartItems.find((item) => item.productSlug === cartAddOverlay.productSlug);

        if (currentItem) {
          return currentItem;
        }

        const quotedItem = quote?.items.find((item) => item.productSlug === cartAddOverlay.productSlug);

        if (quotedItem) {
          return {
            image: quotedItem.image,
            lineTotal: quotedItem.lineTotal,
            maxQuantity: quotedItem.maxQuantity ?? quotedItem.quantity,
            priceLabel: quotedItem.priceLabel,
            productSlug: quotedItem.productSlug,
            quantity: quotedItem.quantity,
            title: quotedItem.title,
            totalLabel: quotedItem.totalLabel,
            unitPrice: quotedItem.unitPrice,
          };
        }

        const fallbackItem = getFallbackItem(cartAddOverlay.productSlug);
        const fallbackQuantity = cartAddOverlay.quantityAdded;
        const fallbackLineTotal = fallbackItem.unitPrice * fallbackQuantity;

        return {
          image: fallbackItem.image,
          lineTotal: fallbackLineTotal,
          maxQuantity: fallbackQuantity,
          priceLabel: fallbackItem.priceLabel,
          productSlug: cartAddOverlay.productSlug,
          quantity: fallbackQuantity,
          title: fallbackItem.title,
          totalLabel: formatEuro(fallbackLineTotal),
          unitPrice: fallbackItem.unitPrice,
        };
      })()
    : null;

  function addItem(productSlug: string, quantity = 1) {
    if (addOverlayPhaseTimeoutRef.current) {
      clearTimeout(addOverlayPhaseTimeoutRef.current);
      addOverlayPhaseTimeoutRef.current = null;
    }

    if (closeOverlayTimeoutRef.current) {
      clearTimeout(closeOverlayTimeoutRef.current);
      closeOverlayTimeoutRef.current = null;
    }

    setCartAddOverlay({
      phase: "loading",
      productSlug,
      quantityAdded: quantity,
    });
    setCart((currentCart) => {
      const existingItem = currentCart.items.find((item) => item.productSlug === productSlug);

      if (!existingItem) {
        return normalizeLocalCart({
          ...currentCart,
          items: [...currentCart.items, { productSlug, quantity }],
        });
      }

      return normalizeLocalCart({
        ...currentCart,
        items: currentCart.items.map((item) =>
          item.productSlug === productSlug
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item,
        ),
      });
    });
  }

  function updateItemQuantity(productSlug: string, quantity: number) {
    setCart((currentCart) =>
      normalizeLocalCart({
        ...currentCart,
        items: currentCart.items.map((item) =>
          item.productSlug === productSlug
            ? {
                ...item,
                quantity,
              }
            : item,
        ),
      }),
    );
  }

  function removeItem(productSlug: string) {
    setCart((currentCart) => ({
      ...currentCart,
      items: currentCart.items.filter((item) => item.productSlug !== productSlug),
    }));
  }

  function applyPromoCode(code: string) {
    setCart((currentCart) =>
      normalizeLocalCart({
        ...currentCart,
        promoCode: normalizePromoCodeInput(code),
      }),
    );
  }

  function removePromoCode() {
    setCart((currentCart) =>
      normalizeLocalCart({
        ...currentCart,
        promoCode: null,
      }),
    );
  }

  function selectShippingOption(shippingOptionId: string) {
    setCart((currentCart) =>
      normalizeLocalCart({
        ...currentCart,
        shippingOptionId,
        shippingPickupPoint: isLockerShippingMethod(shippingOptionId)
          ? currentCart.shippingPickupPoint
          : null,
      }),
    );
  }

  function selectShippingPickupPoint(pickupPoint: null | ShippingPickupPoint) {
    setCart((currentCart) =>
      normalizeLocalCart({
        ...currentCart,
        shippingPickupPoint: pickupPoint,
      }),
    );
  }

  return (
    <CartContext.Provider
      value={{
        activeAddProductSlug,
        adjustments,
        addItem,
        applyPromoCode,
        isAddPending,
        cartItems,
        hasHydrated,
        isAuthenticated,
        isCheckoutPending,
        isQuotePending,
        isRestoring,
        isSyncPending,
        itemCount,
        placeOrder,
        promoCodeError,
        promotion,
        removeItem,
        removePromoCode,
        boxNowWidgetConfig,
        selectShippingPickupPoint,
        selectShippingOption,
        selectedShippingOption,
        shippingPickupPoint,
        shippingOptions,
        totals,
        updateItemQuantity,
      }}
    >
      {children}
      <CartAddOverlay
        itemCount={itemCount}
        onClose={requestCloseCartAddOverlay}
        overlay={cartAddOverlay}
        product={overlayProduct}
        subtotalLabel={totals.subtotalLabel}
      />
    </CartContext.Provider>
  );
}

export { useCart } from "./context";
