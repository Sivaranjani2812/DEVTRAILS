import { Link } from "react-router-dom";
import { Clapperboard } from "lucide-react";

const DemoFab = () => (
  <Link
    to="/demo"
    className="fixed bottom-20 right-4 z-50 flex items-center gap-1.5 bg-foreground text-background px-3 py-2 rounded-full text-xs font-semibold shadow-lg hover:scale-105 transition-transform"
  >
    <Clapperboard className="w-4 h-4" />
    Demo Panel
  </Link>
);

export default DemoFab;
