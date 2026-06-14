"use client";

import { useEffect, useId, useState } from "react";

import type {
  BoxNowWidgetConfig,
  ShippingPickupPoint,
} from "@/payload/collections/carts/shipping-contract";
import styles from "./checkout.module.css";

type BoxNowLockerSelectorProps = {
  onSelectPickupPoint: (pickupPoint: ShippingPickupPoint) => void;
  pickupPoint: null | ShippingPickupPoint;
  widgetConfig: BoxNowWidgetConfig | null;
};

type BoxNowWidgetSelection = Record<string, unknown>;

declare global {
  interface Window {
    _bn_map_widget_config?: Record<string, unknown>;
  }
}

function pickString(source: BoxNowWidgetSelection, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function normalizeWidgetPickupPoint(selection: BoxNowWidgetSelection): null | ShippingPickupPoint {
  const id = pickString(selection, ["boxnowLockerId", "lockerId", "id"]);
  const addressLine1 = pickString(selection, ["boxnowLockerAddressLine1", "boxnowLockerAddress", "addressLine1"]);
  const postalCode = pickString(selection, ["boxnowLockerPostalCode", "postalCode", "zip"]);
  const city = pickString(selection, [
    "boxnowLockerCity",
    "boxnowLockerCityName",
    "city",
    "boxnowLockerRegion",
    "region",
  ]);
  const name =
    pickString(selection, [
      "boxnowLockerName",
      "boxnowLockerDescription",
      "boxnowLockerTitle",
      "name",
      "title",
    ]) || addressLine1;

  if (!id || !addressLine1 || !postalCode) {
    return null;
  }

  return {
    addressLine1,
    city: city || postalCode,
    country: pickString(selection, ["boxnowLockerCountry", "country", "countryCode"]) || "HR",
    externalId: id,
    id,
    latitude:
      typeof selection.boxnowLockerLatitude === "number"
        ? selection.boxnowLockerLatitude
        : typeof selection.latitude === "number"
          ? selection.latitude
          : null,
    longitude:
      typeof selection.boxnowLockerLongitude === "number"
        ? selection.boxnowLockerLongitude
        : typeof selection.longitude === "number"
          ? selection.longitude
          : null,
    name,
    postalCode,
    raw: selection,
    size: pickString(selection, ["boxnowLockerSize", "size"]) || null,
    type: pickString(selection, ["boxnowLockerType", "type"]) || "locker",
  };
}

export function BoxNowLockerSelector({
  onSelectPickupPoint,
  pickupPoint,
  widgetConfig,
}: BoxNowLockerSelectorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [widgetError, setWidgetError] = useState<null | string>(null);
  const widgetContainerId = useId().replace(/:/g, "");
  const hasWidgetConfig = !!widgetConfig?.partnerId && !!widgetConfig?.widgetScriptUrl;
  const parsedPartnerId = widgetConfig?.partnerId ? Number.parseInt(widgetConfig.partnerId, 10) : Number.NaN;
  const partnerId = Number.isFinite(parsedPartnerId) ? parsedPartnerId : widgetConfig?.partnerId;

  useEffect(() => {
    if (!pickerOpen || !hasWidgetConfig) {
      return;
    }

    const parentElement = `#${widgetContainerId}`;
    const scriptId = `boxnow-widget-script-${widgetContainerId}`;
    const existingScript = document.getElementById(scriptId);

    document.getElementById(widgetContainerId)?.replaceChildren();
    setWidgetError(null);

    window._bn_map_widget_config = {
      afterSelect: (selected: BoxNowWidgetSelection) => {
        const normalizedSelection = normalizeWidgetPickupPoint(selected);

        if (!normalizedSelection) {
          setWidgetError("Odabir paketomata nije moguće spremiti. Pokušaj ponovno.");
          return;
        }

        onSelectPickupPoint(normalizedSelection);
        setPickerOpen(false);
      },
      autoclose: true,
      gps: true,
      parentElement,
      partnerId,
      type: "iframe",
    };

    existingScript?.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = widgetConfig?.widgetScriptUrl ?? "";
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setWidgetError("BOX NOW karta trenutno nije dostupna.");
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
      document.getElementById(widgetContainerId)?.replaceChildren();
    };
  }, [hasWidgetConfig, onSelectPickupPoint, partnerId, pickerOpen, widgetConfig, widgetContainerId]);

  return (
    <div className={styles.lockerSelector}>
      <div className={styles.lockerHeader}>
        <div>
          <h4>{pickupPoint ? pickupPoint.name : "Paketomat nije odabran"}</h4>
          <p>
            {pickupPoint
              ? `${pickupPoint.addressLine1}, ${pickupPoint.postalCode} ${pickupPoint.city}`
              : "Odaberi paketomat za BOX NOW dostavu."}
          </p>
        </div>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => setPickerOpen((current) => !current)}
        >
          {pickupPoint ? "Promijeni paketomat" : "Odaberi paketomat"}
        </button>
      </div>
      {pickerOpen ? (
        hasWidgetConfig ? (
          <div className={styles.lockerWidgetArea}>
            <div id={widgetContainerId} className={styles.lockerWidgetFrame} />
            {widgetError ? <p className={styles.lockerWidgetNotice}>{widgetError}</p> : null}
          </div>
        ) : (
          <p className={styles.lockerWidgetNotice}>
            BOX NOW trenutno nije dostupan jer widget nije konfiguriran.
          </p>
        )
      ) : null}
    </div>
  );
}
