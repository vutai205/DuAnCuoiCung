export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            width: "200px",
          }}
        >
          <h3>Phim</h3>
          <p>0</p>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            width: "200px",
          }}
        >
          <h3>Suất chiếu</h3>
          <p>0</p>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            width: "200px",
          }}
        >
          <h3>Vé đã bán</h3>
          <p>0</p>
        </div>
      </div>
    </div>
  );
}