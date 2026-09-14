import React from "react";

interface Props {
    title: string;
    total: number | string;
    color: string;
    icon?: string;
    subtitle?: string;
    trend?: string;
}

const Card: React.FC<Props> = ({ title, total, color, icon = "📊", subtitle, trend }) => {
    const formattedTotal = (title.includes("Doanh Thu") || title.includes("Revenue")) && typeof total === "number"
        ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)
        : total;

    return (
        <div
            className="stat-card-item"
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                minHeight: "140px",
                background: "#ffffff",
                borderRadius: "14px",
                padding: "20px 22px",
                boxShadow: "0 4px 18px rgba(0, 0, 0, 0.05)",
                borderLeft: `5px solid ${color}`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
        >
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: "1.3" }}>
                        {title}
                    </span>
                    <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: `${color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        flexShrink: 0
                    }}>
                        {icon}
                    </div>
                </div>

                <div style={{
                    fontSize: "1.7rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    marginTop: 12,
                    lineHeight: "1.2",
                    wordBreak: "break-word"
                }}>
                    {formattedTotal}
                </div>
            </div>

            {(subtitle || trend) && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 14,
                    paddingTop: 10,
                    borderTop: "1px solid #f1f5f9",
                    fontSize: "0.78rem",
                    color: "#94a3b8"
                }}>
                    <span>{subtitle}</span>
                    {trend && <span style={{ color: "#10b981", fontWeight: 700 }}>{trend}</span>}
                </div>
            )}
        </div>
    );
};

export default Card;
