import React, { useState, useEffect, useCallback } from "react";

// ---------- constants ----------
const INK = "#161412";
const PAPER = "#F2EFE4";
const RED = "#C8443E";
const MOSS = "#5B6B4E";
const STAMP = "#8A8470";

const SEED_FEED = [
  {
    type: "item",
    id: "item-001",
    name: "[Item name]",
    price: "£0",
    condition: "[condition — e.g. new, used, well-loved]",
    desc: "[Short description of the item, what it is, why it's worth having.]",
    status: "available", // available | reserved | gone
  },
  {
    type: "post",
    id: "post-001",
    title: "[Post title]",
    date: "2026-06-19",
    body: "[Write here.]",
  },
  {
    type: "item",
    id: "item-002",
    name: "[Item name]",
    price: "£0",
    condition: "[condition]",
    desc: "[Short description.]",
    status: "available",
  },
  {
    type: "item",
    id: "item-003",
    name: "[Item name]",
    price: "£0",
    condition: "[condition]",
    desc: "[Short description.]",
    status: "available",
  },
  {
    type: "post",
    id: "post-002",
    title: "[Post title]",
    date: "2026-06-19",
    body: "[Write here.]",
  },
  {
    type: "item",
    id: "item-004",
    name: "[Item name]",
    price: "£0",
    condition: "[condition]",
    desc: "[Short description.]",
    status: "available",
  },
  {
    type: "item",
    id: "item-005",
    name: "[Item name]",
    price: "£0",
    condition: "[condition]",
    desc: "[Short description.]",
    status: "available",
  },
  {
    type: "post",
    id: "post-003",
    title: "[Post title]",
    date: "2026-06-19",
    body: "[Write here.]",
  },
  {
    type: "item",
    id: "item-006",
    name: "[Item name]",
    price: "£0",
    condition: "[condition]",
    desc: "[Short description.]",
    status: "available",
  },
];

const PLUS_CODE = "[Your Plus Code here]";
const CONTACT_NOTE =
  "Cash on collection only. Message below, I'll reply with the Plus Code meetup spot and a time.";

// ---------- storage helpers ----------
async function loadFeed() {
  try {
    const r = await window.storage.get("feed", true);
    if (r && r.value) return JSON.parse(r.value);
  } catch (e) {
    /* not set yet */
  }
  return SEED_FEED;
}

async function saveFeed(feed) {
  try {
    await window.storage.set("feed", JSON.stringify(feed), true);
  } catch (e) {
    console.error("save feed failed", e);
  }
}

async function loadReservations() {
  try {
    const r = await window.storage.get("reservations", true);
    if (r && r.value) return JSON.parse(r.value);
  } catch (e) {
    /* not set yet */
  }
  return {};
}

async function saveReservations(res) {
  try {
    await window.storage.set("reservations", JSON.stringify(res), true);
  } catch (e) {
    console.error("save reservations failed", e);
  }
}

// ---------- small components ----------

function Tape({ rotate = -2, left = "8%" }) {
  return (
    <div
      style={{
        position: "absolute",
        top: -10,
        left,
        width: 70,
        height: 22,
        background: "rgba(242,239,228,0.55)",
        border: "1px solid rgba(22,20,18,0.12)",
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
      }}
    />
  );
}

function StatusTag({ status }) {
  const map = {
    available: { label: "FOR SALE", bg: RED, fg: PAPER },
    reserved: { label: "RESERVED", bg: MOSS, fg: PAPER },
    gone: { label: "GONE", bg: STAMP, fg: PAPER },
  };
  const s = map[status] || map.available;
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "'Courier New', monospace",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        padding: "3px 8px",
        background: s.bg,
        color: s.fg,
        transform: "rotate(-1.5deg)",
        border: `1px solid ${INK}`,
      }}
    >
      {s.label}
    </span>
  );
}

function ItemCard({ item, onReserve }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const rotate = item.id.charCodeAt(item.id.length - 1) % 2 === 0 ? -1.4 : 1.6;

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setErr("Fill in both fields — need a way to reply to you.");
      return;
    }
    setErr("");
    await onReserve(item.id, { name, message, at: new Date().toISOString() });
    setSent(true);
  };

  return (
    <div
      style={{
        position: "relative",
        background: "#FBFAF4",
        border: `1px solid ${INK}`,
        padding: "22px 20px 20px",
        margin: "44px auto",
        maxWidth: 480,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "3px 5px 0 rgba(22,20,18,0.08)",
      }}
    >
      <Tape rotate={rotate < 0 ? -8 : 6} left={rotate < 0 ? "12%" : "62%"} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <h3
          style={{
            fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            fontSize: 20,
            margin: 0,
            color: INK,
            lineHeight: 1.15,
          }}
        >
          {item.name}
        </h3>
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 18,
            fontWeight: 700,
            color: INK,
            whiteSpace: "nowrap",
            border: `1.5px dashed ${INK}`,
            padding: "2px 7px",
            transform: "rotate(3deg)",
          }}
        >
          {item.price}
        </span>
      </div>

      <p
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          color: STAMP,
          margin: "6px 0 10px",
          fontStyle: "italic",
        }}
      >
        condition: {item.condition}
      </p>

      <p style={{ fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.5, color: INK, margin: "0 0 14px" }}>
        {item.desc}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: open ? 14 : 0 }}>
        <StatusTag status={item.status} />
        {item.status === "available" && !open && !sent && (
          <button
            onClick={() => setOpen(true)}
            style={{
              fontFamily: "'Oswald', sans-serif",
              textTransform: "uppercase",
              fontSize: 13,
              letterSpacing: "0.05em",
              background: INK,
              color: PAPER,
              border: "none",
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            I want this →
          </button>
        )}
      </div>

      {item.status !== "available" && (
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: STAMP, marginTop: 10 }}>
          {item.status === "reserved" ? "Someone's already on this one." : "This one's found a home."}
        </p>
      )}

      {open && !sent && (
        <form onSubmit={submit} style={{ borderTop: `1px dashed ${STAMP}`, paddingTop: 14 }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: STAMP, margin: "0 0 10px" }}>
            {CONTACT_NOTE}
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontFamily: "Georgia, serif",
              fontSize: 14,
              padding: "8px 10px",
              marginBottom: 8,
              border: `1px solid ${INK}`,
              background: PAPER,
            }}
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="When/where works for you, or any questions"
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontFamily: "Georgia, serif",
              fontSize: 14,
              padding: "8px 10px",
              marginBottom: 8,
              border: `1px solid ${INK}`,
              background: PAPER,
              resize: "vertical",
            }}
          />
          {err && <p style={{ color: RED, fontFamily: "Courier New, monospace", fontSize: 12 }}>{err}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              style={{
                fontFamily: "'Oswald', sans-serif",
                textTransform: "uppercase",
                fontSize: 13,
                background: RED,
                color: PAPER,
                border: "none",
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                fontFamily: "'Oswald', sans-serif",
                textTransform: "uppercase",
                fontSize: 13,
                background: "transparent",
                color: INK,
                border: `1px solid ${INK}`,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {sent && (
        <div style={{ borderTop: `1px dashed ${STAMP}`, paddingTop: 14 }}>
          <p style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: MOSS, margin: 0 }}>
            ✓ Sent. Marked as reserved for you — I'll message back with the meetup spot ({PLUS_CODE}).
          </p>
        </div>
      )}
    </div>
  );
}

function PostCard({ post }) {
  return (
    <article style={{ maxWidth: 560, margin: "48px auto", padding: "0 22px" }}>
      <p
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          letterSpacing: "0.08em",
          color: STAMP,
          margin: "0 0 6px",
          textTransform: "uppercase",
        }}
      >
        {post.date}
      </p>
      <h2
        style={{
          fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
          textTransform: "uppercase",
          fontSize: 28,
          lineHeight: 1.1,
          letterSpacing: "0.01em",
          color: INK,
          margin: "0 0 14px",
        }}
      >
        {post.title}
      </h2>
      <p style={{ fontFamily: "Georgia, serif", fontSize: 16.5, lineHeight: 1.65, color: INK, margin: 0 }}>
        {post.body}
      </p>
    </article>
  );
}

// ---------- main app ----------

export default function App() {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | posts | shop

  useEffect(() => {
    (async () => {
      const f = await loadFeed();
      setFeed(f);
      setLoading(false);
    })();
  }, []);

  const handleReserve = useCallback(
    async (itemId, details) => {
      const reservations = await loadReservations();
      reservations[itemId] = reservations[itemId] || [];
      reservations[itemId].push(details);
      await saveReservations(reservations);

      setFeed((prev) => {
        const next = prev.map((entry) =>
          entry.type === "item" && entry.id === itemId ? { ...entry, status: "reserved" } : entry
        );
        saveFeed(next);
        return next;
      });
    },
    []
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: PAPER,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Courier New', monospace",
          color: STAMP,
        }}
      >
        loading the feed…
      </div>
    );
  }

  const visible = feed.filter((e) => {
    if (filter === "all") return true;
    if (filter === "posts") return e.type === "post";
    if (filter === "shop") return e.type === "item";
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        button:focus-visible, input:focus-visible, textarea:focus-visible {
          outline: 3px solid ${RED};
          outline-offset: 1px;
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      <header
        style={{
          borderBottom: `3px solid ${INK}`,
          padding: "30px 20px 18px",
          textAlign: "center",
          background: PAPER,
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        <p
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: STAMP,
            margin: "0 0 6px",
            textTransform: "uppercase",
          }}
        >
          reallifetalkblog.com
        </p>
        <h1
          style={{
            fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
            textTransform: "uppercase",
            fontSize: "clamp(28px, 6vw, 44px)",
            letterSpacing: "0.01em",
            color: INK,
            margin: "0 0 4px",
            lineHeight: 1,
          }}
        >
          The Modern Worldly<br />Curiosity Shop
        </h1>
        <p
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: 14,
            color: STAMP,
            margin: "8px 0 0",
          }}
        >
          cash-only curiosity shop, collection only
        </p>

        <nav style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 18 }}>
          {[
            ["all", "Everything"],
            ["posts", "Dispatches"],
            ["shop", "Shop"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                fontFamily: "'Oswald', sans-serif",
                textTransform: "uppercase",
                fontSize: 12,
                letterSpacing: "0.05em",
                padding: "7px 14px",
                background: filter === key ? INK : "transparent",
                color: filter === key ? PAPER : INK,
                border: `1px solid ${INK}`,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div style={{ maxWidth: 420, margin: "20px auto 0" }}>
          <iframe
            style={{ borderRadius: 8 }}
            src="https://open.spotify.com/embed/track/7ceZcPIitRCjo6i5b7ioD3?utm_source=generator&theme=0"
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="FUNEMPLOYED by Andy Goodwin on Spotify"
          />
        </div>
      </header>

      <main style={{ paddingBottom: 60 }}>
        {visible.map((entry) =>
          entry.type === "post" ? (
            <PostCard key={entry.id} post={entry} />
          ) : (
            <ItemCard key={entry.id} item={entry} onReserve={handleReserve} />
          )
        )}
      </main>

      <footer
        style={{
          borderTop: `3px solid ${INK}`,
          padding: "24px 20px 40px",
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: STAMP, margin: 0 }}>
          everything here is real, cash only, collection only — message on any item to arrange
        </p>
      </footer>
    </div>
  );
}
