"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowDownLeft, ArrowUpRight, Bell, Check, ChevronDown, Clock3, Headphones, LayoutDashboard, MessageSquareText, MoreHorizontal, Phone, Search, Settings2, ShieldCheck, Sparkles, Timer, Users, X } from "lucide-react";

const initialQueue = [
  { id: "CS-2841", name: "Olivia Chen", initials: "OC", color: "lilac", issue: "Order delivery · #48291", time: "Waiting 08:42", priority: "High", status: "Waiting", channel: "Inbound" },
  { id: "CS-2840", name: "Marcus Johnson", initials: "MJ", color: "blue", issue: "Product question · Whey isolate", time: "Waiting 05:16", priority: "Normal", status: "Waiting", channel: "Inbound" },
  { id: "CS-2839", name: "Ava Patel", initials: "AP", color: "peach", issue: "Subscription · Update payment", time: "Waiting 03:08", priority: "Normal", status: "Waiting", channel: "Callback" },
  { id: "CS-2838", name: "Noah Williams", initials: "NW", color: "mint", issue: "Return request · #48107", time: "Waiting 01:34", priority: "Low", status: "Waiting", channel: "Inbound" },
];

const activityItems = [
  { icon: ArrowDownLeft, title: "Inbound call completed", detail: "Emma Wilson · Order status", time: "10:42 AM", tone: "green" },
  { icon: ArrowUpRight, title: "Callback scheduled", detail: "James Miller · Today, 11:30 AM", time: "10:18 AM", tone: "blue" },
  { icon: Check, title: "Case resolved", detail: "Sophia Davis · Product exchange", time: "9:56 AM", tone: "green" },
];

const tabs = ["All calls", "Inbound", "Callbacks"];

export default function PhoneSupportDashboard({ user, onSignOut }) {
  const [queue, setQueue] = useState(initialQueue);
  const [selectedId, setSelectedId] = useState(initialQueue[0].id);
  const [activeTab, setActiveTab] = useState("All calls");
  const [search, setSearch] = useState("");
  const [calling, setCalling] = useState(false);
  const [notice, setNotice] = useState("");
  const selected = queue.find((call) => call.id === selectedId);
  const filteredQueue = useMemo(() => queue.filter((call) => {
    const matchesTab = activeTab === "All calls" || (activeTab === "Inbound" ? call.channel === "Inbound" : call.channel === "Callback");
    const matchesSearch = `${call.name} ${call.issue} ${call.id}`.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  }), [activeTab, queue, search]);

  function startCall() {
    if (!selected) return;
    setCalling(true);
    setNotice(`Call workspace opened for ${selected.name}`);
  }

  function finishCall() {
    if (!selected) return;
    setQueue((current) => current.filter((call) => call.id !== selected.id));
    const next = queue.find((call) => call.id !== selected.id);
    setSelectedId(next?.id || "");
    setCalling(false);
    setNotice(`Call with ${selected.name} marked complete`);
  }

  return (
    <div className="support-app">
      <aside className="support-sidebar">
        <a className="support-brand" href="/employee" aria-label="Helio customer care home"><span className="support-brand-mark"><Headphones size={19} strokeWidth={2.2} /></span><span><strong>helio</strong><small>CUSTOMER CARE</small></span></a>
        <div className="support-nav-label">WORKSPACE</div>
        <nav className="support-nav" aria-label="Support navigation">
          <a className="selected" href="#overview"><LayoutDashboard size={17} />Overview</a>
          <a href="#queue"><Phone size={17} />Call queue<span className="nav-count">{queue.length}</span></a>
          <a href="#activity"><Activity size={17} />Call history</a>
          <a href="#team"><Users size={17} />Team</a>
        </nav>
        <div className="support-sidebar-bottom">
          <div className="support-status"><span className="status-dot" /><span><strong>Available</strong><small>Taking calls</small></span><ChevronDown size={15} /></div>
          <button className="support-profile" type="button" onClick={onSignOut} aria-label="Sign out"><span className="profile-avatar">{(user.name || "A").slice(0, 1).toUpperCase()}</span><span><strong>{user.name || "Alex Morgan"}</strong><small>Phone support</small></span><MoreHorizontal size={18} /></button>
        </div>
      </aside>

      <main className="support-main" id="overview">
        <header className="support-topbar"><div className="support-breadcrumb">Support <span>/</span> <strong>Overview</strong></div><div className="support-top-actions"><span className="live-indicator"><i /> Queue live</span><button className="support-icon-button" type="button" aria-label="Notifications"><Bell size={17} /><i /></button><button className="support-icon-button" type="button" aria-label="Settings"><Settings2 size={17} /></button></div></header>
        <div className="support-content">
          <section className="support-heading"><div><p className="support-eyebrow">SATURDAY, NOVEMBER 28, 2026 <span>·</span> YOUR SHIFT IS ON TRACK</p><h1>Good morning, {user.name?.split(" ")[0] || "Alex"}<span>.</span></h1><p>Here&apos;s what&apos;s happening with your calls today.</p></div><div className="shift-chip"><span className="shift-chip-icon"><Timer size={15} /></span><span><small>SHIFT ENDS IN</small><strong>4h 22m</strong></span></div></section>

          <section className="support-metrics" aria-label="Today's performance">
            <article className="support-metric"><div className="metric-top"><span>Calls handled</span><span className="metric-icon green"><Phone size={16} /></span></div><strong>28</strong><div className="metric-foot"><span className="trend-up"><ArrowUpRight size={13} /> 12%</span><span>vs. daily average</span></div></article>
            <article className="support-metric"><div className="metric-top"><span>Avg. handle time</span><span className="metric-icon blue"><Clock3 size={16} /></span></div><strong>4<span className="metric-unit">m</span> 32<span className="metric-unit">s</span></strong><div className="metric-foot"><span className="trend-up"><ArrowDownLeft size={13} /> 8%</span><span>faster this week</span></div></article>
            <article className="support-metric"><div className="metric-top"><span>Customer satisfaction</span><span className="metric-icon amber"><Sparkles size={16} /></span></div><strong>96<span className="metric-unit">%</span></strong><div className="metric-foot"><span className="metric-stars">★★★★★</span><span>from 24 ratings</span></div></article>
            <article className="support-metric"><div className="metric-top"><span>First call resolution</span><span className="metric-icon violet"><Check size={16} /></span></div><strong>89<span className="metric-unit">%</span></strong><div className="metric-foot"><span className="metric-neutral">On target</span><span>team goal 85%</span></div></article>
          </section>

          <section className="support-work-grid">
            <article className="support-panel queue-panel" id="queue">
              <div className="panel-heading"><div><div className="panel-title-row"><h2>Call queue</h2><span className="queue-live-badge"><i /> LIVE</span></div><p>Customers waiting for your help</p></div><button className="panel-more" type="button" aria-label="More queue options"><MoreHorizontal size={19} /></button></div>
              <div className="queue-summary"><span><strong>{queue.length}</strong> waiting</span><span className="queue-summary-divider" /><span>Longest wait <strong>08:42</strong></span><span className="queue-sla"><i /> SLA healthy</span></div>
              <div className="queue-controls"><div className="queue-tabs" role="tablist" aria-label="Filter calls">{tabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} type="button" onClick={() => setActiveTab(tab)}>{tab}{tab === "All calls" && <span>{queue.length}</span>}</button>)}</div><label className="queue-search"><Search size={14} /><input aria-label="Search call queue" placeholder="Search calls" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
              <div className="queue-list">{filteredQueue.length ? filteredQueue.map((call) => <button key={call.id} className={`queue-row ${selectedId === call.id ? "is-selected" : ""}`} type="button" onClick={() => { setSelectedId(call.id); setCalling(false); }}><span className={`customer-avatar ${call.color}`}>{call.initials}</span><span className="queue-customer"><strong>{call.name}</strong><small>{call.issue}</small></span><span className="queue-time"><strong>{call.time}</strong><small>{call.id}</small></span><span className={`priority-pill ${call.priority.toLowerCase()}`}>{call.priority}</span><span className="queue-chevron">›</span></button>) : <div className="queue-empty">No calls match your search.</div>}</div>
              <div className="queue-footer"><span>Showing <strong>{filteredQueue.length}</strong> of <strong>{queue.length}</strong> calls</span><button type="button" onClick={() => { setActiveTab("All calls"); setSearch(""); }}>View full queue <ArrowUpRight size={14} /></button></div>
            </article>

            <article className={`support-panel call-panel ${calling ? "call-in-progress" : ""}`}>
              <div className="panel-heading"><div><div className="panel-title-row"><h2>{calling ? "Call in progress" : "Next up"}</h2><span className="call-type"><ArrowDownLeft size={12} /> INBOUND</span></div><p>{calling ? "You’re connected with this customer" : "Your next customer is ready"}</p></div><button className="panel-more" type="button" aria-label="Call options"><MoreHorizontal size={19} /></button></div>
              {selected ? <><div className="caller-profile"><div className={`customer-avatar large ${selected.color}`}>{selected.initials}<span className="caller-online" /></div><div className="caller-details"><h3>{selected.name}</h3><p>Customer since March 2024 <span>·</span> Gold member</p><div className="caller-tags"><span>Returning customer</span><span>Order #48291</span></div></div></div><div className="call-reason"><span className="reason-icon"><MessageSquareText size={16} /></span><span><small>CALL REASON</small><strong>{selected.issue}</strong></span><button type="button" aria-label="View customer details"><ArrowUpRight size={15} /></button></div><div className="customer-context"><div><span>Last interaction</span><strong>Nov 24, 2026</strong></div><div><span>Previous calls</span><strong>2 calls</strong></div><div><span>Sentiment</span><strong className="sentiment-positive"><Sparkles size={13} /> Positive</strong></div></div><div className="call-note"><ShieldCheck size={15} /><span>Customer details are protected and visible to authorized staff only.</span></div><div className="call-actions">{calling ? <><button className="call-end-button" type="button" onClick={finishCall}><Phone size={16} /> End call &amp; wrap up</button><button className="call-secondary" type="button" aria-label="Mute call"><X size={15} /></button></> : <><button className="call-start-button" type="button" onClick={startCall}><Phone size={16} /> Answer call</button><button className="call-secondary" type="button" onClick={() => setNotice(`Callback scheduled for ${selected.name}`)} aria-label="Schedule callback"><Clock3 size={16} /></button></>}</div></> : <div className="no-next-call"><span><Check size={21} /></span><strong>You&apos;re all caught up</strong><p>We&apos;ll let you know when a customer needs help.</p></div>}
            </article>
          </section>

          <section className="support-panel activity-panel" id="activity"><div className="panel-heading"><div><h2>Recent activity</h2><p>Your latest customer interactions</p></div><button className="activity-view-all" type="button">View call history <ArrowUpRight size={14} /></button></div><div className="activity-list">{activityItems.map(({ icon: Icon, title, detail, time, tone }) => <div className="activity-row" key={title}><span className={`activity-icon ${tone}`}><Icon size={15} /></span><span className="activity-description"><strong>{title}</strong><small>{detail}</small></span><time>{time}</time><button className="activity-more" type="button" aria-label={`More options for ${title}`}><MoreHorizontal size={17} /></button></div>)}</div></section>
          <footer className="support-footer"><span>helio support workspace <span>·</span> v2.4.0</span><span><ShieldCheck size={13} /> Secure connection</span></footer>
          {notice && <div className="support-toast" role="status"><Check size={15} />{notice}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={14} /></button></div>}
        </div>
      </main>
    </div>
  );
}
