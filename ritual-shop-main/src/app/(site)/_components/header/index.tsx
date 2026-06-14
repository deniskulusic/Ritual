"use client";
/* eslint-disable @next/next/no-img-element */

import { usePathname, useRouter } from "next/navigation";
import {
  type CSSProperties,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useCart } from "../cart-provider";
import { HeaderActions } from "./actions";
import { DesktopNav } from "./desktop-nav";
import { LanguageOverlay } from "./language-overlay";
import { MobileMenu } from "./mobile-menu";
import { SearchOverlay } from "./search-overlay";
import { HeaderSvgDefs } from "./svg-defs";
import styles from "./header.module.css";
import type { HeaderProps } from "./types";
import { useEntrance } from "../entrance-provider";
import gsap from "gsap";

export function Header({ header }: HeaderProps) {
  const { isEntranceReady } = useEntrance();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const isInnerRoute = pathname !== "/";
  const headerRef = useRef<HTMLDivElement | null>(null);
  const innerHeaderRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const navListRef = useRef<HTMLUListElement | null>(null);
  const megaMenuCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [desktopLanguageOpen, setDesktopLanguageOpen] = useState(false);
  const [mobileLanguageOpen, setMobileLanguageOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchClosing, setSearchClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [megaMenuIndex, setMegaMenuIndex] = useState<number | null>(null);
  const [underline, setUnderline] = useState({
    left: 0,
    width: 0,
    visible: false,
  });

  const activeIndex = useMemo(() => {
    const resolvedIndex = header.primaryNavigation.findIndex(
      (item) => item.link?.kind === "internal" && item.link.href === pathname,
    );

    return resolvedIndex >= 0 ? resolvedIndex : null;
  }, [header.primaryNavigation, pathname]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    setMobileLanguageOpen(false);
    setMobileMenuClosing(true);

    mobileCloseTimeout.current = setTimeout(() => {
      setMobileMenuClosing(false);
    }, 475);
  }, []);

  const openSearch = useCallback(() => {
    if (searchCloseTimeout.current) {
      clearTimeout(searchCloseTimeout.current);
    }

    setSearchClosing(false);
    setSearchOpen(true);
    setDesktopLanguageOpen(false);
    setMobileMenuOpen(false);
    setMobileMenuClosing(false);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchClosing(true);

    if (searchCloseTimeout.current) {
      clearTimeout(searchCloseTimeout.current);
    }

    searchCloseTimeout.current = setTimeout(() => {
      setSearchClosing(false);
      setSearchQuery("");
    }, 450);
  }, []);

  useEffect(() => {
    const updateHeaderState = () => {
      const nextScrolled = window.scrollY > 0;
      setScrolled(nextScrolled);

      const innerHeight = innerHeaderRef.current?.offsetHeight ?? (window.innerWidth <= 1024 ? 100 : 130);
      const headerHeight = innerHeight;

      const isPastHero = window.scrollY > (window.innerHeight - headerHeight);
      setPastHero(isPastHero);

      const shopSection = document.getElementById("home-shop-grid");
      if (!shopSection) {
        setHideHeader(false);
        return;
      }

      const rect = shopSection.getBoundingClientRect();
      const shouldHide = rect.top <= headerHeight && rect.bottom > headerHeight;
      setHideHeader(shouldHide);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    window.addEventListener("resize", updateHeaderState);

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
      window.removeEventListener("resize", updateHeaderState);
    };
  }, []);

  useEffect(() => {
    if (!isEntranceReady || !headerRef.current) return;

    const ctx = gsap.context(() => {
      // Ensure the header is above everything (including the hero) exactly when triggered
      gsap.set(headerRef.current, { zIndex: 10000000 });

      gsap.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 1, ease: "power3.out", clearProps: "transform" }
      );
    });

    return () => ctx.revert();
  }, [isEntranceReady]);

  useEffect(() => {
    const syncUnderline = (index: number | null) => {
      if (index === null) {
        setUnderline((previous) => ({ ...previous, visible: false }));
        return;
      }

      const current = itemRefs.current[index];
      const navList = navListRef.current;

      if (!current || !navList || window.innerWidth <= 1024) {
        setUnderline((previous) => ({ ...previous, visible: false }));
        return;
      }

      setUnderline({
        left: current.offsetLeft,
        width: current.offsetWidth,
        visible: true,
      });
    };

    syncUnderline(activeIndex);
    const handleResize = () => syncUnderline(activeIndex);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex]);

  useEffect(() => {
    const shouldLockBody = desktopLanguageOpen || mobileMenuOpen || searchOpen || searchClosing;

    document.body.style.overflow = shouldLockBody ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [desktopLanguageOpen, mobileMenuClosing, mobileMenuOpen, searchClosing, searchOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setDesktopLanguageOpen(false);
      setMobileLanguageOpen(false);
      if (mobileMenuOpen) {
        closeMobileMenu();
      }
      if (searchOpen) {
        closeSearch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMobileMenu, closeSearch, mobileMenuOpen, searchOpen]);

  useEffect(() => {
    return () => {
      if (megaMenuCloseTimeout.current) {
        clearTimeout(megaMenuCloseTimeout.current);
      }
      if (searchCloseTimeout.current) {
        clearTimeout(searchCloseTimeout.current);
      }
      if (mobileCloseTimeout.current) {
        clearTimeout(mobileCloseTimeout.current);
      }
    };
  }, []);

  const isInverted = pathname === "/" && !pastHero && megaMenuIndex === null && !mobileMenuOpen;
  const isColored = isInnerRoute || pastHero || megaMenuIndex !== null;

  const shellClassName = [
    styles.shell,
    isInverted ? styles.inverted : "",
    isColored ? styles.colored : "",
    megaMenuIndex !== null ? styles.megaMenuOpen : "",
    mobileMenuOpen ? styles.mobileOpen : "",
    mobileMenuClosing ? styles.mobileClosing : "",
    scrolled ? styles.scrolled : "",
    hideHeader ? styles.hideHeader : "",
    searchOpen || searchClosing ? styles.searchActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  const underlineStyle = {
    transform: `translateX(${underline.left}px)`,
    width: `${underline.width}px`,
    opacity: underline.visible ? 1 : 0,
  } satisfies CSSProperties;

  function openMegaMenu(index: number) {
    if (megaMenuCloseTimeout.current) {
      clearTimeout(megaMenuCloseTimeout.current);
    }

    if (!header.primaryNavigation[index]?.megaMenu) {
      setMegaMenuIndex(null);
      return;
    }

    setMegaMenuIndex(index);
  }

  function scheduleMegaMenuClose() {
    if (megaMenuCloseTimeout.current) {
      clearTimeout(megaMenuCloseTimeout.current);
    }

    megaMenuCloseTimeout.current = setTimeout(() => {
      setMegaMenuIndex(null);
    }, 120);
  }

  function moveUnderline(index: number) {
    const target = itemRefs.current[index];
    if (!target) {
      return;
    }

    setUnderline({
      left: target.offsetLeft,
      width: target.offsetWidth,
      visible: true,
    });
  }

  function resetUnderline() {
    if (activeIndex === null) {
      setUnderline((previous) => ({ ...previous, visible: false }));
      return;
    }

    moveUnderline(activeIndex);
  }

  function handleDesktopLanguageToggle() {
    if (window.innerWidth <= 930) {
      return;
    }

    setDesktopLanguageOpen((current) => !current);
  }

  function toggleMobileMenu() {
    if (!mobileMenuOpen) {
      if (mobileCloseTimeout.current) {
        clearTimeout(mobileCloseTimeout.current);
      }

      setMobileMenuClosing(false);
      setMobileMenuOpen(true);
      setDesktopLanguageOpen(false);
      setSearchOpen(false);
      setSearchClosing(false);
      return;
    }

    closeMobileMenu();
  }

  function handleNavEnter(index: number) {
    moveUnderline(index);
    openMegaMenu(index);
  }

  function handleNavLeave(index: number) {
    if (header.primaryNavigation[index]?.megaMenu) {
      scheduleMegaMenuClose();
    }

    resetUnderline();
  }

  function navigateFromSearch(href: string) {
    closeSearch();
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div ref={headerRef} className={shellClassName}>
      {header.announcementText ? (
        <div className={styles.freeShippingBar}>{header.announcementText}</div>
      ) : null}

      <header ref={innerHeaderRef} className={styles.header}>
        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.hamburger}
            aria-label={mobileMenuOpen ? "Zatvori izbornik" : "Otvori izbornik"}
            onClick={toggleMobileMenu}
          >
            <span className={styles.hamburgerNormal}>
              <span />
              <span />
              <span />
            </span>
            <span className={styles.hamburgerCross}>
              <span />
              <span />
            </span>
          </button>
          <DesktopNav
            header={header}
            itemRefs={itemRefs}
            megaMenuIndex={megaMenuIndex}
            navListRef={navListRef}
            onMegaMenuClose={scheduleMegaMenuClose}
            onMegaMenuOpen={openMegaMenu}
            onNavEnter={handleNavEnter}
            onNavLeave={handleNavLeave}
            onUnderlineReset={resetUnderline}
            underlineStyle={underlineStyle}
          />
          <HeaderActions
            itemCount={itemCount}
            onDesktopLanguageToggle={handleDesktopLanguageToggle}
            onOpenSearch={openSearch}
            searchOpen={searchOpen}
          />
        </div>
      </header>

      <MobileMenu
        mobileLanguageOpen={mobileLanguageOpen}
        navigationItems={header.mobileNavigation}
        onCloseLanguage={() => setMobileLanguageOpen(false)}
        onOpenLanguage={() => setMobileLanguageOpen(true)}
      />
      <LanguageOverlay
        desktopLanguageOpen={desktopLanguageOpen}
        onClose={() => setDesktopLanguageOpen(false)}
      />
      <SearchOverlay
        onCloseSearch={closeSearch}
        onNavigateFromSearch={navigateFromSearch}
        onSearchChange={setSearchQuery}
        searchClosing={searchClosing}
        searchOpen={searchOpen}
        searchQuery={searchQuery}
      />
      <HeaderSvgDefs />
    </div>
  );
}
