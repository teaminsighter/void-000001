"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProviderType, ProviderStatus } from "@/lib/ai/types";

interface ProviderInfo {
  type: ProviderType;
  displayName: string;
  models: { id: string; name: string }[];
  defaultModel: string;
  hasApiKey: boolean;
}

interface SettingsData {
  provider: ProviderType;
  model: string;
  providers: ProviderInfo[];
}

interface StatusData {
  statuses: Record<ProviderType, ProviderStatus>;
  checkedAt: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [statuses, setStatuses] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      const res = await fetch("/api/settings/status");
      const data = await res.json();
      setStatuses(data);
    } catch (error) {
      console.error("Failed to check status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    checkStatus();
  }, [loadSettings, checkStatus]);

  const selectProvider = async (provider: ProviderType) => {
    if (!settings) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const providerInfo = settings.providers.find((p) => p.type === provider);
      const model = providerInfo?.defaultModel || "";

      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, model }),
      });

      setSettings({ ...settings, provider, model });
      setSaveMessage("Settings saved");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveMessage("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const selectModel = async (model: string) => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });
      setSettings({ ...settings, model });
    } catch (error) {
      console.error("Failed to save model:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: ProviderStatus | undefined) => {
    if (!status) return "var(--void-dim)";
    if (status.connected) return "#34d399";
    if (status.errorType === "billing") return "#f59e0b";
    return "#ef4444";
  };

  const getStatusIcon = (status: ProviderStatus | undefined) => {
    if (!status) return "?";
    if (status.connected) return "✓";
    if (status.errorType === "billing") return "$";
    return "✕";
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24, color: "var(--void-faint)" }}>
        Loading settings...
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={{ padding: 24, color: "var(--void-faint)" }}>
        Failed to load settings
      </div>
    );
  }

  const currentProvider = settings.providers.find(
    (p) => p.type === settings.provider
  );

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="void-heading">Settings</h1>
        <div className="void-subheading">Configure your AI providers</div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          style={{
            padding: "8px 12px",
            marginBottom: 16,
            borderRadius: 6,
            background:
              saveMessage === "Settings saved"
                ? "rgba(52, 211, 153, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
            color: saveMessage === "Settings saved" ? "#34d399" : "#ef4444",
            fontSize: 12,
          }}
        >
          {saveMessage}
        </div>
      )}

      {/* Provider Selection */}
      <div className="void-card" style={{ padding: 20, marginBottom: 16 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--void-white)",
            marginBottom: 12,
          }}
        >
          AI Provider
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {settings.providers.map((provider) => {
            const status = statuses?.statuses[provider.type];
            const isSelected = settings.provider === provider.type;

            return (
              <button
                key={provider.type}
                onClick={() => selectProvider(provider.type)}
                disabled={isSaving}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: isSelected
                    ? "2px solid var(--void-accent)"
                    : "1px solid var(--void-border)",
                  background: isSelected
                    ? "rgba(245, 158, 11, 0.1)"
                    : "var(--void-surface)",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  textAlign: "left",
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: isSelected ? "var(--void-accent)" : "var(--void-white)",
                    }}
                  >
                    {provider.displayName.split(" ")[0]}
                  </span>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      background: getStatusColor(status),
                      color: "#000",
                    }}
                  >
                    {getStatusIcon(status)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--void-dim)",
                    marginTop: 4,
                  }}
                >
                  {provider.displayName.split("(")[1]?.replace(")", "") || provider.type}
                </div>
                {status && !status.connected && (
                  <div
                    style={{
                      fontSize: 10,
                      color: getStatusColor(status),
                      marginTop: 6,
                    }}
                  >
                    {status.error}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Selection */}
      {currentProvider && (
        <div className="void-card" style={{ padding: 20, marginBottom: 16 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--void-white)",
              marginBottom: 12,
            }}
          >
            Model
          </div>
          <select
            value={settings.model}
            onChange={(e) => selectModel(e.target.value)}
            disabled={isSaving}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid var(--void-border)",
              background: "var(--void-surface)",
              color: "var(--void-white)",
              fontSize: 13,
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            {currentProvider.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Check */}
      <div className="void-card" style={{ padding: 20 }}>
        <div className="flex items-center justify-between">
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--void-white)",
              }}
            >
              Provider Status
            </div>
            {statuses && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--void-faint)",
                  marginTop: 2,
                }}
              >
                Last checked:{" "}
                {new Date(statuses.checkedAt).toLocaleTimeString()}
              </div>
            )}
          </div>
          <button
            onClick={checkStatus}
            disabled={isCheckingStatus}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid var(--void-border)",
              background: "var(--void-surface)",
              color: "var(--void-white)",
              fontSize: 12,
              cursor: isCheckingStatus ? "not-allowed" : "pointer",
              opacity: isCheckingStatus ? 0.6 : 1,
            }}
          >
            {isCheckingStatus ? "Checking..." : "Refresh Status"}
          </button>
        </div>

        {statuses && (
          <div style={{ marginTop: 16 }}>
            {Object.entries(statuses.statuses).map(([type, status]) => {
              const provider = settings.providers.find((p) => p.type === type);
              return (
                <div
                  key={type}
                  className="flex items-center justify-between"
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid var(--void-border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: getStatusColor(status),
                      }}
                    />
                    <span style={{ fontSize: 12, color: "var(--void-text)" }}>
                      {provider?.displayName || type}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: status.connected ? "#34d399" : getStatusColor(status),
                    }}
                  >
                    {status.connected
                      ? "Connected"
                      : status.error || "Not connected"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* API Key Notice */}
      <div
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 6,
          background: "rgba(245, 158, 11, 0.05)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
        }}
      >
        <div style={{ fontSize: 11, color: "var(--void-dim)" }}>
          API keys are configured via environment variables. Set{" "}
          <code
            style={{
              background: "var(--void-surface)",
              padding: "2px 4px",
              borderRadius: 3,
            }}
          >
            ANTHROPIC_API_KEY
          </code>
          ,{" "}
          <code
            style={{
              background: "var(--void-surface)",
              padding: "2px 4px",
              borderRadius: 3,
            }}
          >
            OPENAI_API_KEY
          </code>
          , or{" "}
          <code
            style={{
              background: "var(--void-surface)",
              padding: "2px 4px",
              borderRadius: 3,
            }}
          >
            GOOGLE_AI_API_KEY
          </code>{" "}
          in your .env.local file.
        </div>
      </div>
    </div>
  );
}
