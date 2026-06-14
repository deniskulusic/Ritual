"use client";

import Link from "next/link";
import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  type ProductSearchHit,
  type ProductSearchResponse,
  normalizeProductSearchQuery,
} from "@/payload/collections/products/search-contract";
import { buildShopSearchHref, highlightSearchMatch, joinClassNames } from "./helpers";
import styles from "./header.module.css";

type SearchOverlayProps = {
  onCloseSearch: () => void;
  onNavigateFromSearch: (href: string) => void;
  onSearchChange: (value: string) => void;
  searchClosing: boolean;
  searchOpen: boolean;
  searchQuery: string;
};

export function SearchOverlay({
  onCloseSearch,
  onNavigateFromSearch,
  onSearchChange,
  searchClosing,
  searchOpen,
  searchQuery,
}: SearchOverlayProps) {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchResultsShellRef = useRef<HTMLDivElement | null>(null);
  const searchResultsContentRef = useRef<HTMLDivElement | null>(null);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [loadingResults, setLoadingResults] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductSearchHit[]>([]);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = normalizeProductSearchQuery(deferredSearchQuery);
  const canShowSearchResults = normalizedSearchQuery.length >= 2;
  const searchResultsPanelState = (() => {
    if (!canShowSearchResults) {
      return "minimum";
    }

    if (loadingResults) {
      return "loading";
    }

    if (searchResults.length > 0) {
      return "loaded";
    }

    return "empty";
  })();

  useEffect(() => {
    if (!canShowSearchResults) {
      setLoadingResults(false);
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();

    setLoadingResults(true);

    void fetch(`/api/product-search?q=${encodeURIComponent(deferredSearchQuery)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Search request failed.");
        }

        return (await response.json()) as ProductSearchResponse;
      })
      .then((payload) => {
        if (!controller.signal.aborted) {
          setSearchResults(payload.results);
        }
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setSearchResults([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingResults(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [canShowSearchResults, deferredSearchQuery]);

  const searchNavigationItems = (() => {
    if (!canShowSearchResults) {
      return [];
    }

    return [
      ...searchResults.map((product) => ({
        href: `/product/${product.slug}`,
        key: product.slug,
      })),
      {
        href: buildShopSearchHref(searchQuery),
        key: "view-all",
      },
    ];
  })();

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    searchInputRef.current?.focus();
    setActiveSearchIndex(-1);
  }, [searchOpen]);

  useEffect(() => {
    const shell = searchResultsShellRef.current;

    if (!shell) {
      return;
    }

    if (!normalizedSearchQuery) {
      shell.style.height = "0px";
      return;
    }

    const content = searchResultsContentRef.current;

    if (!content) {
      return;
    }

    let frameId = 0;

    const updateSearchResultsHeight = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        shell.style.height = `${content.scrollHeight}px`;
      });
    };

    updateSearchResultsHeight();

    const observer = new ResizeObserver(updateSearchResultsHeight);
    observer.observe(content);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [normalizedSearchQuery, searchResults.length, searchResultsPanelState]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activeSearchIndex >= 0) {
      const selectedItem = searchNavigationItems[activeSearchIndex];

      if (selectedItem) {
        onNavigateFromSearch(selectedItem.href);
        return;
      }
    }

    if (!normalizedSearchQuery) {
      return;
    }

    onNavigateFromSearch(buildShopSearchHref(searchQuery));
  }

  function handleSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (!searchNavigationItems.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSearchIndex((current) => (current + 1) % searchNavigationItems.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSearchIndex((current) =>
        current <= 0 ? searchNavigationItems.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter" && activeSearchIndex >= 0) {
      event.preventDefault();
      onNavigateFromSearch(searchNavigationItems[activeSearchIndex]!.href);
    }
  }

  return (
    <div
      id="site-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Pretraga proizvoda"
      className={joinClassNames(
        styles.searchOverlay,
        searchOpen ? styles.searchOverlayOpen : "",
        searchClosing ? styles.searchOverlayClosing : "",
      )}
    >
      <div className={styles.searchOverlayInner}>
        <button type="button" className={styles.searchClose} onClick={onCloseSearch} aria-label="Zatvori pretragu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={joinClassNames(styles.searchContent, styles.searchLeft)}>
          <div className={styles.searchLogo}>
            <img src="/ritual/uploads/ritual-logo.png" alt="Ritual Shop" />
          </div>
        </div>
        <div className={joinClassNames(styles.searchContent, styles.searchRight)}>
          <form className={styles.searchForm} role="search" onSubmit={handleSearchSubmit}>
            <input
              ref={searchInputRef}
              type="search"
              name="q"
              value={searchQuery}
              placeholder="Upišite pojam i pritisnite Enter"
              onChange={(event) => {
                onSearchChange(event.target.value);
                setActiveSearchIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
            />
            <button type="submit" aria-label="Pošalji pretragu">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.9999 19L14.6499 14.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
          <div ref={searchResultsShellRef} className={styles.searchResultsShell}>
            <div ref={searchResultsContentRef} className={styles.searchResultsInner}>
              <div className={styles.searchResultsBar}>
                <div className={styles.searchMeta}>
                  <div className={styles.searchMetaCopy}>
                    <span>Rezultati pretrage</span>
                    <p>
                      {loadingResults
                        ? "Tražimo proizvode..."
                        : canShowSearchResults
                        ? `${searchResults.length} ${searchResults.length === 1 ? "rezultat" : "rezultata"}`
                        : "Unesite barem 2 znaka"}
                    </p>
                  </div>
                  {canShowSearchResults ? (
                    <button
                      type="button"
                      className={styles.searchViewAll}
                      onMouseEnter={() => setActiveSearchIndex(searchResults.length)}
                      onClick={() => onNavigateFromSearch(buildShopSearchHref(searchQuery))}
                    >
                      Pogledaj sve
                    </button>
                  ) : null}
                </div>
                <div key={searchResultsPanelState} className={styles.searchResultsPanel}>
                  {searchResultsPanelState === "minimum" ? (
                    <div className={styles.searchInlineState}>Za prikaz proizvoda unesite barem 2 znaka.</div>
                  ) : null}
                  {searchResultsPanelState === "loading" ? (
                    <div className={styles.searchInlineState}>Tražimo proizvode...</div>
                  ) : null}
                  {searchResultsPanelState === "loaded" ? (
                    <ul className={styles.searchResultsList}>
                      {searchResults.map((product, index) => (
                        <li key={product.slug}>
                          <Link
                            href={`/product/${product.slug}`}
                            className={joinClassNames(
                              styles.searchResultCard,
                              activeSearchIndex === index ? styles.searchResultCardActive : "",
                            )}
                            onMouseEnter={() => setActiveSearchIndex(index)}
                            onClick={onCloseSearch}
                          >
                            <div className={styles.searchResultCardBody}>
                              <div className={styles.searchResultImageWrap}>
                                <img src={product.image} alt={product.title} />
                              </div>
                              <h5>{product.brand}</h5>
                              <h3>{highlightSearchMatch(product.title, searchQuery)}</h3>
                            </div>
                            <h4>{product.priceLabel}</h4>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {searchResultsPanelState === "empty" ? (
                    <div className={styles.searchInlineState}>
                      Nismo pronašli proizvode za &ldquo;{searchQuery.trim()}&rdquo;.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
