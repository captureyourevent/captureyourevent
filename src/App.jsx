import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const COLORS = {
  navy: "#0B1F3A",
  navyLight: "#132845",
  navyMid: "#1C3657",
  gold: "#C9A84C",
  goldLight: "#E2C47A",
  cream: "#F5F0E8",
  white: "#FFFFFF",
  muted: "#8A9BB0",
  border: "#1E3A5F",
  red: "#C0392B",
  green: "#1A7A4A",
  greenLight: "#27AE60",
};

const POLICY_TYPES = ["Wedding", "Bar/Bat Mitzvah", "Birthday", "Engagement", "Photoshoot", "Coperate", "Other"];
const ACTIVITY_TYPES = ["Call", "Email", "Meeting", "Payment", "Follow-up", "Note", "Book"];
const PRIORITY = ["High", "Medium", "Low"];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function Badge({ text, color }) {
  const colors = {
    gold: { bg: "#2A2000", border: "#C9A84C", text: "#E2C47A" },
    green: { bg: "#001A0E", border: "#1A7A4A", text: "#27AE60" },
    red: { bg: "#1A0000", border: "#C0392B", text: "#E74C3C" },
    blue: { bg: "#001429", border: "#1C5A8A", text: "#5BA3D9" },
    muted: { bg: "#0F1E30", border: "#2A4A6A", text: "#8A9BB0" },
  };
  const c = colors[color] || colors.muted;
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      padding: "2px 8px", borderRadius: 3, fontSize: 11, fontWeight: 600,
      letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "monospace",
    }}>{text}</span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(5,12,22,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      backdropFilter: "blur(4px)",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: COLORS.navyLight, border: `1px solid ${COLORS.border}`,
        borderRadius: 8, width: "100%", maxWidth: 540, maxHeight: "90vh",
        overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: `1px solid ${COLORS.border}`,
        }}>
          <span style={{ color: COLORS.goldLight, fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 600 }}>{title}</span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: COLORS.muted, cursor: "pointer",
            fontSize: 20, lineHeight: 1, padding: "0 4px",
          }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", options, required }) {
  const style = {
    width: "100%", background: COLORS.navy, border: `1px solid ${COLORS.border}`,
    borderRadius: 4, color: COLORS.cream, padding: "8px 12px", fontSize: 13,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", color: COLORS.muted, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5, fontFamily: "monospace" }}>
        {label}{required && <span style={{ color: COLORS.gold }}> *</span>}
      </label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={style}>
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{ ...style, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={style} />
      )}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", small, disabled }) {
  const variants = {
    primary: { background: COLORS.gold, color: COLORS.navy, border: "none" },
    ghost: { background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}` },
    danger: { background: "transparent", color: COLORS.red, border: `1px solid ${COLORS.red}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...variants[variant], cursor: disabled ? "not-allowed" : "pointer",
      padding: small ? "5px 12px" : "8px 18px", borderRadius: 4,
      fontSize: small ? 11 : 13, fontWeight: 600, fontFamily: "inherit",
      opacity: disabled ? 0.5 : 1, letterSpacing: "0.03em",
      transition: "opacity 0.15s",
    }}>{children}</button>
  );
}

// ─── FORMS ───────────────────────────────────────────────────────────────────

function ClientForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial.name || "", email: initial.email || "",
    phone: initial.phone || "", heardAboutUs: initial.heardAboutUs || "",
    notes: initial.notes || "",
  });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  return (
    <>
      <Input label="Client Name" value={form.name} onChange={set("name")} required />
      <Input label="Email" type="email" value={form.email} onChange={set("email")} />
      <Input label="Phone" value={form.phone} onChange={set("phone")} />
      <Input label="Heard About Us" value={form.heardAboutUs} onChange={set("heardAboutUs")} />
      <Input label="Notes" type="textarea" value={form.notes} onChange={set("notes")} />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => form.name && onSave(form)} disabled={!form.name}>Save Client</Btn>
      </div>
    </>
  );
}

function PolicyForm({ clientId, initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    type: initial.type || "", insurer: initial.insurer || "",
    effective: initial.effective || "", premium: initial.premium || "",
    notes: initial.notes || "",
  });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Input label="Event Type" value={form.type} onChange={set("type")} options={POLICY_TYPES} required />
        <Input label="Services" value={form.insurer} onChange={set("insurer")} required />
        <Input label="Date of Service" type="date" value={form.effective} onChange={set("effective")} />
        <Input label="Amount" value={form.premium} onChange={set("premium")} />
      </div>
      <Input label="Notes" type="textarea" value={form.notes} onChange={set("notes")} />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => (form.type && form.insurer) && onSave({ ...form, clientId })} disabled={!form.type || !form.insurer}>Save Event</Btn>
      </div>
    </>
  );
}

function ActivityForm({ clientId, initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    type: initial.type || "", subject: initial.subject || "",
    priority: initial.priority || "Medium", dueDate: initial.dueDate || "",
    notes: initial.notes || "", done: initial.done || false,
  });
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Input label="Activity Type" value={form.type} onChange={set("type")} options={ACTIVITY_TYPES} required />
        <Input label="Priority" value={form.priority} onChange={set("priority")} options={PRIORITY} />
        <div style={{ gridColumn: "1/-1" }}>
          <Input label="Subject" value={form.subject} onChange={set("subject")} required />
        </div>
        <Input label="Due Date" type="date" value={form.dueDate} onChange={set("dueDate")} />
      </div>
      <Input label="Notes / Details" type="textarea" value={form.notes} onChange={set("notes")} />
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => (form.type && form.subject) && onSave({ ...form, clientId })} disabled={!form.type || !form.subject}>Save Activity</Btn>
      </div>
    </>
  );
}

// ─── CLIENT DETAIL ────────────────────────────────────────────────────────────

function ClientDetail({ client, policies, activities, onBack, onAddPolicy, onAddActivity, onDeletePolicy, onDeleteActivity, onToggleActivity }) {
  const [tab, setTab] = useState("events");
  const clientPolicies = policies.filter(p => p.clientId === client.id);
  const clientActivities = activities.filter(a => a.clientId === client.id).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (a.dueDate || "9") < (b.dueDate || "9") ? -1 : 1;
  });
  const overdue = clientActivities.filter(a => !a.done && a.dueDate && new Date(a.dueDate) < new Date());

  return (
    <div>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: COLORS.muted, cursor: "pointer",
        fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase",
        fontFamily: "monospace", marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6,
      }}>← All Clients</button>

      <div style={{
        background: COLORS.navyLight, border: `1px solid ${COLORS.border}`,
        borderRadius: 8, padding: "20px 24px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 22, color: COLORS.cream, marginBottom: 4 }}>{client.name}</div>
            {client.heardAboutUs && <div style={{ color: COLORS.gold, fontSize: 13 }}>via {client.heardAboutUs}</div>}
            <div style={{ marginTop: 10, display: "flex", gap: 16, fontSize: 12, color: COLORS.muted }}>
              {client.email && <span>✉ {client.email}</span>}
              {client.phone && <span>✆ {client.phone}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {overdue.length > 0 && <Badge text={`${overdue.length} overdue`} color="red" />}
            <Badge text={`${clientPolicies.length} events`} color="blue" />
            <Badge text={`${clientActivities.filter(a => !a.done).length} open`} color="gold" />
          </div>
        </div>
        {client.notes && <div style={{ marginTop: 14, color: COLORS.muted, fontSize: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>{client.notes}</div>}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
        {["events", "activities"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? COLORS.navyMid : "transparent",
            border: `1px solid ${tab === t ? COLORS.gold : COLORS.border}`,
            color: tab === t ? COLORS.goldLight : COLORS.muted,
            padding: "7px 18px", borderRadius: 4, cursor: "pointer",
            fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase",
            fontFamily: "monospace", fontWeight: 600,
          }}>{t}</button>
        ))}
      </div>

      {tab === "events" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Btn small onClick={onAddPolicy}>+ Add Event</Btn>
          </div>
          {clientPolicies.length === 0 ? (
            <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", padding: "32px 0" }}>No events on file yet.</div>
          ) : clientPolicies.map(p => (
              <div key={p.id} style={{
                background: COLORS.navy, border: `1px solid ${COLORS.border}`,
                borderRadius: 6, padding: "14px 18px", marginBottom: 10,
                display: "grid", gridTemplateColumns: "1fr auto", gap: 8,
              }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ color: COLORS.goldLight, fontWeight: 700, fontSize: 14 }}>{p.type}</span>
                    <span style={{ color: COLORS.muted, fontSize: 12 }}>·</span>
                    <span style={{ color: COLORS.cream, fontSize: 13 }}>{p.insurer}</span>
                  </div>
                  <div style={{ display: "flex", gap: 20, fontSize: 12, color: COLORS.muted, flexWrap: "wrap" }}>
                    {p.premium && <span>Amount: <span style={{ color: COLORS.cream }}>{p.premium}</span></span>}
                    {p.effective && <span>Date of Service: <span style={{ color: COLORS.cream }}>{formatDate(p.effective)}</span></span>}
                  </div>
                  {p.notes && <div style={{ marginTop: 6, color: COLORS.muted, fontSize: 12 }}>{p.notes}</div>}
                </div>
                <button onClick={() => onDeletePolicy(p.id)} style={{
                  background: "none", border: "none", color: COLORS.muted,
                  cursor: "pointer", fontSize: 16, padding: "0 4px", alignSelf: "flex-start",
                }}>×</button>
              </div>
          ))}
        </div>
      )}

      {tab === "activities" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Btn small onClick={onAddActivity}>+ Add Activity</Btn>
          </div>
          {clientActivities.length === 0 ? (
            <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", padding: "32px 0" }}>No activities logged yet.</div>
          ) : clientActivities.map(a => {
            const isOverdue = !a.done && a.dueDate && new Date(a.dueDate) < new Date();
            const priorityColor = { High: "red", Medium: "gold", Low: "muted" }[a.priority] || "muted";
            return (
              <div key={a.id} style={{
                background: COLORS.navy, border: `1px solid ${isOverdue ? COLORS.red : COLORS.border}`,
                borderRadius: 6, padding: "12px 16px", marginBottom: 8,
                display: "flex", gap: 12, alignItems: "flex-start",
                opacity: a.done ? 0.5 : 1,
              }}>
                <input type="checkbox" checked={a.done} onChange={() => onToggleActivity(a.id)}
                  style={{ marginTop: 3, cursor: "pointer", accentColor: COLORS.gold }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ color: a.done ? COLORS.muted : COLORS.cream, fontSize: 13, fontWeight: 600, textDecoration: a.done ? "line-through" : "none" }}>{a.subject}</span>
                    <Badge text={a.type} color="blue" />
                    <Badge text={a.priority} color={priorityColor} />
                    {isOverdue && <Badge text="Overdue" color="red" />}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>
                    {a.dueDate && <span>Due: <span style={{ color: isOverdue ? COLORS.red : COLORS.cream }}>{formatDate(a.dueDate)}</span></span>}
                  </div>
                  {a.notes && <div style={{ marginTop: 5, color: COLORS.muted, fontSize: 12 }}>{a.notes}</div>}
                </div>
                <button onClick={() => onDeleteActivity(a.id)} style={{
                  background: "none", border: "none", color: COLORS.muted,
                  cursor: "pointer", fontSize: 16, padding: "0 4px",
                }}>×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [clients, setClients] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [activities, setActivities] = useState([]);
  const [view, setView] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Load all data from Supabase on mount
  useEffect(() => {
    async function load() {
      try {
        const [{ data: c }, { data: p }, { data: a }] = await Promise.all([
          supabase.from("clients").select("*").order("created_at", { ascending: false }),
          supabase.from("events").select("*").order("created_at", { ascending: false }),
          supabase.from("activities").select("*").order("created_at", { ascending: false }),
        ]);
        if (c) setClients(c);
        if (p) setPolicies(p);
        if (a) setActivities(a);
      } catch (e) {
        setError("Could not connect to database.");
      }
      setLoaded(true);
    }
    load();
  }, []);

  const uid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

  // ── CLIENTS ──
  const addClient = async (form) => {
    const row = { ...form, id: uid(), created_at: new Date().toISOString() };
    const { error } = await supabase.from("clients").insert([row]);
    if (!error) setClients(prev => [row, ...prev]);
    setModal(null);
  };
  const deleteClient = async (id) => {
    await supabase.from("clients").delete().eq("id", id);
    await supabase.from("events").delete().eq("client_id", id);
    await supabase.from("activities").delete().eq("client_id", id);
    setClients(prev => prev.filter(c => c.id !== id));
    setPolicies(prev => prev.filter(p => p.client_id !== id));
    setActivities(prev => prev.filter(a => a.client_id !== id));
  };

  // ── EVENTS (policies) ──
  const addPolicy = async (form) => {
    const row = { ...form, client_id: form.clientId, id: uid(), created_at: new Date().toISOString() };
    delete row.clientId;
    const { error } = await supabase.from("events").insert([row]);
    if (!error) setPolicies(prev => [{ ...row, clientId: row.client_id }, ...prev]);
    setModal(null);
  };
  const deletePolicy = async (id) => {
    await supabase.from("events").delete().eq("id", id);
    setPolicies(prev => prev.filter(p => p.id !== id));
  };

  // ── ACTIVITIES ──
  const addActivity = async (form) => {
    const row = { ...form, client_id: form.clientId, id: uid(), created_at: new Date().toISOString() };
    delete row.clientId;
    const { error } = await supabase.from("activities").insert([row]);
    if (!error) setActivities(prev => [{ ...row, clientId: row.client_id }, ...prev]);
    setModal(null);
  };
  const deleteActivity = async (id) => {
    await supabase.from("activities").delete().eq("id", id);
    setActivities(prev => prev.filter(a => a.id !== id));
  };
  const toggleActivity = async (id) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;
    const newDone = !activity.done;
    await supabase.from("activities").update({ done: newDone }).eq("id", id);
    setActivities(prev => prev.map(a => a.id === id ? { ...a, done: newDone } : a));
  };

  // Normalize client_id → clientId for compatibility with existing components
  const normalizedPolicies = policies.map(p => ({ ...p, clientId: p.clientId || p.client_id }));
  const normalizedActivities = activities.map(a => ({ ...a, clientId: a.clientId || a.client_id }));

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.heardAboutUs || "").toLowerCase().includes(search.toLowerCase())
  );

  // Dashboard stats
  const totalPolicies = normalizedPolicies.length;
  const overdueActivities = normalizedActivities.filter(a => !a.done && a.dueDate && new Date(a.dueDate) < new Date()).length;

  if (!loaded) return (
    <div style={{ background: COLORS.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ color: COLORS.gold, fontFamily: "Georgia, serif", fontSize: 18 }}>Loading...</div>
      {error && <div style={{ color: COLORS.red, fontSize: 13 }}>{error}</div>}
    </div>
  );

  return (
    <div style={{ background: COLORS.navy, minHeight: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: COLORS.cream }}>
      {/* Header */}
      <div style={{
        background: COLORS.navyLight, borderBottom: `1px solid ${COLORS.border}`,
        padding: "0 24px", display: "flex", alignItems: "center", gap: 20, height: 54,
      }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.goldLight, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
          ◈ CaptureYourEvent
        </div>
        <div style={{ width: 1, height: 24, background: COLORS.border }} />
        <div style={{ display: "flex", gap: 16, flex: 1 }}>
          {[["clients", "Clients"], ["activities", "All Activities"]].map(([k, label]) => (
            <button key={k} onClick={() => setView(k)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: view === k ? COLORS.goldLight : COLORS.muted,
              fontSize: 12, letterSpacing: "0.07em", textTransform: "uppercase",
              fontFamily: "monospace", fontWeight: 600, padding: "0 0 2px",
              borderBottom: `2px solid ${view === k ? COLORS.gold : "transparent"}`,
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, fontFamily: "monospace", color: COLORS.muted }}>
          <span>{clients.length} <span style={{ color: COLORS.muted }}>clients</span></span>
          <span style={{ color: overdueActivities > 0 ? COLORS.red : COLORS.muted }}>{overdueActivities} <span>overdue</span></span>
          <span>{totalPolicies} <span>events</span></span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px" }}>

        {/* CLIENT LIST VIEW */}
        {view === "clients" && selectedClient === null && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <input
                placeholder="Search clients..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1, background: COLORS.navyLight, border: `1px solid ${COLORS.border}`,
                  borderRadius: 4, color: COLORS.cream, padding: "8px 14px", fontSize: 13,
                  fontFamily: "inherit", outline: "none",
                }}
              />
              <Btn onClick={() => setModal("addClient")}>+ New Client</Btn>
            </div>

            {filtered.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 0", color: COLORS.muted,
                border: `1px dashed ${COLORS.border}`, borderRadius: 8,
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 16, marginBottom: 6 }}>No clients yet</div>
                <div style={{ fontSize: 12 }}>Add your first client to get started</div>
              </div>
            ) : filtered.map(client => {
              const cp = normalizedPolicies.filter(p => p.clientId === client.id);
              const ca = normalizedActivities.filter(a => a.clientId === client.id && !a.done);
              const od = ca.filter(a => a.dueDate && new Date(a.dueDate) < new Date());
              return (
                <div key={client.id} onClick={() => { setSelectedClient(client); setView("detail"); }}
                  style={{
                    background: COLORS.navyLight, border: `1px solid ${od.length ? COLORS.red : COLORS.border}`,
                    borderRadius: 6, padding: "14px 18px", marginBottom: 8, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "border-color 0.15s",
                  }}>
                  <div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 15, color: COLORS.cream, marginBottom: 2 }}>{client.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>
                      {client.heardAboutUs && <span>via <span style={{ color: COLORS.gold }}>{client.heardAboutUs}</span></span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {od.length > 0 && <Badge text={`${od.length} overdue`} color="red" />}
                    <Badge text={`${cp.length} events`} color="blue" />
                    <Badge text={`${ca.length} open`} color="muted" />
                    <button onClick={e => { e.stopPropagation(); deleteClient(client.id); }}
                      style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16, marginLeft: 4 }}>×</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CLIENT DETAIL VIEW */}
        {view === "detail" && selectedClient && (
          <ClientDetail
            client={selectedClient}
            policies={normalizedPolicies}
            activities={normalizedActivities}
            onBack={() => { setSelectedClient(null); setView("clients"); }}
            onAddPolicy={() => setModal("addPolicy")}
            onAddActivity={() => setModal("addActivity")}
            onDeletePolicy={deletePolicy}
            onDeleteActivity={deleteActivity}
            onToggleActivity={toggleActivity}
          />
        )}

        {/* ALL ACTIVITIES VIEW */}
        {view === "activities" && (
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: COLORS.cream, marginBottom: 16 }}>All Activities</div>
            {activities.length === 0 ? (
              <div style={{ color: COLORS.muted, textAlign: "center", padding: "40px 0" }}>No activities logged.</div>
            ) : [...normalizedActivities].sort((a, b) => {
              if (a.done !== b.done) return a.done ? 1 : -1;
              return (a.dueDate || "9") < (b.dueDate || "9") ? -1 : 1;
            }).map(a => {
              const client = clients.find(c => c.id === a.clientId);
              const isOverdue = !a.done && a.dueDate && new Date(a.dueDate) < new Date();
              const priorityColor = { High: "red", Medium: "gold", Low: "muted" }[a.priority] || "muted";
              return (
                <div key={a.id} style={{
                  background: COLORS.navyLight, border: `1px solid ${isOverdue ? COLORS.red : COLORS.border}`,
                  borderRadius: 6, padding: "12px 16px", marginBottom: 8,
                  display: "flex", gap: 12, alignItems: "flex-start",
                  opacity: a.done ? 0.45 : 1,
                }}>
                  <input type="checkbox" checked={a.done} onChange={() => toggleActivity(a.id)}
                    style={{ marginTop: 3, cursor: "pointer", accentColor: COLORS.gold }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ color: a.done ? COLORS.muted : COLORS.cream, fontSize: 13, fontWeight: 600, textDecoration: a.done ? "line-through" : "none" }}>{a.subject}</span>
                      <Badge text={a.type} color="blue" />
                      <Badge text={a.priority} color={priorityColor} />
                      {isOverdue && <Badge text="Overdue" color="red" />}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.muted, display: "flex", gap: 14 }}>
                      {client && (
                        <span onClick={() => { setSelectedClient(client); setView("detail"); }}
                          style={{ color: COLORS.gold, cursor: "pointer" }}>
                          {client.name}
                        </span>
                      )}
                      {a.dueDate && <span>Due: <span style={{ color: isOverdue ? COLORS.red : COLORS.cream }}>{formatDate(a.dueDate)}</span></span>}
                    </div>
                    {a.notes && <div style={{ marginTop: 4, color: COLORS.muted, fontSize: 12 }}>{a.notes}</div>}
                  </div>
                  <button onClick={() => deleteActivity(a.id)} style={{
                    background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16
                  }}>×</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALS */}
      {modal === "addClient" && (
        <Modal title="New Client" onClose={() => setModal(null)}>
          <ClientForm onSave={addClient} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === "addPolicy" && selectedClient && (
        <Modal title={`Add Event — ${selectedClient.name}`} onClose={() => setModal(null)}>
          <PolicyForm clientId={selectedClient.id} onSave={addPolicy} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === "addActivity" && selectedClient && (
        <Modal title={`Log Activity — ${selectedClient.name}`} onClose={() => setModal(null)}>
          <ActivityForm clientId={selectedClient.id} onSave={addActivity} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
