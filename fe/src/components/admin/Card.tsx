interface Props {
    title: string;
    total: number;
    color: string;
}

const Card = ({ title, total, color }: Props) => {
    return (
        <div
            className="card"
            style={{
                borderTop: `5px solid ${color}`,
            }}
        >
            <h3>{title}</h3>

            <h1>{total}</h1>
        </div>
    );
};

export default Card;
