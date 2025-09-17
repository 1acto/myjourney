import { useMemo, useRef, useState, useEffect } from "react";
import { useBranches, type Branch } from "@/hooks/useBranches";
import "./BranchesPage.css";
import { Button } from "@heroui/button";
import { LuEllipsis, LuMenu } from "react-icons/lu";
import { Badge } from "@heroui/badge";
import Sidebar from "@/components/layout/sidebar";
import { Avatar } from "@heroui/react";

interface BranchCardProps {
  branch: Branch;
}

interface BranchesPageProps {
  onCreate?: () => void;
  notifyCount?: number;
  onOpenRequests?: () => void;
  requestCount?: number;
}

type SortBy = "code" | "name" | "parcel" | "created" | "updated";
type SortDirection = "asc" | "desc";

// ✅ การ์ดแสดงข้อมูลสาขา
function BranchCard({ branch }: BranchCardProps) {
  const {
    code, // เช่น MXP-001
    name, // ชื่อสาขา
    address, // ที่อยู่
    zipCode, // รหัสไปรษณีย์
    parcelCount = 0, // ยอดพัสดุ
    salesName = "ไม่ระบุ",
    salesAvatar,
    createdAt, // วันที่สร้าง
    updatedAt, // อัพเดตล่าสุด
    color = "purple", // สี badge ยอดพัสดุ: purple|blue|pink|orange
  } = branch || {};

  const fmt = (d: string | null | undefined): string => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return "-";
      return `${dt.toLocaleDateString()} @ ${dt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return "-";
    }
  };

  // Safe string handling for JSX attributes
  const safeName = name || "ไม่ระบุชื่อ";
  const safeAddress = address || "ไม่ระบุที่อยู่";
  const safeCode = code || "-";
  const safeZipCode = zipCode || "-";
  const safeColor = color || "purple";
  const safeSalesName = salesName || "ไม่ระบุ";
  console.log(salesAvatar);

  return (
    <article className="branch-card" role="listitem" aria-label={safeName}>
      {/* กลุ่มป้ายด้านบน */}
      <div
        className="branch-card__badges"
        role="group"
        aria-label="ตัวบ่งชี้สาขา"
      >
        <span className="badge badge--chip">{safeCode}</span>

        <span className={`chip chip--parcel chip--${safeColor}`}>
          <span className="chip__dot" aria-hidden="true" />
          <span className="chip__text">
            ยอดพัสดุ: {parcelCount?.toLocaleString?.() ?? 0}
          </span>
        </span>

        <span className="badge badge--soft">รหัสไปรษณีย์: {safeZipCode}</span>
      </div>

      <h3 className="branch-card__title">{safeName}</h3>
      <p className="branch-card__address">{safeAddress}</p>

      <div className="branch-card__meta">
        <div className="branch-card__owner">
          <Avatar src={salesAvatar || ""} size="sm"></Avatar>
          <span>{safeSalesName}</span>
        </div>
        <div className="branch-card__dates">
          <span>สร้างเมื่อ: {fmt(createdAt)}</span>
          <span>อัพเดตล่าสุด: {fmt(updatedAt)}</span>
        </div>
      </div>
    </article>
  );
}

export default function BranchesPage({
  notifyCount = 1,
  onOpenRequests = () => {},
  requestCount = 3,
}: BranchesPageProps) {
  // Use the custom hook for branch data
  const { branches, loading, error } = useBranches();

  const [open, setOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const popRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // ---------- state สำหรับค้นหา/กรอง/เรียง ----------
  const [q, setQ] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("code"); // code | name | parcel | created | updated
  const [sortDir, setSortDir] = useState<SortDirection>("asc"); // asc | desc
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  // ปิดป๊อปอัพเมื่อคลิกรอบนอกหรือกด Esc
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return;
      if (
        popRef.current &&
        !popRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ---------- ค้นหา/กรอง/เรียง ----------
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = branches.filter((b) => {
      if (!needle) return true;
      return (
        (b.name ?? "").toLowerCase().includes(needle) ||
        (b.code ?? "").toLowerCase().includes(needle) ||
        (b.address ?? "").toLowerCase().includes(needle) ||
        (b.zipCode ?? "").toString().includes(needle)
      );
    });

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortBy) {
        case "name":
          return (a.name ?? "").localeCompare(b.name ?? "") * dir;
        case "parcel":
          return ((a.parcelCount ?? 0) - (b.parcelCount ?? 0)) * dir;
        case "created":
          // Safe date comparison
          const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return (aCreated - bCreated) * dir;
        case "updated":
          // Safe date comparison
          const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return (aUpdated - bUpdated) * dir;
        case "code":
        default:
          return (a.code ?? "").localeCompare(b.code ?? "") * dir;
      }
    });

    return list;
  }, [branches, q, sortBy, sortDir]);

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortBy);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };

  const handleFilterSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };

  const handleFilterSortByChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSortBy(e.target.value as SortBy);
  };

  return (
    <section className="page">
      {/* แถวหัวข้อ */}
      <div className="pagebar">
        <Button
          size="lg"
          isIconOnly
          aria-label="menu"
          color="secondary"
          onClick={() => setSidebarOpen(true)}
          ref={btnRef}
        >
          <LuMenu />
        </Button>

        <h1 className=" font-bold text-3xl text-center">จัดการสาขา</h1>

        <div className="kebab-wrap">
          <Badge color="primary" content={notifyCount} size="md">
            <Button
              size="lg"
              isIconOnly
              aria-label="more"
              color="secondary"
              onClick={() => setOpen((v) => !v)}
              ref={btnRef}
            >
              <LuEllipsis />
            </Button>
          </Badge>
          {open && (
            <div className="menu-pop" ref={popRef} role="menu">
              <button
                className="menu-pop__item"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  window.location.href = "/branches/create";
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>สร้างสาขา</span>
              </button>

              <button
                className="menu-pop__item"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onOpenRequests();
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M4 8h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V8z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>คำขอสร้าง</span>
                {requestCount > 0 && (
                  <span className="badge badge--inline">{requestCount}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* แถวค้นหา */}
      <div className="search-row">
        <div className="search-input">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle
              cx="11"
              cy="11"
              r="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M20 20l-3.5-3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={q}
            onChange={handleSearchChange}
            placeholder="ค้นหา"
            aria-label="ค้นหาสาขา"
          />
        </div>

        {/* ปุ่มกรอง */}
        <button
          className="btn btn--soft btn--icon"
          aria-label="ตัวกรอง"
          onClick={() => setFilterOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M3 5h18M6 12h12M10 19h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* แถวหัวข้อรายการ + เลือกเรียง */}
      <div className="section-head">
        <h2 className="section-title">รายการสาขา:</h2>

        <div className="sort-wrap">
          <select
            className="select"
            value={sortBy}
            onChange={handleSortByChange}
            aria-label="เรียงตาม"
          >
            <option value="code">หมายเลขสาขา</option>
            <option value="name">ชื่อสาขา</option>
            <option value="parcel">ยอดพัสดุ</option>
            <option value="created">วันที่สร้าง</option>
            <option value="updated">อัพเดตล่าสุด</option>
          </select>

          <button
            className="btn btn--soft btn--icon"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            aria-label="สลับการเรียง"
            title={sortDir === "asc" ? "เรียงน้อย→มาก" : "เรียงมาก→น้อย"}
          >
            {sortDir === "asc" ? (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M7 17V7m0 0l-3 3m3-3l3 3M17 7v10m0 0l3-3m-3 3l-3-3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M7 7v10m0 0l3-3m-3 3l-3-3M17 17V7m0 0l-3 3m3-3l3 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* รายการการ์ดสาขา */}
      <div className="page-section" role="list" aria-busy={loading}>
        {loading && <p className="muted">กำลังโหลดข้อมูล…</p>}
        {!loading && error && (
          <div className="error-state">
            <p className="muted">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
            <p className="muted">กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ</p>
          </div>
        )}
        {!loading &&
          !error &&
          filtered.length === 0 &&
          branches.length === 0 && <p className="muted">ไม่มีข้อมูลสาขา</p>}
        {!loading && !error && filtered.length === 0 && branches.length > 0 && (
          <p className="muted">ไม่พบสาขาตามเงื่อนไขที่ค้นหา</p>
        )}
        {!loading &&
          !error &&
          filtered.map((b) => <BranchCard key={b.id ?? b.code} branch={b} />)}
      </div>

      {/* Modal ฟิลเตอร์อย่างง่าย */}
      {filterOpen && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label="ตัวกรอง"
        >
          <div className="modal__panel">
            <div className="modal__head">
              <h3>ตัวกรอง</h3>
              <button
                className="btn btn--soft btn--icon"
                onClick={() => setFilterOpen(false)}
                aria-label="ปิด"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="modal__body">
              <div className="form-row">
                <label>คำค้นหา</label>
                <input
                  value={q}
                  onChange={handleFilterSearchChange}
                  placeholder="ชื่อ/โค้ด/ที่อยู่/รหัสไปรษณีย์"
                />
              </div>
              <div className="form-row">
                <label>เรียงตาม</label>
                <select value={sortBy} onChange={handleFilterSortByChange}>
                  <option value="code">หมายเลขสาขา</option>
                  <option value="name">ชื่อสาขา</option>
                  <option value="parcel">ยอดพัสดุ</option>
                  <option value="created">วันที่สร้าง</option>
                  <option value="updated">อัพเดตล่าสุด</option>
                </select>
              </div>
              <div className="form-row">
                <label>ทิศทางการเรียง</label>
                <div className="btn-group">
                  <button
                    className={`btn ${sortDir === "asc" ? "btn--primary" : "btn--soft"}`}
                    onClick={() => setSortDir("asc")}
                  >
                    น้อย → มาก
                  </button>
                  <button
                    className={`btn ${sortDir === "desc" ? "btn--primary" : "btn--soft"}`}
                    onClick={() => setSortDir("desc")}
                  >
                    มาก → น้อย
                  </button>
                </div>
              </div>
            </div>

            <div className="modal__foot">
              <button
                className="btn btn--soft"
                onClick={() => setFilterOpen(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Component */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notifyCount={notifyCount}
      />
    </section>
  );
}
