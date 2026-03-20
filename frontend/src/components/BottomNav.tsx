import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, CreditCard, Bell } from "lucide-react";

const items = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/claims", icon: ClipboardList, label: "Claims" },
  { to: "/plans", icon: CreditCard, label: "Policy" },
  { to: "/dashboard", icon: Bell, label: "Alerts" },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border sm:max-w-md sm:mx-auto">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
