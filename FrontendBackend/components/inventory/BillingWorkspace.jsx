"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, Minus, Plus, Printer, Search, ShoppingBag, Trash2 } from "lucide-react";
import "./billing-workspace.css";

const formatMoney = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(amount) || 0);
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "—";

export default function BillingWorkspace({ shops, products, batches, selectedShopId, sales, salesData, salesError, salesLoading, salesFrom, salesTo, salesPage, onShopChange, onDateChange, onPageChange, onSelectSale, onInvoiceCreated }) {
  const [view, setView] = useState("create");
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState("0");
  const [taxPercent, setTaxPercent] = useState("0");
  const [cart, setCart] = useState([]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const activeShops = shops.filter((shop) => shop.active !== false);
  const billingShopId = selectedShopId || activeShops[0]?._id || "";
  const availableProducts = useMemo(() => products.map((product) => {
    const stock = batches.filter((batch) => batch.productId === product._id && batch.shopId === billingShopId && batch.active !== false && new Date(batch.expiryDate) > new Date()).reduce((sum, batch) => sum + Number(batch.availableQty || 0), 0);
    return { ...product, availableStock: stock };
  }).filter((product) => `${product.name} ${product.sku || ""} ${product.category || ""} ${product.brand || ""} ${product.flavor || ""} ${product.barcode || ""}`.toLowerCase().includes(search.toLowerCase())), [products, batches, billingShopId, search]);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const taxable = Math.max(0, subtotal - safeDiscount);
  const tax = taxable * Math.min(Math.max(Number(taxPercent) || 0, 0), 28) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addProduct(product) {
    if (!product.availableStock) return;
    setCart((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) return current.map((item) => item._id === product._id ? { ...item, quantity: Math.min(item.quantity + 1, product.availableStock) } : item);
      return [...current, { _id: product._id, name: product.name, sku: product.sku || "", price: Number(product.unitPrice) || 0, quantity: 1, availableStock: product.availableStock }];
    });
  }

  function changeQuantity(productId, delta) {
    setCart((current) => current.map((item) => item._id === productId ? { ...item, quantity: Math.min(item.availableStock, item.quantity + delta) } : item).filter((item) => item.quantity > 0));
  }

  async function createBill(event) {
    event.preventDefault();
    if (!billingShopId || !cart.length) return;
    setBusy(true);
    setFormError("");
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sale", shopId: billingShopId, items: cart.map((item) => ({ productId: item._id, quantity: item.quantity })), customerName, customerPhone: phone, customerAddress: address, discount: safeDiscount, taxPercent: Number(taxPercent) || 0, paymentMethod }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not generate this bill.");
      setCart([]);
      setCustomerName("");
      setPhone("");
      setAddress("");
      setDiscount("0");
      setTaxPercent("0");
      onInvoiceCreated(result.sale);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="billing-workspace">
    <div className="billing-page-heading">
      <div><p className="billing-kicker">POINT OF SALE</p><h1>{view === "create" ? "Billing System" : "Billing History"}</h1><p>{view === "create" ? "Create bills and manage inventory sales" : "Review recorded bills and print customer copies"}</p></div>
      <button className="billing-history-toggle" type="button" onClick={() => setView(view === "create" ? "history" : "create")}>
        {view === "create" ? <><Clock3 size={18} /> Billing History</> : <><ArrowLeft size={18} /> Back to billing</>}
      </button>
    </div>

    {view === "create" ? <form className="billing-grid" onSubmit={createBill}>
      <div className="billing-form-column">
        <section className="billing-card customer-card">
          <div className="billing-card-title"><div><span className="billing-step">01</span><h2>Customer Information</h2></div></div>
          <div className="billing-fields">
            <label>Phone number <span aria-hidden="true">*</span><input type="tel" autoComplete="tel" inputMode="tel" maxLength={24} placeholder="Enter phone number" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
            <label>Customer name <span aria-hidden="true">*</span><input autoComplete="name" maxLength={120} placeholder="Enter customer name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required /></label>
            <label className="billing-address">Address<textarea autoComplete="street-address" maxLength={500} placeholder="Enter address" rows={2} value={address} onChange={(event) => setAddress(event.target.value)} /></label>
            <label>Shop <span aria-hidden="true">*</span><select value={billingShopId} onChange={(event) => onShopChange(event.target.value)} required disabled={activeShops.length <= 1}>{activeShops.map((shop) => <option key={shop._id} value={shop._id}>{shop.name}</option>)}</select></label>
            <label>Payment method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="bank">Bank transfer</option></select></label>
          </div>
        </section>

        <section className="billing-card products-card">
          <div className="billing-card-title"><div><span className="billing-step">02</span><h2>Select Products</h2></div><span className="billing-result-count">{availableProducts.length} products</span></div>
          <label className="billing-search"><Search size={17} /><span className="sr-only">Search products</span><input placeholder="Search name, SKU, category, flavor…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="billing-product-list" aria-label="Available products">
            {availableProducts.map((product) => <article className="billing-product" key={product._id}>
              <div className="billing-product-copy"><h3>{product.name}</h3><p>{[product.sku, product.category, product.flavor, product.unitValue && `${product.unitValue}${product.unit || ""}`].filter(Boolean).join(" · ") || "Supplement product"}</p><div className="billing-product-meta"><strong>{formatMoney(product.unitPrice)}</strong><span className={product.availableStock ? "billing-stock" : "billing-stock is-empty"}>{product.availableStock} in stock</span></div></div>
              <button className="billing-add-button" type="button" onClick={() => addProduct(product)} disabled={!product.availableStock} aria-label={`Add ${product.name} to bill`}><Plus size={17} /> Add</button>
            </article>)}
            {!availableProducts.length && <p className="billing-empty">{search ? "No products match your search." : "No active products available for this shop."}</p>}
          </div>
        </section>
      </div>

      <aside className="billing-card bill-preview" aria-label="Bill preview">
        <div className="billing-card-title"><div><span className="billing-step">03</span><h2>Bill Preview</h2></div><span className="billing-cart-count">{itemCount} items</span></div>
        {cart.length ? <div className="billing-cart-list">{cart.map((item) => <article className="billing-cart-item" key={item._id}>
          <div className="billing-cart-item-name"><strong>{item.name}</strong><span>{formatMoney(item.price)} each</span></div>
          <div className="billing-quantity-control"><button type="button" onClick={() => changeQuantity(item._id, -1)} aria-label={`Decrease ${item.name} quantity`}><Minus size={14} /></button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(item._id, 1)} disabled={item.quantity >= item.availableStock} aria-label={`Increase ${item.name} quantity`}><Plus size={14} /></button><button className="billing-remove" type="button" onClick={() => setCart((current) => current.filter((entry) => entry._id !== item._id))} aria-label={`Remove ${item.name}`}><Trash2 size={14} /></button></div>
          <strong className="billing-line-total">{formatMoney(item.price * item.quantity)}</strong>
        </article>)}</div> : <div className="billing-cart-empty"><ShoppingBag size={25} /><p>No items added yet</p><span>Choose products to start this bill.</span></div>}
        <div className="billing-totals">
          <div><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
          <label><span>Discount</span><span className="billing-amount-input"><span>₹</span><input aria-label="Discount amount" type="number" min="0" max={subtotal} step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} /></span></label>
          <label><span>Tax</span><span className="billing-amount-input"><input aria-label="Tax percentage" type="number" min="0" max="28" step="0.01" value={taxPercent} onChange={(event) => setTaxPercent(event.target.value)} /><span>%</span></span></label>
          <div className="billing-grand-total"><span>Grand total</span><strong>{formatMoney(total)}</strong></div>
        </div>
        {formError && <p className="billing-form-error" role="alert">{formError}</p>}
        <button className="billing-generate-button" type="submit" disabled={busy || !cart.length || !billingShopId || !customerName.trim() || !phone.trim()}><Printer size={17} />{busy ? "Generating bill…" : "Generate Bill"}<ArrowRight size={17} /></button>
        <p className="billing-secure-note">Stock is updated only after this bill is confirmed.</p>
      </aside>
    </form> : <section className="billing-card billing-history-card">
      <div className="billing-history-filters"><label>From<input aria-label="Sales date from" type="date" value={salesFrom} onChange={(event) => onDateChange("from", event.target.value)} /></label><label>To<input aria-label="Sales date to" type="date" value={salesTo} onChange={(event) => onDateChange("to", event.target.value)} /></label><span>{salesData?.total ?? 0} bills</span></div>
      {salesError && <p className="billing-form-error" role="alert">{salesError.message}</p>}
      {salesLoading ? <div className="billing-empty">Loading billing history…</div> : <div className="billing-history-table-wrap"><table><thead><tr><th>INVOICE</th><th>DATE</th><th>SHOP</th><th>PRODUCT</th><th>QTY</th><th>PAYMENT</th><th>TOTAL</th><th></th></tr></thead><tbody>{sales.map((sale) => <tr key={sale._id}><td><strong>{sale.invoiceNumber}</strong></td><td>{formatDate(sale.createdAt)}</td><td>{sale.shopName}</td><td>{sale.productName}<small>{sale.productSku}</small></td><td>{sale.quantity}</td><td>{String(sale.paymentMethod || "cash").toUpperCase()}</td><td>{formatMoney(sale.total)}</td><td><button className="billing-view-button" type="button" onClick={() => onSelectSale(sale)}>View invoice</button></td></tr>)}</tbody></table>{!sales.length && <p className="billing-empty">No bills in this date range. Completed bills will appear here.</p>}</div>}
      {(salesData?.pageCount || 0) > 1 && <div className="billing-pagination"><button type="button" disabled={salesPage <= 1} onClick={() => onPageChange(Math.max(1, salesPage - 1))}>Previous</button><span>Page {salesPage} of {salesData.pageCount}</span><button type="button" disabled={salesPage >= salesData.pageCount} onClick={() => onPageChange(salesPage + 1)}>Next</button></div>}
    </section>}
  </section>;
}
