import { useRef, useState, useEffect, useMemo } from "react";
import { Button } from "@heroui/button";
import { LuEllipsis, LuMenu } from "react-icons/lu";
import { Badge } from "@heroui/badge";
import Sidebar from "@/components/layout/sidebar";
import { Avatar } from "@heroui/react";

// Types
interface Location {
  id: string;
  code: string;
  name: string;
  point: number;
  category: string;
  categoryColor: "purple" | "blue" | "pink" | "orange";
  description: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

type SortBy = "code" | "name" | "point" | "created" | "updated";
type SortDirection = "asc" | "desc";

// mock up รอดึงข้อมูล
const mockLocations: Location[] = [
  {
    id: "1",
    code: "20130",
    name: "Ollivanders: Makers of Fine Wands Since 382 B.C.",
    point: 10,
    category: "ร้านค้า",
    categoryColor: "purple",
    description: "169 ถนนสมคงตามาเฮง, เมืองนอธฮังกัม, จังหวัดนิสคูปูส",
    author: "นายตะกั่ว มัวสัง",
    createdAt: "2024-08-05T18:20:00",
    updatedAt: "2024-08-24T15:26:00",
  },
  {
    id: "2",
    code: "20130",
    name: "Hogwarts",
    point: 20,
    category: "โรงเรียน",
    categoryColor: "blue",
    description: "169 ถนนสมคงตามาเฮง, เมืองนอธฮังกัม, จังหวัดนิสคูปูส",
    author: "นายตะกั่ว มัวสัง",
    createdAt: "2024-08-05T18:20:00",
    updatedAt: "2024-08-24T15:26:00",
  },
  {
    id: "3",
    code: "20130",
    name: "Diagon Alley",
    point: 10,
    category: "ไปรษณีย์",
    categoryColor: "purple",
    description: "169 ถนนสมคงตามาเฮง, เมืองนอธฮังกัม, จังหวัดนิสคูปูส",
    author: "นายตะกั่ว มัวสัง",
    createdAt: "2024-08-05T18:20:00",
    updatedAt: "2024-08-24T15:26:00",
  },
  {
    id: "4",
    code: "20130",
    name: "Platform 9¾",
    point: 25,
    category: "โรงแรม",
    categoryColor: "blue",
    description: "169 ถนนสมคงตามาเฮง, เมืองนอธฮังกัม, จังหวัดนิสคูปูส",
    author: "นายตะกั่ว มัวสัง",
    createdAt: "2024-08-05T18:20:00",
    updatedAt: "2024-08-24T15:26:00",
  },
  {
    id: "5",
    code: "20130",
    name: "Azkaban",
    point: 15,
    category: "โรงแรม",
    categoryColor: "orange",
    description: "169 ถนนสมคงตามาเฮง, เมืองนอธฮังกัม, จังหวัดนิสคูปูส",
    author: "นายตะกั่ว มัวสัง",
    createdAt: "2024-08-05T18:20:00",
    updatedAt: "2024-08-24T15:26:00",
  },
];

function fmtTH(d?: string | null): string {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return `${dt.toLocaleDateString("th-TH")} @ ${dt.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

const colorMap: Record<
  Location["categoryColor"],
  { chip: string; dot: string; badge: string }
> = {
  purple: {
    chip: "bg-purple-100 text-purple-700",
    dot: "bg-purple-600",
    badge: "bg-indigo-600 text-white",
  },
  blue: {
    chip: "bg-blue-100 text-blue-700",
    dot: "bg-blue-600",
    badge: "bg-sky-600 text-white",
  },
  pink: {
    chip: "bg-pink-100 text-pink-700",
    dot: "bg-pink-600",
    badge: "bg-pink-600 text-white",
  },
  orange: {
    chip: "bg-orange-100 text-orange-700",
    dot: "bg-orange-600",
    badge: "bg-orange-500 text-white",
  },
};

export default function LocationsPage({
  notifyCount = 1,
  onOpenRequests = () => {},
  requestCount = 3,
}: {
  notifyCount?: number;
  onOpenRequests?: () => void;
  requestCount?: number;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const popRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const [locations] = useState<Location[]>(mockLocations);
  const [loading] = useState(false);

  // Search/Sort state
  const [q, setQ] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("code");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  // ปิด popover
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

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = locations.filter((l) => {
      if (!needle) return true;
      return (
        l.name.toLowerCase().includes(needle) ||
        l.code.toLowerCase().includes(needle) ||
        l.description.toLowerCase().includes(needle) ||
        l.category.toLowerCase().includes(needle) ||
        l.author.toLowerCase().includes(needle)
      );
    });

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "point":
          return (a.point - b.point) * dir;
        case "created":
          return (
            (new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()) *
            dir
          );
        case "updated":
          return (
            (new Date(a.updatedAt).getTime() -
              new Date(b.updatedAt).getTime()) *
            dir
          );
        case "code":
        default:
          return a.code.localeCompare(b.code) * dir;
      }
    });

    return list;
  }, [locations, q, sortBy, sortDir]);

  return (
    <section className="min-h-screen bg-white text-slate-900 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      {/* Pagebar */}
      <div className="grid grid-cols-[56px_1fr_56px] items-center gap-3">
        <Button
          size="lg"
          isIconOnly
          aria-label="menu"
          color="secondary"
          onClick={() => setSidebarOpen(true)}
          ref={btnRef}
          className="rounded-2xl shadow-sm bg-white text-slate-800"
        >
          <LuMenu />
        </Button>

        <h1 className="text-center text-3xl font-bold tracking-tight">
          จัดการสถานที่
        </h1>

        <div className="relative justify-self-end">
          <Badge color="primary" content={notifyCount} size="md">
            <Button
              size="lg"
              isIconOnly
              aria-label="more"
              color="secondary"
              onClick={() => setOpen((v) => !v)}
              className="rounded-2xl shadow-sm bg-white text-slate-800"
            >
              <LuEllipsis />
            </Button>
          </Badge>

          {open && (
            <div
              ref={popRef}
              role="menu"
              className="absolute right-0 mt-3 w-[min(46vw,260px)] rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5"
            >
              <button
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-base hover:bg-slate-50"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  window.location.href = "/poi/create";
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M12 4v16m8-8H4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>สร้างสถานที่</span>
              </button>

              <button
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-base hover:bg-slate-50"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onOpenRequests();
                }}
              >
                <svg
                  width="20"
                  height="20"
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
                <span className="mr-1">คำขอสร้าง</span>
                {requestCount > 0 && (
                  <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-slate-800 px-1.5 text-xs font-semibold text-white">
                    {requestCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search row */}
      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className="text-slate-500"
          >
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQ(e.target.value)
            }
            placeholder="ค้นหา"
            aria-label="ค้นหาสถานที่"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200"
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

      {/* Section head (sort) */}
      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">รายการสถานที่:</h2>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSortBy(e.target.value as SortBy)
            }
            aria-label="เรียงตาม"
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
          >
            <option value="name">ชื่อสถานที่</option>
            <option value="created">วันที่สร้าง</option>
            <option value="updated">อัพเดตล่าสุด</option>
          </select>

          <button
            className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 hover:bg-slate-200"
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

      {/* List */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-slate-500">กำลังโหลดข้อมูล…</p>}
        {!loading && filtered.length === 0 && (
          <p className="col-span-full text-slate-500">
            ไม่พบสถานที่ตามเงื่อนไข
          </p>
        )}
        {!loading &&
          filtered.map((l) => (
            <LocationCard key={l.id ?? l.code} location={l} />
          ))}
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/25 p-4">
          <div className="w-full max-w-xl rounded-t-2xl bg-white p-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">ตัวกรอง</h3>
              <button
                className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 hover:bg-slate-200"
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

            <div className="mt-3 grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  คำค้นหา
                </label>
                <input
                  value={q}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setQ(e.target.value)
                  }
                  placeholder="ชื่อ/โค้ด/คำอธิบาย/หมวดหมู่"
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/**แก้ไข dropdown */}
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  เรียงตาม
                </label>
                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSortBy(e.target.value as SortBy)
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="code">รหัสไปรษณีย์</option>
                  <option value="name">ชื่อสถานที่</option>
                  <option value="point">คะแนน</option>
                  <option value="created">วันที่สร้าง</option>
                  <option value="updated">อัพเดตล่าสุด</option>
                </select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  ทิศทางการเรียง
                </label>
                <div className="inline-flex gap-2">
                  <button
                    className={`h-9 rounded-lg px-3 text-sm ${sortDir === "asc" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"}`}
                    onClick={() => setSortDir("asc")}
                  >
                    น้อย → มาก
                  </button>
                  <button
                    className={`h-9 rounded-lg px-3 text-sm ${sortDir === "desc" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"}`}
                    onClick={() => setSortDir("desc")}
                  >
                    มาก → น้อย
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                className="h-9 rounded-lg bg-slate-100 px-4 text-sm text-slate-800 hover:bg-slate-200"
                onClick={() => setFilterOpen(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notifyCount={notifyCount}
      />
    </section>
  );
}

// Card
function LocationCard({ location }: { location: Location }) {
  const {
    code,
    name,
    point,
    category,
    categoryColor,
    description,
    author,
    authorAvatar,
    createdAt,
    updatedAt,
  } = location;

  const colors = colorMap[categoryColor] ?? colorMap.purple;
  const avatar =
    authorAvatar ?? "https://media.tenor.com/alMR15Jl44IAAAAM/chinese.gif"; //เปลี่ยนรูป avatar

  return (
    <article
      role="listitem"
      aria-label={name}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      {/* badges */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {/* คะแนน (point) มาก่อน */}
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${colors.badge}`}
        >
          +{point}
        </span>

        {/* หมวดหมู่ */}
        <span
          className={`inline-flex items-center gap-2 rounded-xl px-2.5 py-1 text-xs font-bold ${colors.chip}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${colors.dot}`}
            aria-hidden="true"
          />
          {category}
        </span>

        {/* รหัสไปรษณีย์ */}
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          รหัสไปรษณีย์: {code || "ไม่ระบุ"}
        </span>
      </div>

      <h3 className="mb-1 line-clamp-2 text-lg font-extrabold text-slate-900">
        {name || "ไม่ระบุชื่อสถานที่"}
      </h3>
      <p className="mb-3 text-sm leading-6 text-slate-600">
        {description || "ไม่ระบุ"}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Avatar src={avatar} size="sm" />
          <span className="font-medium">{author || "ไม่ระบุ"}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <span>สร้างเมื่อ: {fmtTH(createdAt)}</span>
          <span>อัพเดตล่าสุด: {fmtTH(updatedAt)}</span>
        </div>
      </div>
    </article>
  );
}
