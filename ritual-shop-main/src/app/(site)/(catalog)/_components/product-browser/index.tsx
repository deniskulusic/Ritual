"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

import type {
  StoreActiveFilters,
  StoreCheckboxFilterGroup,
  StoreFilterGroup,
  StorePagination,
  StoreProduct,
  StoreRangeFilterGroup,
  StoreRangeFilterValue,
} from "../../_data/catalog-data";
import {
  STORE_FILTER_QUERY_PARAMS,
  STORE_PAGE_QUERY_PARAM,
} from "../../_data/catalog-data";
import { ProductCard } from "../product-card";
import styles from "./product-browser.module.css";

type ProductBrowserProps = {
  activeFilters: StoreActiveFilters;
  clearHref?: string;
  description?: string;
  title: string;
  products: StoreProduct[];
  filterGroups: StoreFilterGroup[];
  pagination: StorePagination;
  searchQuery?: string;
};

type ActiveFilterChip = {
  id: string;
  label: string;
  onRemove: () => void;
};
type FilterButtonRefs = Partial<
  Record<StoreFilterGroup["key"], HTMLButtonElement | null>
>;
const FILTER_DROPDOWN_GAP = 8;

function getProductCountLabel(count: number) {
  return `${count} ${count === 1 ? "proizvod" : "proizvoda"}`;
}

function getVisibleProductCountLabel(pageCount: number, totalCount: number) {
  if (totalCount === 0) {
    return getProductCountLabel(0);
  }

  if (pageCount === totalCount) {
    return getProductCountLabel(totalCount);
  }

  return `${pageCount} od ${getProductCountLabel(totalCount)}`;
}

function getRangeDisplayLabel(
  group: StoreRangeFilterGroup,
  value: StoreRangeFilterValue,
) {
  const suffix = group.key === "priceValue" ? " EUR" : "";
  return `${value.min}${suffix} - ${value.max}${suffix}`;
}

function getCheckboxOptionLabel(
  group: StoreCheckboxFilterGroup,
  value: string,
) {
  return group.options.find((option) => option.value === value)?.label ?? value;
}

function getPaginationItems(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<"end-ellipsis" | "start-ellipsis" | number> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) {
    pages.push("start-ellipsis");
  }

  for (let item = start; item <= end; item += 1) {
    pages.push(item);
  }

  if (end < totalPages - 1) {
    pages.push("end-ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

function getDropdownWidth(group: StoreFilterGroup) {
  return group.kind === "range" ? 392 : 332;
}

function getDropdownPosition(
  trigger: HTMLButtonElement,
  group: StoreFilterGroup,
  block: HTMLDivElement | null,
) {
  if (!block) {
    return null;
  }

  const triggerRect = trigger.getBoundingClientRect();
  const blockRect = block.getBoundingClientRect();
  const dropdownWidth = getDropdownWidth(group);
  const rawOffset = triggerRect.right - blockRect.left - dropdownWidth;
  const maxOffset = Math.max(block.clientWidth - dropdownWidth, 0);

  return {
    left: Math.min(Math.max(rawOffset, 0), maxOffset),
    top: triggerRect.bottom - blockRect.top + FILTER_DROPDOWN_GAP,
  };
}

export function ProductBrowser({
  activeFilters,
  clearHref = "/shop",
  description,
  title,
  products,
  filterGroups,
  pagination,
  searchQuery,
}: ProductBrowserProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [optimisticActiveFilters, setOptimisticActiveFilters] = useOptimistic(
    activeFilters,
    (_current, nextFilters: StoreActiveFilters) => nextFilters,
  );
  const filtersBlockRef = useRef<HTMLDivElement | null>(null);
  const activeFiltersContentRef = useRef<HTMLDivElement | null>(null);
  const dropdownPanelRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRefs = useRef<FilterButtonRefs>({});

  const [openFilter, setOpenFilter] = useState<null | StoreFilterGroup["key"]>(
    null,
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<null | StoreFilterGroup["key"]>(
    null,
  );
  const [displayedActiveFilterChips, setDisplayedActiveFilterChips] = useState<
    ActiveFilterChip[]
  >([]);
  const [activeFiltersMotionVisible, setActiveFiltersMotionVisible] =
    useState(false);
  const [activeFiltersRowHeight, setActiveFiltersRowHeight] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });

  const trimmedSearchQuery = searchQuery?.trim() ?? "";
  const hasFilters = filterGroups.length > 0;
  const hasPagination = pagination.totalPages > 1;
  const searchClearHref = buildSearchClearHref();

  function buildPageHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      params.delete(STORE_PAGE_QUERY_PARAM);
    } else {
      params.set(STORE_PAGE_QUERY_PARAM, String(page));
    }

    const query = params.toString();

    return query ? `${pathname}?${query}` : pathname;
  }

  function buildSearchClearHref() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete(STORE_PAGE_QUERY_PARAM);

    const query = params.toString();

    return query ? `${pathname}?${query}` : clearHref;
  }

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    if (!openFilter) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const clickedOnTrigger = Object.values(filterButtonRefs.current).some(
        (button) => button?.contains(target),
      );

      if (dropdownPanelRef.current?.contains(target) || clickedOnTrigger) {
        return;
      }

      setOpenFilter(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenFilter(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openFilter]);

  const openGroup = openFilter
    ? filterGroups.find((group) => group.key === openFilter) ?? null
    : null;

  useEffect(() => {
    if (!openFilter || !openGroup) {
      return;
    }

    const filterKey = openFilter;
    const currentGroup = openGroup;

    function updateDropdownOffset() {
      const trigger = filterButtonRefs.current[filterKey];
      if (!trigger) {
        return;
      }

      const nextPosition = getDropdownPosition(
        trigger,
        currentGroup,
        filtersBlockRef.current,
      );

      if (nextPosition) {
        setDropdownPosition(nextPosition);
      }
    }

    updateDropdownOffset();
    window.addEventListener("resize", updateDropdownOffset);

    return () => {
      window.removeEventListener("resize", updateDropdownOffset);
    };
  }, [openFilter, openGroup]);

  const activeCount = Object.values(optimisticActiveFilters).reduce((count, value) => {
    if (!value) {
      return count;
    }

    return count + (Array.isArray(value) ? value.length : 1);
  }, 0);

  function getCheckboxValues(key: StoreCheckboxFilterGroup["key"]) {
    const selected = optimisticActiveFilters[key];
    return Array.isArray(selected) ? selected : [];
  }

  function getRangeValue(group: StoreRangeFilterGroup): StoreRangeFilterValue {
    const selected = optimisticActiveFilters[group.key];

    if (selected && !Array.isArray(selected)) {
      return selected;
    }

    return { min: group.min, max: group.max };
  }

  function buildFilterHref(nextFilters: StoreActiveFilters) {
    const params = new URLSearchParams(searchParams.toString());

    for (const param of STORE_FILTER_QUERY_PARAMS) {
      params.delete(param);
    }

    params.delete(STORE_PAGE_QUERY_PARAM);

    for (const group of filterGroups) {
      const selected = nextFilters[group.key];

      if (!selected) {
        continue;
      }

      if (group.kind === "checkbox") {
        if (Array.isArray(selected) && selected.length > 0) {
          params.set(group.param, selected.join(","));
        }

        continue;
      }

      if (!Array.isArray(selected)) {
        if (selected.min !== group.min) {
          params.set(group.minParam, String(selected.min));
        }

        if (selected.max !== group.max) {
          params.set(group.maxParam, String(selected.max));
        }
      }
    }

    const query = params.toString();

    return query ? `${pathname}?${query}` : pathname;
  }

  function updateFilters(nextFilters: StoreActiveFilters) {
    const href = buildFilterHref(nextFilters);

    startTransition(() => {
      setOptimisticActiveFilters(nextFilters);
      router.replace(href, { scroll: false });
    });
  }

  function setCheckboxValue(
    key: StoreCheckboxFilterGroup["key"],
    value: string,
  ) {
    const next = { ...optimisticActiveFilters };
    const currentValue = optimisticActiveFilters[key];
    const values = new Set(Array.isArray(currentValue) ? currentValue : []);

    if (values.has(value)) {
      values.delete(value);
    } else {
      values.add(value);
    }

    if (values.size === 0) {
      delete next[key];
    } else {
      next[key] = Array.from(values);
    }

    updateFilters(next);
  }

  function setRangeValue(
    group: StoreRangeFilterGroup,
    min: number,
    max: number,
  ) {
    const next = { ...optimisticActiveFilters };

    if (min === group.min && max === group.max) {
      delete next[group.key];
    } else {
      next[group.key] = { min, max };
    }

    updateFilters(next);
  }

  function clearAllFilters() {
    updateFilters({});
    setOpenFilter(null);
  }

  function clearGroup(key: StoreFilterGroup["key"]) {
    const next = { ...optimisticActiveFilters };
    delete next[key];
    updateFilters(next);
  }

  function toggleDesktopFilter(
    group: StoreFilterGroup,
    trigger: HTMLButtonElement,
  ) {
    const nextPosition = getDropdownPosition(
      trigger,
      group,
      filtersBlockRef.current,
    );

    if (nextPosition) {
      setDropdownPosition(nextPosition);
    }

    setOpenFilter((current) => (current === group.key ? null : group.key));
  }

  function toggleMobileFilters() {
    if (mobileFiltersOpen) {
      setMobileFiltersOpen(false);
      return;
    }

    setOpenFilter(null);
    setMobileGroup(filterGroups[0]?.key ?? null);
    setMobileFiltersOpen(true);
  }

  function closeMobileFilters() {
    setMobileFiltersOpen(false);
  }

  function getSelectedCount(group: StoreFilterGroup) {
    const selected = optimisticActiveFilters[group.key];

    if (!selected) {
      return 0;
    }

    return Array.isArray(selected) ? selected.length : 1;
  }

  function getGroupSummary(group: StoreFilterGroup) {
    const selected = optimisticActiveFilters[group.key];

    if (!selected) {
      return "Sve";
    }

    if (group.kind === "range") {
      return getRangeDisplayLabel(group, selected as StoreRangeFilterValue);
    }

    const values = selected as string[];
    return values.length === 1
      ? getCheckboxOptionLabel(group, values[0] ?? "")
      : `${values.length} odabrano`;
  }

  function renderRangeFilter(group: StoreRangeFilterGroup) {
    const value = getRangeValue(group);
    const minProgress =
      ((value.min - group.min) / (group.max - group.min)) * 100;
    const maxProgress =
      ((value.max - group.min) / (group.max - group.min)) * 100;
    const suffix = group.key === "priceValue" ? " EUR" : "";

    return (
      <div className={styles.rangeFilter}>
        <div className={styles.rangeSlider}>
          <div className={styles.rangeTrack}>
            <div
              className={styles.rangeTrackActive}
              style={{
                left: `${minProgress}%`,
                width: `${Math.max(maxProgress - minProgress, 0)}%`,
              }}
            />
          </div>
          <input
            type="range"
            min={group.min}
            max={group.max}
            step={group.step}
            value={value.min}
            className={styles.rangeInput}
            onChange={(event) =>
              setRangeValue(
                group,
                Math.min(Number(event.target.value), value.max),
                value.max,
              )
            }
          />
          <input
            type="range"
            min={group.min}
            max={group.max}
            step={group.step}
            value={value.max}
            className={styles.rangeInput}
            onChange={(event) =>
              setRangeValue(
                group,
                value.min,
                Math.max(Number(event.target.value), value.min),
              )
            }
          />
        </div>

        <div className={styles.rangeSummary}>
          <div className={styles.rangeSummaryItem}>
            <span>{group.minLabel}</span>
            <strong>
              {value.min}
              {suffix}
            </strong>
          </div>
          <div className={styles.rangeSummaryItem}>
            <span>{group.maxLabel}</span>
            <strong>
              {value.max}
              {suffix}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  function renderCheckboxFilter(group: StoreCheckboxFilterGroup) {
    const values = getCheckboxValues(group.key);

    return (
      <div className={styles.checkboxFilter}>
        {group.options.map((option) => {
          const checked = values.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.optionButton} ${
                checked ? styles.optionButtonActive : ""
              }`}
              aria-pressed={checked}
              onClick={() => setCheckboxValue(group.key, option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  function renderFilterContent(group: StoreFilterGroup) {
    return group.kind === "range"
      ? renderRangeFilter(group)
      : renderCheckboxFilter(group);
  }

  const activeFilterChips: ActiveFilterChip[] = filterGroups.flatMap((group) => {
    const selected = optimisticActiveFilters[group.key];

    if (!selected) {
      return [];
    }

    if (group.kind === "range") {
      return [
        {
          id: `${group.key}-range`,
          label: `${group.label}: ${getRangeDisplayLabel(
            group,
            selected as StoreRangeFilterValue,
          )}`,
          onRemove: () => clearGroup(group.key),
        },
      ];
    }

    return (selected as string[]).map((value) => ({
      id: `${group.key}-${value}`,
      label: getCheckboxOptionLabel(group, value),
      onRemove: () => setCheckboxValue(group.key, value),
    }));
  });

  const activeFilterChipSignature = activeFilterChips
    .map((chip) => `${chip.id}:${chip.label}`)
    .join("|");

  useLayoutEffect(() => {
    if (activeFilterChips.length > 0) {
      setDisplayedActiveFilterChips(activeFilterChips);
    }
  }, [activeFilterChipSignature]);

  useEffect(() => {
    if (activeFilterChips.length > 0) {
      const openFrame = window.requestAnimationFrame(() => {
        setActiveFiltersMotionVisible(true);
      });

      return () => {
        window.cancelAnimationFrame(openFrame);
      };
    }

    setActiveFiltersMotionVisible(false);
    const closeTimeout = window.setTimeout(() => {
      setDisplayedActiveFilterChips([]);
    }, 320);

    return () => {
      window.clearTimeout(closeTimeout);
    };
  }, [activeFilterChipSignature]);

  const renderedActiveFilterChipSignature = displayedActiveFilterChips
    .map((chip) => `${chip.id}:${chip.label}`)
    .join("|");

  useLayoutEffect(() => {
    const content = activeFiltersContentRef.current;

    if (!content || displayedActiveFilterChips.length === 0) {
      setActiveFiltersRowHeight(0);
      return;
    }

    const currentContent = content;

    function updateHeight() {
      setActiveFiltersRowHeight(currentContent.scrollHeight);
    }

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(currentContent);

    return () => {
      observer.disconnect();
    };
  }, [renderedActiveFilterChipSignature]);

  return (
    <>
      <section className={styles.browser}>
        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <div ref={filtersBlockRef} className={styles.toolbarBlock}>
              <div className={styles.introHeader}>
                <h1 className={styles.title}>{title}</h1>
                <div className={styles.headerTools}>
                  {hasFilters ? (
                    <div className={styles.filtersColumn}>
                      <div className={styles.desktopFilters}>
                        {filterGroups.map((group) => {
                          const selectedCount = getSelectedCount(group);
                          const isOpen = openFilter === group.key;

                          return (
                            <button
                              key={group.key}
                              ref={(node) => {
                                filterButtonRefs.current[group.key] = node;
                              }}
                              type="button"
                              className={[
                                styles.filterTrigger,
                                selectedCount > 0 ? styles.filterTriggerActive : "",
                                isOpen ? styles.filterTriggerOpen : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              onClick={(event) =>
                                toggleDesktopFilter(group, event.currentTarget)
                              }
                            >
                              <span>{group.label}</span>
                              {selectedCount > 0 ? (
                                <strong className={styles.triggerCount}>
                                  {selectedCount}
                                </strong>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className={styles.mobileFiltersButton}
                        onClick={toggleMobileFilters}
                      >
                        Filtri
                        {activeCount > 0 ? (
                          <span className={styles.mobileFiltersCount}>
                            {activeCount}
                          </span>
                        ) : null}
                      </button>
                    </div>
                  ) : null}
                  <p className={styles.titleMeta}>
                    Prikazano{" "}
                    {getVisibleProductCountLabel(
                      products.length,
                      pagination.totalCount,
                    )}
                  </p>
                </div>
              </div>

              {hasFilters ? (
                <div
                  className={[
                    styles.activeFiltersRow,
                    activeFiltersMotionVisible
                      ? styles.activeFiltersRowVisible
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    height: `${activeFilterChips.length > 0 ? activeFiltersRowHeight : 0}px`,
                    transitionDelay: activeFilterChips.length > 0 ? "0ms" : "55ms",
                  }}
                >
                  <div
                    ref={activeFiltersContentRef}
                    className={[
                      styles.activeFilters,
                      activeFiltersMotionVisible
                        ? styles.activeFiltersVisible
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      transitionDelay: activeFiltersMotionVisible
                        ? "45ms, 45ms"
                        : "0ms, 0ms",
                    }}
                  >
                    {displayedActiveFilterChips.length > 0 ? (
                      <>
                        {displayedActiveFilterChips.map((chip) => (
                          <button
                            key={chip.id}
                            type="button"
                            className={styles.activeChip}
                            onClick={chip.onRemove}
                            title={chip.label}
                          >
                            <span className={styles.activeChipLabel}>{chip.label}</span>
                            <span className={styles.activeChipClose}>x</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          className={styles.clearAllPill}
                          onClick={clearAllFilters}
                        >
                          Očisti sve
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {description ? <p className={styles.description}>{description}</p> : null}
              {trimmedSearchQuery ? (
                <div className={styles.metaRow}>
                  <p className={styles.metaCopy}>
                    Pretraga za <span>&ldquo;{trimmedSearchQuery}&rdquo;</span>
                  </p>
                  <Link href={searchClearHref} className={styles.searchClear}>
                    Očisti pretragu
                  </Link>
                </div>
              ) : null}

              {hasFilters && openGroup ? (
                <div className={styles.dropdownLayer}>
                  <div
                    ref={dropdownPanelRef}
                    className={[
                      styles.dropdownPanel,
                      openGroup.kind === "range" ? styles.dropdownPanelWide : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      left: `${dropdownPosition.left}px`,
                      top: `${dropdownPosition.top}px`,
                    }}
                  >
                    <div className={styles.dropdownBody}>
                      {renderFilterContent(openGroup)}
                    </div>
                    <div className={styles.dropdownFooter}>
                      <button
                        type="button"
                        className={styles.dropdownClose}
                        onClick={() => setOpenFilter(null)}
                      >
                        Zatvori
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={[styles.grid, isPending ? styles.gridPending : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <h3>
                {trimmedSearchQuery
                  ? "Nismo pronašli proizvode za ovu pretragu"
                  : "Nema proizvoda za odabrane filtere"}
              </h3>
              <p>
                {trimmedSearchQuery
                  ? "Pokušajte s drugim pojmom pretrage ili očistite filtre za širi pregled ponude."
                  : "Očistite pojedine filtere ili se vratite na cijelu ponudu za širi pregled proizvoda."}
              </p>
              {(trimmedSearchQuery || activeCount > 0) && (
                <div className={styles.emptyStateActions}>
                  {trimmedSearchQuery ? (
                    <Link
                      href={searchClearHref}
                      className={styles.emptyStateLink}
                    >
                      Očisti pretragu
                    </Link>
                  ) : null}
                  {activeCount > 0 ? (
                    <button
                      type="button"
                      className={styles.emptyStateLink}
                      onClick={clearAllFilters}
                    >
                      Očisti filtre
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        {hasPagination ? (
          <nav className={styles.pagination} aria-label="Paginacija proizvoda">
            <Link
              href={buildPageHref(Math.max(pagination.page - 1, 1))}
              scroll={false}
              aria-disabled={pagination.page === 1}
              className={[
                styles.pageControl,
                pagination.page === 1 ? styles.pageControlDisabled : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              Prethodna
            </Link>

            <div className={styles.pageList}>
              {getPaginationItems(pagination.page, pagination.totalPages).map(
                (item) =>
                  typeof item === "number" ? (
                    <Link
                      key={item}
                      href={buildPageHref(item)}
                      scroll={false}
                      aria-current={item === pagination.page ? "page" : undefined}
                      className={[
                        styles.pageButton,
                        item === pagination.page ? styles.pageButtonActive : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {item}
                    </Link>
                  ) : (
                    <span key={item} className={styles.pageEllipsis}>
                      ...
                    </span>
                  ),
              )}
            </div>

            <Link
              href={buildPageHref(
                Math.min(pagination.page + 1, pagination.totalPages),
              )}
              scroll={false}
              aria-disabled={pagination.page === pagination.totalPages}
              className={[
                styles.pageControl,
                pagination.page === pagination.totalPages
                  ? styles.pageControlDisabled
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              Sljedeća
            </Link>
          </nav>
        ) : null}
      </section>

      {hasFilters ? (
        <>
          <div
            className={`${styles.mobileBackdrop} ${
              mobileFiltersOpen ? styles.mobileBackdropVisible : ""
            }`}
            onClick={closeMobileFilters}
          />

          <div
            className={`${styles.mobileSheet} ${
              mobileFiltersOpen ? styles.mobileSheetOpen : ""
            }`}
          >
            <div className={styles.mobileSheetHeader}>
              <div>
                <p className={styles.mobileSheetEyebrow}>Filtri</p>
                <h2 className={styles.mobileSheetTitle}>Prilagodi ponudu</h2>
              </div>

              <div className={styles.mobileSheetActions}>
                {activeCount > 0 ? (
                  <button
                    type="button"
                    className={styles.mobileHeaderClear}
                    onClick={clearAllFilters}
                  >
                    Očisti sve
                  </button>
                ) : null}
                <button
                  type="button"
                  className={styles.mobileClose}
                  onClick={closeMobileFilters}
                >
                  Zatvori
                </button>
              </div>
            </div>

            <div className={styles.mobileGroups}>
              {filterGroups.map((group) => {
                const isOpen = mobileGroup === group.key;

                return (
                  <div key={group.key} className={styles.mobileGroup}>
                    <button
                      type="button"
                      className={`${styles.mobileGroupButton} ${
                        isOpen ? styles.mobileGroupButtonOpen : ""
                      }`}
                      onClick={() =>
                        setMobileGroup((current) =>
                          current === group.key ? null : group.key,
                        )
                      }
                    >
                      <span>{group.label}</span>
                      <strong>{getGroupSummary(group)}</strong>
                    </button>

                    {isOpen ? (
                      <div className={styles.mobileGroupPanel}>
                        {renderFilterContent(group)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className={styles.mobileFooter}>
              <button
                type="button"
                className={styles.mobileApply}
                onClick={closeMobileFilters}
              >
                {isPending
                  ? "Ažuriranje..."
                  : `Prikaži ${getProductCountLabel(pagination.totalCount)}`}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
