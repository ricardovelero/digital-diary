import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { menuItems } from "@/lib/menuItems";
import { BookHeart } from "lucide-react";

export default function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <NavLink
        to='/'
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 text-sm px-4 py-3 rounded-md transition-colors",
            isActive
              ? "bg-primary text-white"
              : "hover:text-primary hover:bg-secondary"
          )
        }
      >
        <BookHeart className='h-5' />
        <span>Digital Diary</span>
      </NavLink>
      {menuItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.url}
          className={({ isActive }) =>
            cn(
              "text-sm font-medium transition-colors px-4 py-3 rounded-md",
              isActive
                ? "bg-primary text-white"
                : "hover:text-primary hover:bg-secondary"
            )
          }
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}
