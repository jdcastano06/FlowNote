"use client";

import { ChevronRight, Home } from "lucide-react";
import { Button } from "../ui/button";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-muted-foreground hover:text-foreground"
        onClick={items[0]?.onClick}
      >
        <Home className="w-4 h-4" />
      </Button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="w-4 h-4" />
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 ${
              index === items.length - 1
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={item.onClick}
            disabled={index === items.length - 1}
          >
            {item.label}
          </Button>
        </div>
      ))}
    </nav>
  );
}
