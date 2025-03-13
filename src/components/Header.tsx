
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  PenLine, 
  Users, 
  Info,
  Menu,
  X
} from "lucide-react";

const Header = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 md:px-8 py-4
        ${isScrolled ? "bg-white/80 backdrop-blur shadow-sm" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-xl bg-primary/10 text-primary"
          >
            <PenLine size={24} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-xl font-medium tracking-tight"
          >
            Shared Canvas
          </motion.h1>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" current={location.pathname === "/"}>
            <PenLine size={18} className="mr-1.5" />
            Whiteboard
          </NavLink>
          <NavLink to="/about" current={location.pathname === "/about"}>
            <Info size={18} className="mr-1.5" />
            About
          </NavLink>
        </nav>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMenu} 
          className="md:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="md:hidden absolute top-full left-0 right-0 bg-white/90 backdrop-blur shadow-md p-4"
        >
          <nav className="flex flex-col space-y-2">
            <MobileNavLink to="/" current={location.pathname === "/"} onClick={() => setIsMenuOpen(false)}>
              <PenLine size={18} className="mr-2" />
              Whiteboard
            </MobileNavLink>
            <MobileNavLink to="/about" current={location.pathname === "/about"} onClick={() => setIsMenuOpen(false)}>
              <Info size={18} className="mr-2" />
              About
            </MobileNavLink>
          </nav>
        </motion.div>
      )}
    </header>
  );
};

const NavLink = ({ to, current, children }: { to: string; current: boolean; children: React.ReactNode }) => (
  <Link
    to={to}
    className={`relative px-3 py-2 rounded-lg flex items-center text-sm font-medium transition-all
      ${current 
        ? "text-primary bg-primary/10" 
        : "text-foreground/80 hover:text-foreground hover:bg-secondary"
      }`}
  >
    {children}
    {current && (
      <motion.div
        layoutId="nav-indicator"
        className="absolute -bottom-1 left-1/2 w-12 h-0.5 bg-primary rounded-full -translate-x-1/2"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </Link>
);

const MobileNavLink = ({ 
  to, 
  current, 
  onClick, 
  children 
}: { 
  to: string; 
  current: boolean; 
  onClick: () => void; 
  children: React.ReactNode 
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={`px-4 py-3 rounded-lg flex items-center text-base font-medium transition-all
      ${current 
        ? "text-primary bg-primary/10" 
        : "text-foreground/80 hover:text-foreground hover:bg-secondary"
      }`}
  >
    {children}
  </Link>
);

export default Header;
