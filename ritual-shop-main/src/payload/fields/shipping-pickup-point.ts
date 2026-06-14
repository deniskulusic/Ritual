import type { Field } from "payload";

import { localizedLabel } from "../shared/admin-copy";

export const shippingPickupPointFields = (): Field[] => [
  {
    type: "row",
    fields: [
      {
        name: "id",
        type: "text",
        label: localizedLabel("ID", "ID"),
      },
      {
        name: "externalId",
        type: "text",
        label: localizedLabel("External ID", "Vanjski ID"),
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "name",
        type: "text",
        label: localizedLabel("Name", "Naziv"),
      },
      {
        name: "type",
        type: "text",
        label: localizedLabel("Type", "Vrsta"),
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "addressLine1",
        type: "text",
        label: localizedLabel("Address line 1", "Adresa 1"),
      },
      {
        name: "postalCode",
        type: "text",
        label: localizedLabel("Postal code", "Poštanski broj"),
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "city",
        type: "text",
        label: localizedLabel("City", "Grad"),
      },
      {
        name: "country",
        type: "text",
        label: localizedLabel("Country", "Država"),
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "size",
        type: "text",
        label: localizedLabel("Size", "Veličina"),
      },
      {
        name: "latitude",
        type: "number",
        label: localizedLabel("Latitude", "Geografska širina"),
      },
      {
        name: "longitude",
        type: "number",
        label: localizedLabel("Longitude", "Geografska dužina"),
      },
    ],
  },
  {
    name: "raw",
    type: "json",
    label: localizedLabel("Raw data", "Izvorni podaci"),
  },
];
