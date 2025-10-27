import { useEffect, useState } from "react";
import { LuX, LuMap, LuMapPinned, LuCircle } from "react-icons/lu";
import { Button } from "@heroui/react";
import { Avatar } from "@heroui/avatar";
import { useLocation } from "react-router-dom";

import { useUser } from "@/hooks/useUser";

// TypeScript interfaces
interface MenuItem {
  to: string;
  label: string;
  icon?: React.ComponentType;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  items?: MenuItem[];
  notifyCount?: number;
  avatarUrl?: string;
}

/**
 * เมนูเต็มจอแบบ Overlay
 * - เปิด/ปิดด้วย prop open, onClose
 * - ปรับรายการได้ผ่าน props.items (optional)
 */
export default function Sidebar({ open, onClose, items }: SidebarProps) {
  const location = useLocation();
  const [loc, setLoc] = useState(location.pathname);
  const defaultItems: MenuItem[] = [
    { to: "/map", label: "แผนที่", icon: LuMap },
    { to: "/poi", label: "จัดการสถานที่", icon: LuMapPinned },
  ];
  const menu = items && items.length ? items : defaultItems;

  const { user } = useUser();

  // ล็อก body เวลาเปิดเมนู
  useEffect(() => {
    setLoc(location.pathname);
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Full Screen Sidebar */}
      <aside
        aria-modal="true"
        className="fixed inset-0 w-full h-full bg-white shadow-lg z-50 flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center m justify-between p-4">
          <div className="flex space-x-4 items-center">
            <Button
              isIconOnly
              aria-label="Open Menu"
              color="default"
              name="menu"
              size="lg"
              variant="flat"
              onPress={onClose}
            >
              <LuX color="#c6005c" />
            </Button>
            <img alt="logo" className="h-10" src="Logo.svg" />
          </div>

          <div className="flex items-center space-x-2">
            <Avatar
              className="w-11 h-11"
              radius="md"
              src={user?.avatar || ""}
            />
          </div>
        </div>

        {/* Menu Item */}
        <nav className="flex-1 p-2 pt-12">
          <div className="space-y-1">
            {menu.map((m) => {
              const Icon = m.icon || LuCircle;

              return (
                <a
                  key={m.to}
                  className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-100 transition-colors group w-full text-left"
                  href={m.to}
                  onClick={onClose}
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 ${loc === m.to ? "text-[#c6005c]" : "text-gray-700"} group-hover:text-gray-900`}
                  >
                    <Icon size={24} />
                  </span>
                  <span
                    className={`text-2xl ${loc === m.to ? "text-[#c6005c]" : "text-gray-700"} group-hover:text-gray-900`}
                  >
                    {m.label}
                  </span>
                </a>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
