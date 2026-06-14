"use client";

import { useState } from "react";

import type { AccountOrder } from "../../../../_data/account-data";
import styles from "./orders-panel.module.css";

type OrdersPanelProps = {
  orders: AccountOrder[];
};

const statusLabels: Record<string, string> = {
  Cancelled: "Otkazano",
  Completed: "Dovršeno",
  Processing: "Obrada",
  Shipped: "Poslano",
};

function getStatusClassName(status: string) {
  switch (status) {
    case "Cancelled":
      return styles.cancelled;
    case "Completed":
      return styles.completed;
    case "Shipped":
      return styles.shipped;
    case "Processing":
    default:
      return styles.processing;
  }
}

export function OrdersPanel({ orders }: OrdersPanelProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  return (
    <div className={styles.ordersTable}>
      <div className={styles.tableHead}>
        <h3>Broj narudžbe</h3>
        <h3>Datum</h3>
        <h3>Status</h3>
        <h3>Ukupno</h3>
        <h3 className={styles.tableAction}>Detalji</h3>
      </div>
      <div className={styles.orders}>
        {orders.length === 0 ? (
          <div className={styles.emptyOrder}>Nijedna narudžba nije pronađena.</div>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className={`${styles.orderItem} ${selectedOrderId === order.id ? styles.orderItemExpanded : ""}`}
            >
              <div className={styles.orderRow}>
                <div className={styles.orderCell} data-label="Broj narudžbe">
                  #{order.id}
                </div>
                <div className={styles.orderCell} data-label="Datum">
                  {order.createdAtLabel}
                </div>
                <div className={styles.orderCell} data-label="Status">
                  <span className={`${styles.status} ${getStatusClassName(order.status)}`}>
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </div>
                <div className={`${styles.orderCell} ${styles.orderTotal}`} data-label="Ukupno">
                  {order.totalLabel}
                </div>
                <button
                  type="button"
                  className={styles.viewButton}
                  aria-controls={`order-details-${order.id}`}
                  aria-expanded={selectedOrderId === order.id}
                  onClick={() =>
                    setSelectedOrderId((current) => (current === order.id ? null : order.id))
                  }
                >
                  <span>{selectedOrderId === order.id ? "Sakrij" : "Pregled"}</span>
                  <span
                    aria-hidden="true"
                    className={`${styles.viewChevron} ${selectedOrderId === order.id ? styles.viewChevronOpen : ""}`}
                  />
                </button>
              </div>
              <div
                id={`order-details-${order.id}`}
                className={styles.orderDetailsShell}
                aria-hidden={selectedOrderId !== order.id}
              >
                <div className={styles.orderDetailsInner}>
                  <div className={styles.orderDetails}>
                    <div className={styles.receiptGrid}>
                      <div>
                        <h5>Broj narudžbe</h5>
                        <h4>#{order.id}</h4>
                      </div>
                      <div>
                        <h5>Način plaćanja</h5>
                        <h4>{order.paymentMethodLabel}</h4>
                      </div>
                      <div>
                        <h5>Datum narudžbe</h5>
                        <h4>{order.createdAtLabel}</h4>
                      </div>
                      <div>
                        <h5>Dostava</h5>
                        <h4>{order.shippingMethodLabel}</h4>
                      </div>
                    </div>
                    <div className={styles.section}>
                      <h3>Stavke narudžbe</h3>
                      <div className={styles.summaryItems}>
                        {order.lines.map((line) => (
                          <div key={line.title} className={styles.summaryRow}>
                            <div className={styles.summaryName}>{line.title}</div>
                            <div className={styles.summaryQuantity}>x{line.quantity}</div>
                            <div className={styles.summaryValue}>{line.priceLabel}</div>
                          </div>
                        ))}
                      </div>
                      <div className={styles.summaryItems}>
                        <div className={`${styles.summaryRow} ${styles.summaryMetaRow}`}>
                          <div className={styles.summaryName}>Međuzbroj</div>
                          <div className={styles.summarySpacer} aria-hidden="true" />
                          <div className={styles.summaryValue}>{order.subtotalLabel}</div>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.summaryMetaRow}`}>
                          <div className={styles.summaryName}>Dostava</div>
                          <div className={styles.summarySpacer} aria-hidden="true" />
                          <div className={styles.summaryValue}>{order.shippingLabel}</div>
                        </div>
                      </div>
                      <div className={styles.summaryPrice}>
                        <h4>Ukupno</h4>
                        <h4>{order.totalLabel}</h4>
                      </div>
                    </div>
                    <div className={styles.filledData}>
                      <div>
                        <h3>Podaci kupca</h3>
                        <p>
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                        <p>{order.customer.phone}</p>
                        <p>{order.customer.email}</p>
                      </div>
                      <div>
                        <h3>Adresa dostave</h3>
                        <p>{order.shippingAddress.country}</p>
                        <p>{order.shippingAddress.address1}</p>
                        <p>
                          {order.shippingAddress.postcode} {order.shippingAddress.city}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
