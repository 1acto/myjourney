import { useRef, useState, useEffect, useMemo } from "react"; // ❗️ เพิ่ม useMemo
import "./BranchesPage.css";
import { Button } from "@heroui/button";
import { LuEllipsis, LuMenu } from "react-icons/lu";
import { Badge } from "@heroui/badge";
import Sidebar from "@/components/layout/sidebar";
import { Avatar } from "@heroui/react";

//ลอง tanstack query
import { useQuery } from "@tanstack/react-query";
import getBranchesQueryOption from "@/queryOption/branches/getBranchesQueryOption";

type SortBy = "code" | "name" | "parcel" | "created" | "updated";
type SortDirection = "asc" | "desc";

// ❗️ COMPONENT PAGINATION (เพิ่มใหม่)
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination-wrap" aria-label="Pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {pageNumbers.map((number) => (
        <button
          key={number}
          className={`pagination-btn ${currentPage === number ? "is-active" : ""}`}
          onClick={() => onPageChange(number)}
          aria-current={currentPage === number ? "page" : undefined}
        >
          {number}
        </button>
      ))}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}

export default function BranchesPage({
  notifyCount = 1,
  onOpenRequests = () => {},
  requestCount = 3,
}) {
  // Use the custom hook for branch data
  const [open, setOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const popRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { data: branchLists, isPending } = useQuery(getBranchesQueryOption());

  // ---------- state สำหรับค้นหา/กรอง/เรียง ----------
  const [q, setQ] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("code"); // code | name | parcel | created | updated
  const [sortDir, setSortDir] = useState<SortDirection>("asc"); // asc | desc
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  // ❗️ STATE PAGINATION (เพิ่มใหม่)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // ❗️ EFFECT PAGINATION (เพิ่มใหม่)
  // Reset หน้า 1 เมื่อมีการกรอง/ค้นหา
  useEffect(() => {
    setCurrentPage(1);
  }, [q, sortBy, sortDir]);

  // ❗️ ค้นหา/กรอง/เรียง (แก้ไข)
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    // ใช้ข้อมูลจาก useQuery (branchLists)
    let list = (branchLists || []).filter((b: any) => {
      if (!needle) return true;
      return (
        (b.name ?? "").toLowerCase().includes(needle) ||
        (b.id ?? "").toString().toLowerCase().includes(needle) || // ❗️ อัปเดต (id)
        (b.location?.address ?? "").toLowerCase().includes(needle) || // ❗️ อัปเดต (location.address)
        (b.location?.zipCode ?? "").toString().includes(needle) // ❗️ อัปเดต (location.zipCode)
      );
    });

    list.sort((a: any, b: any) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortBy) {
        case "name":
          return (a.name ?? "").localeCompare(b.name ?? "") * dir;
        case "parcel":
          return ((a.parcelCount ?? 0) - (b.parcelCount ?? 0)) * dir;
        case "created":
          const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return (aCreated - bCreated) * dir;
        case "updated":
          const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return (aUpdated - bUpdated) * dir;
        case "code": // ❗️ อัปเดต ( assuming 'code' in dropdown means 'id')
        default:
          return (a.id ?? "").toString().localeCompare((b.id ?? "").toString()) * dir;
      }
    });

    return list;
  }, [branchLists, q, sortBy, sortDir]); // ❗️ อัปเดต dependency

  // ❗️ LOGIC PAGINATION (เพิ่มใหม่)
  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // ตัดข้อมูลเฉพาะหน้าปัจจุบัน
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [currentPage, filtered]);

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
    e: React.ChangeEvent<HTMLSelectElement>,
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

      {/* ❗️ รายการการ์ดสาขา (อัปเดต) ❗️ */}
      <div className="page-section" role="list" aria-busy={isPending}>
        {isPending && <p className="muted">กำลังโหลดข้อมูล…</p>}
        {!isPending &&
          branchLists &&
          filtered.length === 0 && (
            <p className="muted">ไม่พบสาขาตามเงื่อนไขที่ค้นหา</p>
          )}
        {!isPending &&
          (!branchLists || branchLists.length === 0) && (
            <p className="muted">ไม่มีข้อมูลสาขา</p>
          )}

        {/* ❗️ Map over 'paginatedItems' */}
        {!isPending &&
          paginatedItems.map((branch: any) => (
            <BranchCard key={branch.id} {...branch} />
          ))}
      </div>

      {/* ❗️ เพิ่ม Pagination UI (เพิ่มใหม่) ❗️ */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

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

// ❗️ การ์ดแสดงข้อมูลสาขา (แก้ไข Signature) ❗️
function BranchCard(props: any) { // ❗️ แก้ไข: จาก branchLists เป็น props
  const {
    id, // เช่น MXP-001
    name, // ชื่อสาขา
    sales,
    location, // ที่อยู่
    parcelCount = 0, // ยอดพัสดุ
    createdAt, // วันที่สร้าง
    updatedAt, // อัพเดตล่าสุด
    color = "red", // สี badge ยอดพัสดุ: purple|blue|pink|orange
  } = props || {}; // ❗️ แก้ไข: จาก branchLists เป็น props

  const fmt = (d: string | null | undefined): string => {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "-";
    return `${dt.toLocaleDateString()} @ ${dt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // Safe string handling for JSX attributes
  const branchName = name === "" ? "ไม่ระบุชื่อสาขา" : name;
  // make id in format MXP-0001
  function formatId(id: string) {
    const prefix = "MXP";
    const number = String(id ?? "").padStart(4, "0");
    return `${prefix} - ${number}`;
  }
  const formattedId = formatId(id);
  const zipCode = location?.zipCode == "" ? "ไม่ระบุ" : location?.zipCode;
  const address = location?.address === "" ? "ไม่ระบุ" : location?.address;
  const colorOptions = ["purple", "blue", "pink", "orange"];
  const saleName = sales?.name ?? "ไม่ระบุ";
  const saleAvatar =
    sales?.avatar ?? "https://media.tenor.com/alMR15Jl44IAAAAM/chinese.gif";
  const pacelColor = colorOptions.includes(color) ? color : "purple";

  return (
    <article className="branch-card" role="listitem" aria-label={name}>
      {/* กลุ่มป้ายด้านบน */}
      <div
        className="branch-card__badges"
        role="group"
        aria-label="ตัวบ่งชี้สาขา"
      >
        <span className="badge badge--chip">{formattedId}</span>

        <span className={`chip chip--parcel chip--${pacelColor}`}>
          <span className="chip__dot" aria-hidden="true" />
          <span className="chip__text">
            ยอดพัสดุ: {parcelCount?.toLocaleString?.() ?? 0}
          </span>
        </span>

        <span className="badge badge--soft">รหัสไปรษณีย์: {zipCode}</span>
      </div>

      <h3 className="branch-card__title">{branchName ?? name}</h3>
      <p className="branch-card__address">{address}</p>

      <div className="branch-card__meta">
        <div className="branch-card__owner">
          <Avatar src={saleAvatar} size="sm"></Avatar>
          <span>{saleName}</span>
        </div>
        <div className="branch-card__dates">
          <span>สร้างเมื่อ: {fmt(createdAt)} </span>
          <span>อัพเดตล่าสุด: {fmt(updatedAt)}</span>
        </div>
      </div>
    </article>
  );
}