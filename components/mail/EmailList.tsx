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
        background: "#111218",
        borderColor: "#1a1b20",
      }}
    >
      {emails.map((email) => (
        <div
          key={email.id}
          className="border-b cursor-pointer transition-colors"
          style={{
            padding: "14px 16px",
            borderColor: "#1a1b20",
            background: email.read ? "transparent" : "rgba(245, 158, 11, 0.02)",
          }}
          onClick={() => onEmailClick?.(email)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1a1b20";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = email.read
              ? "transparent"
              : "rgba(245, 158, 11, 0.02)";
          }}
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
                    color: email.read ? "#a1a1aa" : "#fafafa",
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
                  color: email.read ? "#71717a" : "#d4d4d8",
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
                  color: "#52525b",
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
                color: "#52525b",
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
