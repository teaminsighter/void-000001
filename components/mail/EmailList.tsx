"use client";

import { Email } from "@/lib/types";
import { Badge } from "@/components/ui";

interface EmailListProps {
  emails: Email[];
  onEmailClick?: (email: Email) => void;
}

export default function EmailList({ emails, onEmailClick }: EmailListProps) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        background: "var(--void-surface)",
        borderColor: "var(--void-border)",
      }}
    >
      {emails.map((email) => (
        <div
          key={email.id}
          className="border-b cursor-pointer void-hover-row"
          style={{
            padding: "14px 16px",
            borderColor: "var(--void-border)",
            background: email.read ? "transparent" : "rgba(245, 158, 11, 0.02)",
          }}
          onClick={() => onEmailClick?.(email)}
        >
          <div className="flex items-start justify-between gap-3">
            <div style={{ flex: 1 }}>
              {/* From + Badges */}
              <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                {!email.read && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#f59e0b",
                      flexShrink: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: email.read ? 400 : 600,
                    color: email.read ? "var(--void-muted)" : "var(--void-white)",
                  }}
                >
                  {email.from}
                </span>
                {email.urgent && <Badge variant="urgent">Urgent</Badge>}
              </div>

              {/* Subject */}
              <div
                style={{
                  fontSize: 12.5,
                  color: email.read ? "var(--void-dim)" : "var(--void-text)",
                  fontWeight: email.read ? 400 : 500,
                  marginBottom: 4,
                }}
              >
                {email.subject}
              </div>

              {/* Preview */}
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--void-faint)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {email.preview}
              </div>
            </div>

            {/* Time */}
            <div
              style={{
                fontSize: 10.5,
                color: "var(--void-faint)",
                flexShrink: 0,
              }}
            >
              {email.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
