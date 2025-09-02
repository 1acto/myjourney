import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Input,
  Button,
} from "@heroui/react";
import { LuAlignLeft } from "react-icons/lu";
import { LuBookmark } from "react-icons/lu";
import { LuFilter } from "react-icons/lu";
import { LuSearch } from "react-icons/lu";

export const AcmeLogo = () => {
  return <img alt="logo" src="Logo.svg" />;
};

export default function App() {
  return (
    <>
      <div className="w-full flex justify-center mt-5 h-12 mb-2  ">
        <AcmeLogo />
      </div>
      <Navbar
        classNames={{
          item: ["flex", "relative", "h-full", "items-center"],
        }}
        position="sticky"
      >
        <NavbarContent justify="start">
          <NavbarItem>
            <Button
              isIconOnly
              aria-label="Like"
              color="default"
              variant="flat"
              size="lg"
            >
              <LuAlignLeft color="#4D55A0" />
            </Button>
          </NavbarItem>
        </NavbarContent>

        {/* search input */}
        <NavbarContent justify="center" className="w-full">
          <NavbarItem className="w-full">
            <Input
              classNames={{
                base: "w-full h-12",
                mainWrapper: "h-full",
                input: "text-small font-bold",
                inputWrapper:
                  "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20m rounded-xl",
              }}
              placeholder="ค้นหา"
              size="sm"
              startContent={<LuSearch color="#4D55A0" />}
              type="search"
            />
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end" className="gap-2">
          <NavbarItem>
            <Button isIconOnly color="default" variant="flat" size="lg">
              <LuBookmark color="#4D55A0" />
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button isIconOnly color="default" variant="flat" size="lg">
              <LuFilter color="#4D55A0" />
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </>
  );
}
