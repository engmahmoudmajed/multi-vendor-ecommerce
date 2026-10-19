"use client";

import { Poppins } from "next/font/google";
import Link from "next/link";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import NavbarSidebar from "./NavbarSidebar";
import { useState } from "react";
import { MenuIcon } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface NavbarItemProps {
  children: React.ReactNode;
  isActive?: boolean;
}

const NavbarItems = [
  { href: "/", children: "Home" },
  { href: "/about", children: "About" },
  { href: "/features", children: "Features" },
  { href: "/pricing", children: "Pricing" },
  { href: "/contact", children: "Contact" },
];

const NavbarItem = ({ children, isActive }: NavbarItemProps) => {
  return (
    <Button
      variant="outline"
      className={cn(
        "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg",
        isActive && "bg-black text-white hover:bg-black hover:text-white",
      )}
    >
      {children}
    </Button>
  );
};

const Navbar = () => {
  const pathName = usePathname();
  const [isSidebarOpen,setSidebarOpen]=useState(false)

  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-white">
      <Link href="/" className="pl-6 flex items-center">
        <span className={cn("text-5xl font-semibold", poppins.className)}>
          funroad
        </span>
      </Link>
      <NavbarSidebar
        open={isSidebarOpen}
        onOpenChange={setSidebarOpen}
        items={NavbarItems}
      />
      <div className="items-center gap-4 hidden lg:flex">
        {NavbarItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <NavbarItem isActive={pathName === item.href}>
              {item.children}
            </NavbarItem>
          </Link>
        ))}
      </div>
      <div className="hidden lg:flex">
        <Link href="signin">
          <Button
            variant="secondary"
            className=" border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-white hover:bg-pink-400 transition-color text-lg"
          >
            Login
          </Button>
        </Link>
        <Link href="signup">
          <Button
            variant="secondary"
            className=" border-l border-t-0 border-b-0 border-r-0 px-12 h-full rounded-none bg-black text-white hover:text-black hover:bg-pink-400 transition-color text-lg"
          >
            Start Selling
          </Button>
        </Link>
      </div>
      {/* button to change status to open and close sidebar */}
      <div className="flex lg:hidden items-center justify-center">
        <Button variant="ghost" 
        className="size-16 border-transparent bg-white"
        onClick={()=>setSidebarOpen(true)}
        >
          <MenuIcon/>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
