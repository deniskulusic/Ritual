export function buildShopSearchHref(query: string) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return "/shop";
  }

  return `/shop?q=${encodeURIComponent(normalizedQuery)}`;
}

export function highlightSearchMatch(value: string, query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return value;
  }

  const loweredValue = value.toLocaleLowerCase("hr");
  const loweredQuery = trimmedQuery.toLocaleLowerCase("hr");
  const matchIndex = loweredValue.indexOf(loweredQuery);

  if (matchIndex < 0) {
    return value;
  }

  const before = value.slice(0, matchIndex);
  const match = value.slice(matchIndex, matchIndex + trimmedQuery.length);
  const after = value.slice(matchIndex + trimmedQuery.length);

  return (
    <>
      {before}
      <mark>{match}</mark>
      {after}
    </>
  );
}

export function joinClassNames(...classNames: Array<false | null | string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}
