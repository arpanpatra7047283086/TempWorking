const navigationItems = ["Overview", "Shops", "Employees", "Transfers", "Inventory", "Billing", "Expiry", "Activity"];

export default function InventoryLoadingBackdrop() {
  return (
    <div className="inventory-shell inventory-loading-backdrop" aria-hidden="true">
      <aside className="inventory-sidebar">
        <div className="inventory-brand">
          <span className="brand-monogram">SS</span>
          <span><strong>SS SUPPLEMENT</strong><small>STORE OPERATIONS</small></span>
        </div>
        <div className="side-caption">WORKSPACE</div>
        <nav className="side-nav">
          {navigationItems.map((item, index) => (
            <div className={`inventory-loading-nav-item ${index === 0 ? "active" : ""}`} key={item}>
              <span className="inventory-loading-nav-icon" />
              {item}
            </div>
          ))}
        </nav>
      </aside>

      <main className="inventory-main">
        <header className="inventory-topbar">
          <div className="crumb">SS Supplement <span>/</span> <strong>Overview</strong></div>
          <span className="secure-indicator"><i /> Secure workspace</span>
        </header>
        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">BUSINESS OVERVIEW</p>
              <h1>Good business starts here.</h1>
              <p className="heading-subtitle">A live view of stock and performance across your stores.</p>
            </div>
            <span className="date-chip">Loading overview</span>
          </div>

          <section className="metric-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <article className="metric-card inventory-loading-metric" key={index}>
                <span className="inventory-loading-skeleton inventory-loading-skeleton-icon" />
                <span className="inventory-loading-skeleton inventory-loading-skeleton-value" />
                <span className="inventory-loading-skeleton inventory-loading-skeleton-label" />
              </article>
            ))}
          </section>

          <section className="overview-grid">
            {["Stock watch", "Store locations"].map((title) => (
              <article className="surface-card inventory-loading-panel" key={title}>
                <div className="card-heading"><h2>{title}</h2></div>
                {[0, 1, 2].map((row) => (
                  <div className="inventory-loading-row" key={row}>
                    <span className="inventory-loading-skeleton inventory-loading-skeleton-dot" />
                    <span className="inventory-loading-skeleton inventory-loading-skeleton-row" />
                    <span className="inventory-loading-skeleton inventory-loading-skeleton-count" />
                  </div>
                ))}
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
