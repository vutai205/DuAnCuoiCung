interface Props {
    title: string;
    total: number | string;
    color: string;
}

const Card = ({ title, total, color }: Props) => {
    const formattedTotal = (title === "Tổng Doanh Thu" || title === "Revenue") && typeof total === "number"
        ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)
        : total;

    return (
        <div
            className="card"
            style={{
                borderTop: `5px solid ${color}`,
            }}
        >
            <h3>{title}</h3>

            <h1>{formattedTotal}</h1>
        </div>
    );
};

export default Card;
