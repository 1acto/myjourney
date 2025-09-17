import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TagsPage.css";

interface Tag {
  id: number;
  name: string;
  color: string;
  desc: string;
  bg?: string;
}

const seed: Tag[] = [
  { id: 1, name: "คู่แข่ง", color: "#ef2d7a", desc: "คู่แข่งของบริษัท" },
  {
    id: 2,
    name: "ร้านค้า",
    color: "#10b981",
    desc: "ร้านค้าต่าง ๆ (ร้านสะดวกซื้อ, ร้านข้าว)",
  },
  { id: 3, name: "ไปรษณีย์", color: "#f59e0b", desc: "จุดทำการไปรษณีย์" },
  { id: 4, name: "โรงเรียน", color: "#7c3aed", desc: "โรงเรียนต่าง ๆ" },
  { id: 5, name: "โรงแรม", color: "#1d4ed8", desc: "พื้นที่พักผ่อน" },
  // ใส่เพิ่มได้
];

export default function TagsPage(): JSX.Element {
  const navigate = useNavigate();

  // pagination demo
  const [page, setPage] = useState<number>(1);
  const pageSize: number = 5;
  const total: number = seed.length;
  const pages: number = Math.max(1, Math.ceil(total / pageSize));

  const rows = useMemo((): Tag[] => {
    const start = (page - 1) * pageSize;
    return seed.slice(start, start + pageSize);
  }, [page]);

  return (
    <div className="tags-wrap">
      {/* close (กลับหน้าแผนที่) */}
      <button
        className="tags-close"
        aria-label="ปิด"
        onClick={() => navigate("/")}
      >
        ✕
      </button>

      <div className="tags-head">
        <h1>จัดการแท็ก</h1>
        <p>จัดการสร้าง, แก้ไข, ลบ แท็กระบุประเภทสถานที่</p>
      </div>

      {/* actions */}
      <div className="tags-actions">
        <button className="btn ghost">
          <span className="plus">+</span> เพิ่มแท็กใหม่
        </button>
        <button id="edit" className="btn warn">
          แก้ไข
        </button>
        <button className="btn danger">ลบ</button>
      </div>

      {/* table */}
      <div className="card">
        <div className="table-head">
          <span>แท็ก</span>
          <span>คำอธิบาย</span>
        </div>

        <div className="table-body">
          {rows.map((r) => (
            <div key={r.id} className="table-row">
              <div className="tag-cell">
                <span
                  className="pill"
                  style={{
                    color: "#fff",
                    background: r.color,
                    boxShadow: `0 0 0 6px ${r.bg}`,
                  }}
                >
                  {r.name}
                </span>
              </div>
              <div className="desc-cell">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* pagination */}
      <div className="pager">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`page-btn ${p === page ? "active" : ""}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
