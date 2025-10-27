import { Navbar, NavbarContent, NavbarItem, Button } from "@heroui/react";
import { LuAlignLeft, LuPlus } from "react-icons/lu";
import { useState } from "react";
import Sidebar from "./sidebar";
import { useNavigate, useLocation } from "react-router-dom";

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
              variant="flat"
              size="lg"
              name="menu"
              onClick={toggleSidebar}
            >
              <LuAlignLeft color="#c6005c" />
            </Button>
          </NavbarItem>
        </NavbarContent>

        {/* search input */}
        <NavbarContent justify="center" className="w-full">
          <NavbarItem className="w-full">
            <div className="w-full flex justify-center items-center mt-5 pb-3 h-12 mb-2  ">
              <AcmeLogo />
            </div>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end" className="gap-2">
          <NavbarItem>
            <Button
              isIconOnly
              color="default"
              variant="flat"
              size="lg"
              onPress={() => nav("/poi/create")}
            >
              <LuPlus color="#c6005c" />
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Sidebar */}
      <Sidebar
        open={isSidebarOpen}
        onClose={closeSidebar}
        notifyCount={3} // Optional: customize notification count
        avatarUrl="https://i.pravatar.cc/100" // Optional: customize avatar
      />
    </>
  );
}
