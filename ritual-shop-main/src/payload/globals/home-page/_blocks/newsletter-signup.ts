import type { Block } from "payload";

import { buildLinkFields } from "../../../fields/link";
import { localizedLabel } from "../../../shared/admin-copy";
import { internalLinkRelationTo } from "../../../shared/internal-link-relation-to";

export const NewsletterSignupBlock: Block = {
  slug: "newsletter-signup",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Newsletter Signup Blocks", "Blokovi prijave na newsletter"),
    singular: localizedLabel("Newsletter Signup", "Prijava na newsletter"),
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: localizedLabel("Eyebrow", "Nadnaslov"),
          admin: {
            width: "35%",
          },
        },
        {
          name: "title",
          type: "text",
          required: true,
          label: localizedLabel("Title", "Naslov"),
          admin: {
            width: "65%",
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "emailPlaceholder",
          type: "text",
          required: true,
          label: localizedLabel("Email placeholder", "Predložak e-mail polja"),
          admin: {
            width: "50%",
          },
        },
        {
          name: "submitLabel",
          type: "text",
          required: true,
          label: localizedLabel("Button label", "Oznaka gumba"),
          admin: {
            width: "50%",
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "disclaimerText",
          type: "text",
          required: true,
          label: localizedLabel("Disclaimer text", "Tekst napomene"),
          admin: {
            width: "50%",
          },
        },
        {
          name: "disclaimerLinkLabel",
          type: "text",
          required: true,
          label: localizedLabel("Disclaimer link label", "Oznaka poveznice napomene"),
          admin: {
            width: "50%",
          },
        },
      ],
    },
    ...buildLinkFields({
      dbNamePrefix: "disclaimer_link",
      namePrefix: "disclaimer",
      relationTo: internalLinkRelationTo,
    }),
  ],
};
