import { Navbar, NavbarContent, NavbarItem, Button } from "@heroui/react";
import { LuAlignLeft, LuPlus } from "react-icons/lu";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Sidebar from "./sidebar";

export const AcmeLogo = () => {
  const location = useLocation();

  if (location.pathname === "/poi") {
    return (
      <span className="text-[1.5rem] font-bold text-black">My Memories</span>
    );
  }

  return <img alt="logo" src="Logo.svg" />;
};

export default function App() {
  const nav = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <Navbar
        classNames={{
          item: ["flex", "relative", "h-full", "items-center", "pt-5 mb-5"],
        }}
        position="sticky"
      >
        <NavbarContent justify="start">
          <NavbarItem>
            <Button
              isIconOnly
              aria-label="Open Menu"
              color="default"
              name="menu"
              size="lg"
              variant="flat"
              onClick={toggleSidebar}
            >
              <LuAlignLeft color="#c6005c" />
            </Button>
          </NavbarItem>
        </NavbarContent>

        {/* search input */}
        <NavbarContent className="w-full" justify="center">
          <NavbarItem className="w-full">
            <div className="w-full flex justify-center items-center mt-5 pb-3 h-12 mb-2  ">
              <AcmeLogo />
            </div>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent className="gap-2" justify="end">
          <NavbarItem>
            <Button
              isIconOnly
              color="default"
              size="lg"
              variant="flat"
              onPress={() => nav("/poi/create")}
            >
              <LuPlus color="#c6005c" />
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Sidebar */}
      <Sidebar
        avatarUrl="https://i.pravatar.cc/100" // Optional: customize avatar
        notifyCount={3} // Optional: customize notification count
        open={isSidebarOpen}
        onClose={closeSidebar}
      />
    </>
  );
}
