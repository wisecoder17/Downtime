import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { usePowerSync, useQuery } from "@powersync/react";
import SyncIndicator from "../components/SyncIndicator";
import AIPanel from "../components/AIPanel";
import UpdateFeed from "../components/UpdateFeed";

const severityColor: Record<string, string> = {
  critical: "var(--red)",
  high: "var(--amber)",
  medium: "var(--blue)",
  low: "var(--green)",
};

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = usePowerSync();


  const { data: incidents } = useQuery("SELECT * FROM incidents WHERE id = ?", [
    id,
  ]);
  const { data: updates } = useQuery(
    "SELECT * FROM incident_updates WHERE incident_id = ? ORDER BY created_at ASC",
    [id],
  );

  const incident = incidents?.[0];
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  
  // Local state buffer to ensure instant UI update when poll succeeds,
  // bypassing any PowerSync sync-stream propagation delay.
  const [localDiagnosis, setLocalDiagnosis] = useState<{diag: string|null, actions: string|null}>({ diag: null, actions: null });
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Diagnosis polling: when ai_diagnosis is absent, ask the server every 2s.
  // Writes the result directly to local SQLite so usePowerSyncQuery reacts immediately.
  // This bypasses the PowerSync sync-stream delay for server-written AI data.
  useEffect(() => {
    if (!id) return;

    const currentDiag = incident?.ai_diagnosis || localDiagnosis.diag;
    if (currentDiag) {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/diagnosis/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.ai_diagnosis) {
          // 1. Update local state for INSTANT UI reaction
          setLocalDiagnosis({ diag: data.ai_diagnosis, actions: data.ai_actions });
          
          // 2. Persist to local SQLite for permanence
          await db.execute(
            'UPDATE incidents SET ai_diagnosis = ?, ai_actions = ? WHERE id = ?',
            [data.ai_diagnosis, data.ai_actions || null, id]
          );
          
          if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
        }
      } catch { /* keep polling */ }
    };

    poll();
    pollingRef.current = setInterval(poll, 1500); 
    return () => { if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; } };
  }, [id, incident?.ai_diagnosis, localDiagnosis.diag, db]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !author) return;

    const updateId = uuidv4();
    const now = new Date().toISOString();
    const timeLabel = new Date().toLocaleTimeString();

    await db.execute(
      `INSERT INTO incident_updates (id, incident_id, content, author, created_at) VALUES (?, ?, ?, ?, ?)`,
      [updateId, id, content, author, now],
    );
    console.log(
      `[${timeLabel}] 📝 Update posted by ${author}: "${content.substring(0, 20)}..."`,
    );
    setContent("");
  };

  const markInvestigating = async () => {
    const timeLabel = new Date().toLocaleTimeString();
    await db.execute(
      `UPDATE incidents SET status = 'investigating' WHERE id = ?`,
      [id],
    );
    console.log(`[${timeLabel}] 🔍 Incident ${id} marked as INVESTIGATING`);
  };

  const markResolved = async () => {
    const timeLabel = new Date().toLocaleTimeString();
    const now = new Date().toISOString();
    await db.execute(
      `UPDATE incidents SET status = 'resolved', resolved_at = ? WHERE id = ?`,
      [now, id],
    );
    console.log(`[${timeLabel}] ✅ Incident ${id} marked as RESOLVED`);
  };

  if (!incident) return null;

  const sev = incident?.severity?.toLowerCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        paddingBottom: "60px",
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          height: "56px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "18px",
              flexShrink: 0,
              transition: "color var(--transition)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            ←
          </button>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.15em",
              color: "var(--text-primary)",
            }}
          >
            <span style={{ color: "var(--red)" }}>●</span> DOWNTIME
          </span>
        </div>
        <SyncIndicator />
      </header>

      <main
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "28px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: "24px",
        }}
      >
        {/* Left column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            minWidth: 0,
          }}
        >
          {/* Description block */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "16px 20px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                marginBottom: "8px",
              }}
            >
              DESCRIPTION
            </div>
            <div
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                fontSize: "14px",
              }}
            >
              {incident.description}
            </div>
          </div>

          <AIPanel 
            incident={{
              ...incident,
              ai_diagnosis: incident?.ai_diagnosis || localDiagnosis.diag,
              ai_actions: incident?.ai_actions || localDiagnosis.actions
            }} 
          />

          {/* Updates */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                borderBottom: "1px solid var(--border)",
                padding: "12px 16px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Updates
              </span>
            </div>
            <div style={{ padding: "16px" }}>
              <UpdateFeed updates={updates || []} />
            </div>

            {/* Add Update Form */}
            <form
              onSubmit={handleUpdate}
              style={{
                borderTop: "1px solid var(--border)",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                placeholder="Post a status update..."
                style={{ resize: "none" }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  style={{ flex: "0 0 140px" }}
                />
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "border-color var(--transition)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-bright)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                >
                  Post Update
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column — metadata + actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Metadata card */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              marginBottom: "12px",
            }}
          >
            {[
              { label: "TITLE", value: incident.title },
              {
                label: "SEVERITY",
                value: incident.severity?.toUpperCase(),
                color: severityColor[sev],
              },
              { label: "REPORTED BY", value: incident.created_by },
              {
                label: "OPENED",
                value: new Date(incident.created_at).toLocaleString(),
              },
              incident.resolved_at && {
                label: "RESOLVED",
                value: new Date(incident.resolved_at).toLocaleString(),
                color: "var(--green)",
              },
            ]
              .filter(Boolean)
              .map((field: any, i, arr) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      letterSpacing: "0.1em",
                      marginBottom: "4px",
                    }}
                  >
                    {field.label}
                  </div>
                  <div
                    style={{
                      fontFamily:
                        field.label === "OPENED" || field.label === "RESOLVED"
                          ? "var(--font-mono)"
                          : "var(--font-sans)",
                      fontSize: "13px",
                      color: field.color || "var(--text-primary)",
                      fontWeight: field.label === "SEVERITY" ? 700 : 400,
                    }}
                  >
                    {field.value}
                  </div>
                </div>
              ))}
          </div>

          {/* Action buttons */}
          {incident.status !== "resolved" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <button
                onClick={markInvestigating}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "8px",
                  background: "transparent",
                  border: "1.5px solid var(--amber)",
                  borderRadius: "var(--radius)",
                  color: "var(--amber)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  transition: "background var(--transition)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--amber-dim)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                MARK INVESTIGATING
              </button>

              <button
                onClick={markResolved}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "var(--green)",
                  border: "1.5px solid var(--green)",
                  borderRadius: "var(--radius)",
                  color: "#000",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  transition: "opacity var(--transition)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                MARK RESOLVED ✓
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
