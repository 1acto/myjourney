import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Search, Filter, Menu, MoreVertical } from 'lucide-react';

// Types
interface Location {
  id: string;
  code: string;
  name: string;
  reviews: number;
  category: string;
  categoryColor: 'purple' | 'blue' | 'pink' | 'orange';
  description: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

type SortBy = 'code' | 'name' | 'reviews' | 'created' | 'updated';
type SortDirection = 'asc' | 'desc';

// Mock data
const mockLocations: Location[] = [
  {
    id: '1',
    code: '20130',
    name: "Ollivanders: Makers of Fine Wands Since 382 B.C.",
    reviews: 10,
    category: "ร้านค้า",
    categoryColor: "purple",
    description: "169 ถนนสมคงตามาเฮง, เมืองนอธฮังกัม, จังหวัดนิสคูปูส",
    author: "นายตะกั่ว มัวสัง",
    createdAt: "2024-08-05T18:20:00",
    updatedAt: "2024-08-24T15:26:00"
  },
  {
    id: '2',
    code: '20130',
    name: "Hogwarts",
    reviews: 20,
    category: "โรงเรียน",
    categoryColor: "blue",
    description: "169 ถนนสมคงตามาเฮง, เมืองนอธฮังกัม, จังหวัดนิสคูปูส",
    author: "นายตะกั่ว มัวสัง",
    createdAt: "2024-08-05T18:20:00",
    updatedAt: "2024-08-24T15:26:00"
  },
  {
    id: '3',
    code: '20130',
    name: "Diagon Alley",
    reviews: 10,
    category: "โปรยคณิต",
    categoryColor: "purple",
    description: "169 ถนนสมคงตามาเฮง, เมืองนอธฮังกัม, จังหวัดนิสคูปูส",
    author: "นายตะกั่ว มัวสัง",
    createdAt: "2024-08-05T18:20:00",
    updatedAt: "2024-08-24T15:26:00"
  },
  {
    id: '4',
    code: '20130',
    name: "Platform 9¾",
    reviews: 25,
    category: "โรงแรม",
    categoryColor: "blue",
    description: "169 ถนนสมคงตามาเฮง, เมืองนอธฮังกัม, จังหวัดนิสคูปูส",
    author: "นายตะกั่ว มัวสัง",
    createdAt: "2024-08-05T18:20:00",
    updatedAt: "2024-08-24T15:26:00"
  },
  {
    id: '5',
    code: '20130',
    name: "Azkaban",
    reviews: 15,
    category: "โรงแรม",
    categoryColor: "orange",
    description: "169 ถนนสมคงตามาเฮง, เมืองนอธฮังกัม, จังหวัดนิสคูปูส",
    author: "นายตะกั่ว มัวสัง",
    createdAt: "2024-08-05T18:20:00",
    updatedAt: "2024-08-24T15:26:00"
  }
];

// Location Card Component
interface LocationCardProps {
  location: Location;
}

function LocationCard({ location }: LocationCardProps) {
  const {
    code,
    name,
    reviews,
    category,
    categoryColor,
    description,
    author,
    createdAt,
    updatedAt
  } = location;

  const fmt = (d: string): string => {
    try {
      const dt = new Date(d);
      return `${dt.toLocaleDateString('th-TH')} @ ${dt.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } catch {
      return '-';
    }
  };

  const categoryColors = {
    purple: 'bg-purple-600',
    blue: 'bg-indigo-600',
    pink: 'bg-pink-600',
    orange: 'bg-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Header with badges */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
            +{reviews}
          </span>
          <span className={`px-3 py-1 ${categoryColors[categoryColor]} text-white text-xs font-semibold rounded-full`}>
            {category}
          </span>
        </div>
        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
          รหัสโปรเจค: {code}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold mb-2">{name}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">{description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {author.charAt(0)}
          </div>
          <span className="font-medium text-gray-700">{author}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>สร้างเมื่อ: {fmt(createdAt)}</span>
          <span>อัพเดทล่าสุด: {fmt(updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
interface SidebarProps {
  open: boolean;
  onClose: () => void;
  notifyCount?: number;
}

function Sidebar({ open, onClose, notifyCount = 0 }: SidebarProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) {
      document.addEventListener('keydown', onKey);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">เมนู</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4">
          <a href="#" className="block px-4 py-3 rounded-lg hover:bg-gray-100 mb-2 transition-colors">
            หน้าหลัก
          </a>
          <a href="#" className="block px-4 py-3 rounded-lg hover:bg-gray-100 mb-2 transition-colors">
            จัดการสถานที่
          </a>
          <a href="#" className="block px-4 py-3 rounded-lg hover:bg-gray-100 mb-2 transition-colors">
            รายงาน
          </a>
          <a href="#" className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            ตั้งค่า
          </a>
        </nav>
      </aside>
    </>
  );
}

// Main Component
export default function LocationsPage() {
  const [locations] = useState<Location[]>(mockLocations);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('code');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  
  const popRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const notifyCount = 3;
  const requestCount = 2;

  // Close popup on outside click
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
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Filter and sort
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = locations.filter((loc) => {
      if (!needle) return true;
      return (
        (loc.name ?? '').toLowerCase().includes(needle) ||
        (loc.code ?? '').toLowerCase().includes(needle) ||
        (loc.description ?? '').toLowerCase().includes(needle) ||
        (loc.category ?? '').toLowerCase().includes(needle)
      );
    });

    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'name':
          return (a.name ?? '').localeCompare(b.name ?? '', 'th') * dir;
        case 'reviews':
          return ((a.reviews ?? 0) - (b.reviews ?? 0)) * dir;
        case 'created':
          const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return (aCreated - bCreated) * dir;
        case 'updated':
          const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return (aUpdated - bUpdated) * dir;
        case 'code':
        default:
          return (a.code ?? '').localeCompare(b.code ?? '') * dir;
      }
    });

    return list;
  }, [locations, q, sortBy, sortDir]);

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortBy);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };

  const handleFilterSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };

  const handleFilterSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortBy);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Bar (iOS style) */}
      <div className="fixed top-0 left-0 right-0 h-11 bg-white flex items-center justify-between px-4 text-sm z-50 border-b">
        <span className="font-semibold">9:41</span>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b sticky top-11 z-10 pt-11">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h1 className="text-xl font-bold">จัดการสถานที่</h1>
            
            <div className="relative">
              <button
                ref={btnRef}
                onClick={() => setOpen(!open)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <MoreVertical className="w-6 h-6" />
                {notifyCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {notifyCount}
                  </span>
                )}
              </button>

              {open && (
                <div
                  ref={popRef}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  <button
                    onClick={() => {
                      setOpen(false);
                      window.location.href = '/locations/create';
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>สร้างสถานที่</span>
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      alert('คำขอสร้าง');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <span>คำขอสร้าง</span>
                    {requestCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        {requestCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filter Row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหา"
                value={q}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              className="p-2 bg-gray-100 rounded-lg relative hover:bg-gray-200 transition-colors"
              onClick={() => setFilterOpen(true)}
            >
              <Filter className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">รายการสถานที่:</span>
          <select
            value={sortBy}
            onChange={handleSortByChange}
            className="px-3 py-1 bg-gray-100 rounded-lg text-sm focus:outline-none"
          >
            <option value="code">รหัส</option>
            <option value="name">ชื่อสถานที่</option>
            <option value="reviews">ยอดรีวิว</option>
            <option value="created">วันที่สร้าง</option>
            <option value="updated">อัพเดตล่าสุด</option>
          </select>
        </div>
        <button 
          className="flex items-center gap-1"
          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          title={sortDir === 'asc' ? 'เรียงน้อย→มาก' : 'เรียงมาก→น้อย'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* Location Cards */}
      <div className="p-4 space-y-4">
        {loading && <p className="text-center text-gray-500 py-8">กำลังโหลดข้อมูล…</p>}
        {!loading && error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
            <p className="text-gray-500">กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ</p>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && locations.length === 0 && (
          <p className="text-center text-gray-500 py-8">ไม่มีข้อมูลสถานที่</p>
        )}
        {!loading && !error && filtered.length === 0 && locations.length > 0 && (
          <p className="text-center text-gray-500 py-8">ไม่พบสถานที่ตามเงื่อนไขที่ค้นหา</p>
        )}
        {!loading && !error && filtered.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>

      {/* Filter Modal */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setFilterOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">ตัวกรอง</h3>
              <button
                onClick={() => setFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คำค้นหา</label>
                <input
                  value={q}
                  onChange={handleFilterSearchChange}
                  placeholder="ชื่อ/โค้ด/คำอธิบาย/หมวดหมู่"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เรียงตาม</label>
                <select 
                  value={sortBy} 
                  onChange={handleFilterSortByChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="code">รหัส</option>
                  <option value="name">ชื่อสถานที่</option>
                  <option value="reviews">ยอดรีวิว</option>
                  <option value="created">วันที่สร้าง</option>
                  <option value="updated">อัพเดตล่าสุด</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ทิศทางการเรียง</label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      sortDir === 'asc' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSortDir('asc')}
                  >
                    น้อย → มาก
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      sortDir === 'desc' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSortDir('desc')}
                  >
                    มาก → น้อย
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t">
              <button
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
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
    </div>
  );
}