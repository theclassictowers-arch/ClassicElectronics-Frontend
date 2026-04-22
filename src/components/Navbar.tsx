'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Shield } from 'lucide-react';
import type { NavMenuNode } from '@/services/api';
import { getNavbarData } from '@/services/api';
import { valveCategories, controllerCategories, electronicsCategories } from '@/data/dummyData';

/* ------------------------------------------------------------------ */
/*  Fallback: convert old dummyData into NavMenuNode[] format          */
/* ------------------------------------------------------------------ */

interface NavNode extends NavMenuNode {
  order?: number;
  children?: NavNode[];
}

const dummyToMenus = (): NavNode[] => {
  // Purging Valves root with children
  const valvesMenu: NavNode = {
    _id: 'fallback-valves',
    name: 'Purging Valves',
    slug: 'purging-valves',
    order: 1,
    children: valveCategories.map((vc, idx) => ({
      _id: vc._id,
      name: vc.name,
      slug: vc.slug,
      order: idx + 1,
      children: (vc.children ?? []).map((child: { _id: string; name: string; slug: string; items?: { _id: string; name: string; slug: string; model?: string; code?: string }[] }) => ({
        _id: child._id,
        name: child.name,
        slug: child.slug,
        items: (child.items ?? []).map((item: { _id: string; name: string; slug: string; model?: string; code?: string }) => ({
          _id: item._id,
          name: item.name,
          slug: item.slug,
          model: item.model || item.code,
        })),
      })),
    })),
  };

  // Controllers root
  const controllersMenu: NavNode = {
    _id: 'fallback-controllers',
    name: 'Controllers',
    slug: 'bag-filter-controllers',
    order: 2,
    children: controllerCategories.map((c, idx) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      order: idx + 1,
    })),
  };

  // Electronics root
  const electronicsMenu: NavNode = {
    _id: 'fallback-electronics',
    name: 'Electronics',
    slug: 'electronics',
    order: 3,
    children: electronicsCategories.map((c, idx) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      order: idx + 1,
    })),
  };

  return [valvesMenu, controllersMenu, electronicsMenu];
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Does a node have visible sub-items (children or items)? */
const hasDropdown = (node: NavMenuNode): boolean =>
  (node.children && node.children.length > 0) || (node.items && node.items.length > 0) || false;

/** Recursively sort nodes and their items by 'order' property */
const sortMenuNodes = (nodes: NavNode[]): NavNode[] => {
  return [...nodes]
    .sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0))
    .map(node => ({
      ...node,
      children: node.children ? sortMenuNodes(node.children as NavNode[]) : undefined,
      items: node.items ? [...node.items].sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0)) : undefined
    }));
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Navbar = () => {
  const [menus, setMenus] = useState<NavNode[]>([]);

  useEffect(() => {
    let cancelled = false;

    // Show fallback immediately
    setMenus(dummyToMenus());

    (async () => {
      const data = await getNavbarData();
      if (cancelled || !data) return;
      console.log("Navbar API Response:", data.menus); // Debugging ke liye log
      if (data.menus.length > 0) {
        setMenus(sortMenuNodes(data.menus as NavNode[]));
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Dropdown styles
  const dropdownStyle = "absolute left-0 top-full min-w-[300px] w-max max-w-[400px] bg-[#1e293b] border border-gray-700 shadow-xl rounded-b-md z-50 transition-all duration-200 origin-top opacity-0 scale-y-0 pointer-events-none group-hover:opacity-100 group-hover:scale-y-100 group-hover:pointer-events-auto";
  const subDropdownStyle = "md:absolute md:left-full md:top-0 min-w-[280px] w-max max-w-[350px] bg-[#1e293b] border border-gray-700 shadow-xl rounded-md z-50 transition-all duration-200 origin-left md:opacity-0 md:scale-x-0 md:pointer-events-none md:group-hover/item:opacity-100 md:group-hover/item:scale-x-100 md:group-hover/item:pointer-events-auto";
  const thirdDropdownStyle = "md:absolute md:left-full md:top-0 min-w-[280px] w-max max-w-[350px] bg-[#1e293b] border border-gray-700 shadow-xl rounded-md z-50 transition-all duration-200 origin-left md:opacity-0 md:scale-x-0 md:pointer-events-none md:group-hover/subitem:opacity-100 md:group-hover/subitem:scale-x-100 md:group-hover/subitem:pointer-events-auto";

  /** Render a Level-3 leaf node (items = products) */
  const renderLeafItems = (items: NavMenuNode['items']) => {
    if (!items || items.length === 0) return null;
    return items.map((item) => (
      <Link
        key={item._id || item.slug}
        href={`/clientSide/item/${item.slug}`}
        className="block px-4 py-2 text-gray-300 hover:bg-cyan-900/30 hover:text-white border-b border-gray-800 last:border-0 text-xs md:text-sm"
      >
        <div className="flex flex-col gap-0.5">
          <span className="block font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
          {((item as any).code || (item as any).model || (item as any).specifications?.model) && (
            <span className="text-[10px] text-cyan-400/80 italic font-normal">
              {(item as any).code || (item as any).model || (item as any).specifications?.model}
            </span>
          )}
        </div>
      </Link>
    ));
  };

  return (
    <nav className="bg-[#0b1120] border-t border-gray-800 md:block transition-all shadow-md w-full">
      <div className="container mx-auto px-4">
        <ul className="flex flex-col md:flex-row md:items-center md:gap-8 text-sm font-medium tracking-wide py-1 relative">

          {/* HOME */}
          <li>
            <Link href="/" className="block py-3 md:py-4 text-gray-300 hover:text-white uppercase text-xs md:text-sm">
              Home
            </Link>
          </li>

          {/* DYNAMIC MENUS — one per Level-1 root */}
          {menus.map((menu) => {
            const hasDrop = hasDropdown(menu);

            if (!hasDrop) {
              // Simple link, no dropdown
              return (
                <li key={menu._id || menu.slug}>
                  <Link
                    href={`/clientSide/category/${menu.slug}`}
                    className="block py-3 md:py-4 text-gray-300 hover:text-white uppercase text-xs md:text-sm"
                  >
                    {menu.name}
                  </Link>
                </li>
              );
            }

            // Menu with dropdown
            return (
              <li key={menu._id || menu.slug} className="relative group">
                <Link
                  href={`/clientSide/category/${menu.slug}`}
                  className="flex items-center gap-1 py-3 md:py-4 text-gray-300 hover:text-white uppercase text-xs md:text-sm"
                >
                  {menu.name} <ChevronDown size={14} />
                </Link>

                <div className={dropdownStyle}>
                  {/* Level 2 children */}
                  {(menu.children ?? []).map((child) => {
                    const childHasSubs = hasDropdown(child);

                    if (!childHasSubs) {
                      // Simple child link
                      return (
                        <Link
                          key={child._id || child.slug}
                          href={`/clientSide/category/${child.slug}`}
                          className="block px-4 py-2 text-gray-300 hover:bg-cyan-900/30 hover:text-white border-b border-gray-800 last:border-0 text-xs md:text-sm"
                        >
                          {child.name}
                        </Link>
                      );
                    }

                    // Child with sub-dropdown (Level 3)
                    return (
                      <div key={child._id || child.slug} className="relative group/item">
                        <Link
                          href={`/clientSide/category/${child.slug}`}
                          className="block px-4 py-2 text-gray-300 hover:bg-cyan-900/30 hover:text-white border-b border-gray-800 text-xs md:text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span>{child.name}</span>
                            <ChevronDown size={12} className="transition-transform group-hover/item:rotate-180" />
                          </div>
                        </Link>

                        <div className={subDropdownStyle}>
                          {/* Level 3: sub-children or leaf items */}
                          {(child.children ?? []).map((sub) => {
                            const subHasItems = sub.items && sub.items.length > 0;

                            if (!subHasItems) {
                              return (
                                <Link
                                  key={sub._id || sub.slug}
                                  href={`/clientSide/category/${sub.slug}`}
                                  className="block px-4 py-2 text-gray-300 hover:bg-cyan-900/30 hover:text-white border-b border-gray-800 last:border-0 text-xs md:text-sm"
                                >
                                  {sub.name}
                                </Link>
                              );
                            }

                            // Sub with product items (Level 3 leaf with products)
                            return (
                              <div key={sub._id || sub.slug} className="relative group/subitem">
                                <Link
                                  href={`/clientSide/category/${sub.slug}`}
                                  className="block px-4 py-2 text-gray-300 hover:bg-cyan-900/30 hover:text-white border-b border-gray-800 last:border-0 text-xs md:text-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{sub.name}</span>
                                    <ChevronDown size={12} className="transition-transform group-hover/subitem:rotate-180" />
                                  </div>
                                </Link>
                                <div className={thirdDropdownStyle}>
                                  {renderLeafItems(sub.items)}
                                </div>
                              </div>
                            );
                          })}

                          {/* If the child itself has items (products) directly */}
                          {renderLeafItems(child.items)}
                        </div>
                      </div>
                    );
                  })}

                  {/* If the menu root itself has items directly (unlikely but handled) */}
                  {renderLeafItems(menu.items)}
                </div>
              </li>
            );
          })}

          {/* ABOUT */}
          <li>
            <Link href="/clientSide/about" className="block py-3 md:py-4 text-gray-300 hover:text-white uppercase text-xs md:text-sm">
              About
            </Link>
          </li>

          {/* CONTACT */}
          <li>
            <Link href="/clientSide/contact" className="block py-3 md:py-4 text-gray-300 hover:text-white uppercase text-xs md:text-sm">
              Contact
            </Link>
          </li>

          {/* ADMIN LOGIN (Mobile only - desktop has it in MainHeader) */}
          <li className="md:hidden">
            <Link href="/admin/login" className="flex items-center gap-2 py-3 text-gray-300 hover:text-white uppercase text-xs">
              <Shield size={16} /> Admin Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
