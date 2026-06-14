"use client";

import type { ReactNode } from "react";
import { GearIcon, Popup, useTranslation } from "@payloadcms/ui";

type RitualSettingsMenuButtonProps = {
  settingsMenu: ReactNode[];
};

export function RitualSettingsMenuButton({
  settingsMenu,
}: RitualSettingsMenuButtonProps) {
  const { t } = useTranslation();

  if (!settingsMenu || settingsMenu.length === 0) {
    return null;
  }

  return (
    <Popup
      button={<GearIcon ariaLabel={t("general:menu")} />}
      className="settings-menu-button"
      horizontalAlign="left"
      id="settings-menu"
      size="small"
      verticalAlign="bottom"
    >
      {settingsMenu.map((item, index) => (
        <div key={`settings-menu-item-${index}`}>{item}</div>
      ))}
    </Popup>
  );
}
