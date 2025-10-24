/*
 * PoiPage
 * Display lits POI
 * @input: -
 * @output: ข้อมูลสถานที่
 * @author: Rungnapha 66160371
 * @Create Date: 2025-10-24
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@heroui/button";
import { LuEllipsis, LuMenu } from "react-icons/lu";
import { Badge } from "@heroui/badge";
import Sidebar from "@/components/layout/sidebar";
import { Avatar } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getPoisQueryOption from "@/queryOption/pois/getPoisQueryOption";
import getUserQueryOption from "@/queryOption/pois/getUserQueryOption";

const CLOSE_POPUPS_EVENT = "app:close-popups";
const BASE_URL = import.meta.env.VITE_API_URL as string; 

type SortBy = "code" | "name" | "point" | "created" | "updated";
type SortDirection = "asc" | "desc";

interface Location {
  id: string;
  code: string;
  name: string;
  point: number;
  category: string;
  categoryColor: "Dark blue" | "black";
  description: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  locationId?: string;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

function fmtTH(d?: string | null): string {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return `${dt.toLocaleDateString("th-TH")} @ ${dt.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

const colorMap: Record<Location["categoryColor"], { chip: string }> = {
  "Dark blue": { chip: "bg-[#4D55A0] text-white" },
  black: { chip: "bg-black text-white" },
};

const POINT_BADGE = "bg-[#22C55E] text-white";
const POINT_BADGE_NEGATIVE = "bg-[#F31260] text-white";

/*Safe Avatar*/
function normalizeAvatarUrl(raw?: string, name?: string) {
  const n = (raw ?? "").trim();
  if (!n) {
    const label = encodeURIComponent((name || "Unknown").slice(0, 30));
    return `https://ui-avatars.com/api/?name=${label}&background=E2E8F0&color=475569`;
  }
  if (/^(https?:)?\/\//i.test(n) || n.startsWith("data:") || n.startsWith("blob:")) return n;
  if (n.startsWith("/")) return `${BASE_URL}${n}`;
  return `${BASE_URL}/${n}`;
}

function SafeAvatar({
  src,
  name,
  className,
  size = "sm",
}: {
  src?: string;
  name?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [error, setError] = useState(false);
  const initials =
    (name ?? "")
      .trim()
      .split(/\s+/)
      .map((p) => p?.[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";

  const normalized = error ? undefined : normalizeAvatarUrl(src, name);

  return (
    <Avatar
      src={normalized}
      size={size}
      className={className}
      showFallback
      fallback={<span className="text-xs font-semibold">{initials}</span>}
      imgProps={{
        referrerPolicy: "no-referrer",
        crossOrigin: "anonymous",
        onError: () => setError(true),
      } as any}
    />
  );
}

/*Sort Dropdown*/
function SortDropdown({
  value,
  onChange,
  buttonClassName = "h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm",
}: {
  value: "name" | "created" | "updated";
  onChange: (v: "name" | "created" | "updated") => void;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScrollOrResize = () => open && updatePos();


    const onCloseSignal = () => setOpen(false);

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener(CLOSE_POPUPS_EVENT, onCloseSignal);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener(CLOSE_POPUPS_EVENT, onCloseSignal);
    };
  }, [open]);

  const label = value === "name" ? "ชื่อสถานที่" : value === "created" ? "วันที่สร้าง" : "วันที่อัพเดตล่าสุด";

  const updatePos = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const POP_W = 200;
    const top = r.bottom + 8;
    const left = r.right - POP_W;
    setPos({ top, left });
  };

  const openPopover = () => {
    window.dispatchEvent(new Event(CLOSE_POPUPS_EVENT)); 
    updatePos();
    setOpen(true);
  };

  const popover =
    open &&
    createPortal(
      <div
        ref={popRef}
        role="listbox"
        className="z-[9999] w-[200px] rounded-2xl bg-white p-1 shadow-2xl ring-1 ring-black/5"
        style={{ position: "fixed", top: pos.top, left: pos.left }}
      >
        {[
          { v: "name", t: "ชื่อสถานที่" },
          { v: "created", t: "วันที่สร้าง" },
          { v: "updated", t: "วันที่อัพเดตล่าสุด" },
        ].map((opt) => (
          <button
            key={opt.v}
            role="option"
            aria-selected={value === (opt.v as any)}
            className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 ${
              value === opt.v ? "font-semibold text-slate-900" : "text-slate-700"
            }`}
            onClick={() => {
              onChange(opt.v as any);
              setOpen(false);
            }}
          >
            {opt.t}
          </button>
        ))}
      </div>,
      document.body
    );

  return (
    <div className="inline-block">
      <button
        ref={btnRef}
        className={`${buttonClassName} inline-flex items-center gap-2`}
        onClick={open ? () => setOpen(false) : openPopover}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" className="text-slate-500">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {popover}
    </div>
  );
}

/* หน้าหลัก */
export default function PoiPage({
  notifyCount = 1,
  onOpenRequests = () => {},
  requestCount = 3,
}: {
  notifyCount?: number;
  onOpenRequests?: () => void;
  requestCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const queryClient = useQueryClient();

  const { data, isPending } = useQuery(getPoisQueryOption());
  const { data: userData, isPending: userPending } = useQuery(getUserQueryOption());

  const currentUser: User | null = useMemo(() => {
    if (!userData) return null;
    try {
      const user = (userData as any).user ?? (userData as any).data ?? userData;
      return {
        id: String(user.id ?? ""),
        name:
          user.name ??
          user.displayName ??
          user.username ??
          [user.firstName, user.lastName].filter(Boolean).join(" ") ??
          "ผู้ใช้",
        avatar:
          user.avatar ??
          user.avatarUrl ??
          user.profileImage ??
          user.image ??
          user.photo ??
          undefined,
        email: user.email ?? undefined,
      };
    } catch {
      return null;
    }
  }, [userData]);

  //  backend
  const serverLocations: Location[] | null = useMemo(() => {
    if (!data) return null;
    try {
      const arr = Array.isArray(data) ? data : (data as any).items ?? (data as any).data ?? [];
      return arr.map((it: any, idx: number) => {
        const tag = it.tag ?? it.typePoi ?? null;
        const creator = it.createdBy ?? it.creator ?? it.owner ?? null;
        const loc = it.location ?? null;

        const rawZip = loc?.zipCode ?? loc?.zipcode ?? loc?.postalCode ?? it.zipCode ?? it.zip ?? "";
        const code = String(rawZip ?? "").trim();

        const rawColor =
          tag?.color ?? it.categoryColor ?? it.color ?? (tag?.name === "คู่แข่ง" ? "black" : "Dark blue");
        const safeColor: Location["categoryColor"] = rawColor === "black" ? "black" : "Dark blue";

        const addrFull = loc
          ? [loc.address, loc.subDistrict, loc.district, loc.province].filter(Boolean).join(" ")
          : String(it.address ?? it.description ?? "");

        const createdByIdRaw =
          it.createById ??
          it.createdById ??
          (creator?.id ?? creator?._id ?? creator?.userId);

        const createdById = createdByIdRaw != null ? String(createdByIdRaw) : undefined;

        const locationId = it.locationId ?? it.location?.id ?? it.location?._id ?? undefined;

        const inlineCreatorName =
          creator?.name ??
          creator?.displayName ??
          [creator?.firstName, creator?.lastName].filter(Boolean).join(" ") ??
          it.author ??
          "";

        const inlineCreatorAvatar =
          creator?.avatar ?? creator?.avatarUrl ?? creator?.picture ?? it.authorAvatar ?? it.avatar ?? undefined;

        return {
          id: String(it.id ?? idx),
          code,
          name: String(it.name ?? "ไม่ระบุชื่อสถานที่"),
          point: Number(it.point ?? 0),
          category: String(tag?.name ?? it.category ?? ""),
          categoryColor: safeColor,
          description: addrFull || "ไม่ระบุ",
          author: (inlineCreatorName ?? "").trim(),
          authorAvatar: inlineCreatorAvatar ?? undefined,
          createdAt: String(it.createdAt ?? new Date().toISOString()),
          updatedAt: String(it.updatedAt ?? new Date().toISOString()),
          createdById,
          locationId: locationId ? String(locationId) : undefined,
        } as Location;
      });
    } catch (e) {
      console.error("map error", e);
      return null;
    }
  }, [data]);

  const locations: Location[] = serverLocations ?? [];
  const loading = (isPending || userPending) && locations.length === 0;


  useEffect(() => {
    if (!locations?.length) return;

    const ids = Array.from(
      new Set(
        locations
          .map((l) => l.createdById)
          .filter((v): v is string => !!v)
      )
    );
    if (!ids.length) return;

    (async () => {
      try {
        const q = encodeURIComponent(ids.join(","));
        const r = await fetch(`/users/batch?ids=${q}`, { credentials: "include" });
        if (r.ok) {
          const json = await r.json();
          const arr: any[] = Array.isArray(json) ? json : json?.data ?? [];
          arr.forEach((u: any) => {
            const id = String(u.id ?? u.userId ?? u._id ?? "");
            if (!id) return;
            const packed = u.user ?? u;
            queryClient.setQueryData(["userById", id], { user: packed });
          });
          return;
        }
      } catch {}

      ids.forEach((id) => {
        queryClient.prefetchQuery({
          queryKey: ["userById", String(id)],
          queryFn: async () => {
            const tryFetch = async (url: string) => {
              const r = await fetch(url, { credentials: "include" });
              return r.ok ? r.json() : null;
            };
            return (await tryFetch(`/users/${id}`)) ?? (await tryFetch(`/api/users/${id}`));
          },
          staleTime: 1000 * 60 * 10,
          gcTime: 1000 * 60 * 30,
        });
      });
    })();
  }, [locations, queryClient]);

  // Search / Sort / Filter
  const [q, setQ] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("created");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  // ปิดเมนู
  useEffect(() => {
    const handler = () => setOpen(false);
    window.addEventListener(CLOSE_POPUPS_EVENT, handler);
    return () => window.removeEventListener(CLOSE_POPUPS_EVENT, handler);
  }, []);

  // ปิด popover
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (
        popRef.current &&
        !popRef.current.contains(t) &&
        moreBtnRef.current &&
        !moreBtnRef.current.contains(t) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(t)
      )
        setOpen(false);
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
    return locations
      .filter((l) => {
        if (!needle) return true;
        return (
          l.name.toLowerCase().includes(needle) ||
          l.code.toLowerCase().includes(needle) ||
          l.description.toLowerCase().includes(needle) ||
          l.category.toLowerCase().includes(needle) ||
          l.author.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name) * dir;
          case "point":
            return (a.point - b.point) * dir;
          case "created":
            return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
          case "updated":
            return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
          case "code":
          default:
            return a.code.localeCompare(b.code) * dir;
        }
      });
  }, [locations, q, sortBy, sortDir]);

  return (
    <section className="min-h-screen bg-white text-slate-900 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="pagebar grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <Button size="lg" isIconOnly color="secondary" onClick={() => setSidebarOpen(true)} ref={menuBtnRef}>
          <LuMenu />
        </Button>

        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl font-bold">จัดการสถานที่</h1>
        </div>

        <div className="relative justify-self-end">
          <Badge color="primary" content={notifyCount}>
            <Button
              size="lg"
              isIconOnly
              color="secondary"
              onClick={() => {
                if (!open) window.dispatchEvent(new Event(CLOSE_POPUPS_EVENT)); 
                setOpen((v) => !v);
              }}
              ref={moreBtnRef}
            >
              <LuEllipsis />
            </Button>
          </Badge>

          {open && (
            <div
              ref={popRef}
              role="menu"
              className="absolute right-0 mt-3 w-[min(46vw,260px)] rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 z-50"
            >
              <button
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-base hover:bg-slate-50"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  window.location.href = "/poi/create";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4v16m8-8H4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
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

      {/* แถวค้นหา */}
      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
          <svg width="20" height="20" viewBox="0 0 24 24" className="text-slate-500">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
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
            <path d="M3 5h18M6 12h12M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Section head (sort) */}
      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">รายการสถานที่:</h2>

        <div className="flex items-center gap-2">
          <SortDropdown
            value={sortBy as any}
            onChange={(v) => setSortBy(v as SortBy)}
            buttonClassName="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          />

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

      {/* รายการการ์ด */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!loading &&
          filtered.map((l) => <LocationCard key={l.id} location={l} currentUser={currentUser} />)}
      </div>

      {/* Filter Sheet */}
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
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-slate-700">คำค้นหา</label>
                <input
                  value={q}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
                  placeholder="ชื่อ/โค้ด/คำอธิบาย/หมวดหมู่/ผู้สร้าง"
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-slate-700">เรียงตาม</label>
                <SortDropdown
                  value={sortBy as any}
                  onChange={(v) => setSortBy(v as SortBy)}
                  buttonClassName="h-10 w-full justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-slate-700">ทิศทางการเรียง</label>
                <div className="inline-flex gap-2">
                  <button
                    className={`h-9 rounded-lg px-3 text_sm ${
                      sortDir === "asc" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
                    }`}
                    onClick={() => setSortDir("asc")}
                  >
                    น้อย → มาก
                  </button>
                  <button
                    className={`h-9 rounded-lg px-3 text_sm ${
                      sortDir === "desc" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
                    }`}
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

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} notifyCount={notifyCount} />
    </section>
  );
}

/*Card */
function LocationCard({
  location,
  currentUser,
}: {
  location: Location;
  currentUser: User | null;
}) {
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
    createdById,
    locationId,
  } = location;

  const colors = colorMap[categoryColor] ?? colorMap["Dark blue"];
  const fallbackAvatar = authorAvatar ?? "";

  const { data: locData } = useQuery({
    queryKey: ["location", locationId],
    queryFn: async () => {
      if (!locationId) return null;
      const res = await fetch(`/locations/${locationId}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!locationId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });

  const needLookup = !!createdById;
  const { data: creatorData, isFetching: creatorFetching } = useQuery({
    queryKey: ["userById", String(createdById)],
    queryFn: async () => {
      if (!createdById) return null;
      const tryFetch = async (url: string) => {
        const r = await fetch(url, { credentials: "include" });
        return r.ok ? r.json() : null;
      };
      return (await tryFetch(`/users/${createdById}`)) ?? (await tryFetch(`/api/users/${createdById}`));
    },
    enabled: needLookup,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const creator = useMemo(() => {
    if (creatorData) {
      const u = (creatorData as any).user ?? (creatorData as any).data ?? creatorData;
      const name =
        u.name ??
        [u.firstName, u.lastName].filter(Boolean).join(" ") ??
        u.displayName ??
        u.username ??
        u.email ??
        "";
      const avatar =
        u.avatar ?? u.avatarUrl ?? u.profileImage ?? u.image ?? u.picture ?? fallbackAvatar;
      if (name?.trim()) return { name, avatar };
    }
    if (author?.trim()) {
      return { name: author, avatar: authorAvatar ?? fallbackAvatar };
    }
    if (createdById && currentUser && createdById === currentUser.id) {
      return { name: currentUser.name, avatar: currentUser.avatar ?? fallbackAvatar };
    }
    return { name: "ไม่ระบุ", avatar: fallbackAvatar };
  }, [creatorData, author, authorAvatar, currentUser, createdById]);

  const { displayCode, displayDesc } = useMemo(() => {
    const extra = (locData as any)?.data ?? locData ?? null;
    const addr = extra ? [extra.address, extra.subDistrict, extra.district, extra.province].filter(Boolean).join(" ") : "";
    const codeFromApi = extra?.zipCode ?? extra?.zipcode ?? extra?.postalCode ?? extra?.postcode ?? "";
    return {
      displayCode: (code?.trim() ? code : codeFromApi || "") as string,
      displayDesc: (description?.trim() ? description : addr || "ไม่ระบุ") as string,
    };
  }, [locData, code, description]);

  return (
    <article className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="absolute right-4 top-4">
        <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600">
          รหัสไปรษณีย์: {displayCode?.trim() ? displayCode : "ไม่ระบุ"}
        </span>
      </div>

     
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${
            point >= 0 ? POINT_BADGE : POINT_BADGE_NEGATIVE
          }`}
        >
          {point >= 0 ? `+${point}` : point}
        </span>
        {category?.trim() && (
          <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-bold ${colors.chip}`}>
            {category}
          </span>
        )}
      </div>

      <h3 className="mb-1 line-clamp-2 text-lg font-extrabold text-slate-900">{name || "ไม่ระบุชื่อสถานที่"}</h3>
      <p className="text-sm leading-6 text-slate-600">{displayDesc}</p>

      <div className="mt-3 flex items-center gap-2">
        <SafeAvatar src={creator.avatar} name={creator.name} className="w-8 h-8" size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">
            {creatorFetching ? <span className="inline-block animate-pulse bg-slate-200 rounded w-24 h-3" /> : creator.name}
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>สร้างเมื่อ: {fmtTH(createdAt)}</span>
            <span>อัพเดตล่าสุด: {fmtTH(updatedAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
