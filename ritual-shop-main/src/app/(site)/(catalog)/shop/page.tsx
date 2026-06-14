import {
  getShopPageCatalogData,
  normalizeCatalogSearchQuery,
} from "../_data/catalog-page-data";
import { ProductBrowser } from "../_components/product-browser";
import { StoreBreadcrumbs } from "../../_components/store-breadcrumbs";

export default async function ShopPage(props: PageProps<"/shop">) {
  const searchParams = await props.searchParams;
  const {
    activeFilters,
    filterGroups,
    pagination,
    products,
    searchQuery,
  } = await getShopPageCatalogData(searchParams);
  const normalizedSearchQuery = normalizeCatalogSearchQuery(searchQuery);

  return (
    <div className="headerClearance">
      <StoreBreadcrumbs
        items={
          normalizedSearchQuery
            ? [
                { label: "Ritual Shop", href: "/" },
                { label: "Ponuda", href: "/shop" },
                { label: "Rezultati pretrage" },
              ]
            : [{ label: "Ritual Shop", href: "/" }, { label: "Ponuda" }]
        }
      />
      <ProductBrowser
        title={normalizedSearchQuery ? "Rezultati pretrage" : "Ponuda"}
        activeFilters={activeFilters}
        products={products}
        filterGroups={filterGroups}
        pagination={pagination}
        searchQuery={searchQuery}
      />
    </div>
  );
}
