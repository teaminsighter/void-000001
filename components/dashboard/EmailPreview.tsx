"use client";

import { Email } from "@/lib/types";

interface EmailPreviewProps {
  emails: Email[];
  limit?: number;
}

export default function EmailPreview({ emails, limit = 4 }: EmailPreviewProps) {
  const displayEmails = emails.slice(0, limit);

  return (
    <div style={{ padding: 8 }}>
      {displayEmails.map((email) => (
        <div
          key={email.id}
          className="flex items-center gap-2 rounded-md transition-colors"
          style={{ padding: "7px 8px" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          {/* Status dot */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: email.urgent
                ? "#ef4444"
                : email.read
                ? "transparent"
                : "#3b82f6",
              flexShrink: 0,
            }}
          />

          {/* Email content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: email.read ? 400 : 600,
                color: email.read ? "#52525b" : "#e4e4e7",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {email.from}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "#52525b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {email.subject}
            </div>
          </div>

          {/* Time */}
          <span
            className="font-mono"
            style={{
              fontSize: 9.5,
              color: "#3f3f46",
              whiteSpace: "nowrap",
            }}
          >
            {email.time}
          </span>
        </div>
      ))}
    </div>
  );
}
