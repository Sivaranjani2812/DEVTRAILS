import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, Menu, X, LogOut } from "lucide-react";

const navLinks = [
  { to: "/profile", label: "Profile" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/claims", label: "Claims" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("InsureGig_user_id");

  const handleLogout = () => {
    localStorage.removeItem("InsureGig_user_id");
    localStorage.removeItem("InsureGig_name");
    localStorage.removeItem("InsureGig_location");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-primary">
          <Shield className="w-6 h-6" />
          InsureGig
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === link.to
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/5 rounded-md flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === link.to
                    ? "text-primary bg-primary/5"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-danger hover:bg-danger/5 rounded-md flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
