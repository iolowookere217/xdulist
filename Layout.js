import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Receipt, BarChart3, ListTodo, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", icon: Home, page: "Home" },
  { name: "Expenses", icon: Receipt, page: "Expenses" },
  { name: "Todo", icon: ListTodo, page: "Todo" },
  { name: "Reports", icon: BarChart3, page: "Reports" },
  { name: "Settings", icon: Settings, page: "Settings" },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Ensure bottom nav is always visible */
        @media (max-width: 768px) {
          nav {
            min-height: 64px;
          }
        }
      `}</style>

      {/* Main Content */}
      <main className="pb-24 md:pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;

              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all flex-1",
                    isActive
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  )}>
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
