'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Shield } from 'lucide-react';
import type { NavMenuNode } from '@/services/api';
import { getNavbarData } from '@/services/api';
import {
  valveCategories,
  controllerCategories,
  electronicsCategories,
} from '@/data/dummyData';

interface NavNode extends NavMenuNode {
  order?: number;
  children?: NavNode[];
}

const dummyToMenus = (): NavNode[] => {
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
      children: (vc.children ?? []).map(
        (child: {
          _id: string;
          name: string;
          slug: string;
          items?: {
            _id: string;
            name: string;
            slug: string;
            model?: string;
            code?: string;
          }[];
        }) => ({
          _id: child._id,
          name: child.name,
          slug: child.slug,
          items: (child.items ?? []).map(
            (item: {
              _id: string;
              name: string;
              slug: string;
              model?: string;
              code?: string;
            }) => ({
              _id: item._id,
              name: item.name,
              slug: item.slug,
              model: item.model || item.code,
            })
          ),
        })
      ),
    })),
  };

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

const hasDropdown = (node: NavMenuNode): boolean =>
  (node.children && node.children.length > 0) ||
  (node.items && node.items.length > 0) ||
  false;

const sortMenuNodes = (nodes: NavNode[]): NavNode[] => {
  return [...nodes]
    .sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0))
    .map((node) => ({
      ...node,
      children: node.children
        ? sortMenuNodes(node.children as NavNode[])
        : undefined,
      items: node.items
        ? [...node.items].sort(
            (a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0)
          )
        : undefined,
    }));
};

const Navbar = () => {
  const [menus, setMenus] = useState<NavNode[]>([]);

  useEffect(() => {
    let cancelled = false;

    setMenus(dummyToMenus());

    (async () => {
      try {
        const data = await getNavbarData();
        if (cancelled || !data) return;

        if (data.menus?.length > 0) {
          setMenus(sortMenuNodes(data.menus as NavNode[]));
        }
      } catch (error) {
        console.error('Navbar fetch failed:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const dropdownStyle =
    'absolute left-0 top-full min-w-[240px] w-max max-w-[320px] bg-[#1e293b]/95 backdrop-blur-md border border-gray-700 shadow-2xl rounded-b-xl z-50 origin-top opacity-0 translate-y-3 scale-95 pointer-events-none transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto';

  const subDropdownStyle =
    'md:absolute md:left-full md:top-0 min-w-[220px] w-max max-w-[300px] bg-[#1e293b]/95 backdrop-blur-md border border-gray-700 shadow-2xl rounded-xl z-50 origin-left md:opacity-0 md:translate-x-3 md:scale-95 md:pointer-events-none md:transition-all md:duration-300 md:ease-out md:group-hover/item:opacity-100 md:group-hover/item:translate-x-0 md:group-hover/item:scale-100 md:group-hover/item:pointer-events-auto';

  const thirdDropdownStyle =
    'md:absolute md:left-full md:top-0 min-w-[230px] w-max max-w-[310px] bg-[#1e293b]/95 backdrop-blur-md border border-gray-700 shadow-2xl rounded-xl z-50 origin-left md:opacity-0 md:translate-x-3 md:scale-95 md:pointer-events-none md:transition-all md:duration-300 md:ease-out md:group-hover/subitem:opacity-100 md:group-hover/subitem:translate-x-0 md:group-hover/subitem:scale-100 md:group-hover/subitem:pointer-events-auto';

  const renderLeafItems = (items: NavMenuNode['items']) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-thin scrollbar-thumb-cyan-600 scrollbar-track-transparent">
        {items.map((item) => (
          <Link
            key={item._id || item.slug}
            href={`/clientSide/item/${item.slug}`}
            className="block px-3 py-2.5 text-gray-300 hover:bg-cyan-900/30 hover:text-white border-b border-gray-800/80 last:border-0 text-xs md:text-sm transition-colors duration-200"
          >
            <div className="flex flex-col gap-0.5">
              <span className="block font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {item.name}
              </span>

              {((item as any).code ||
                (item as any).model ||
                (item as any).specifications?.model) && (
                <span className="text-[10px] text-cyan-400/80 italic font-normal">
                  {(item as any).code ||
                    (item as any).model ||
                    (item as any).specifications?.model}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <nav className="bg-[#0b1120] border-t border-gray-800 md:block transition-all shadow-md w-full">
      <div className="container mx-auto px-4">
        <ul className="flex flex-col md:flex-row md:items-center md:gap-8 text-sm font-medium tracking-wide py-1 relative">
          <li>
            <Link
              href="/"
              className="block py-3 md:py-4 text-gray-300 hover:text-white uppercase text-xs md:text-sm transition-colors duration-200"
            >
              Home
            </Link>
          </li>

          {menus.map((menu) => {
            const hasDrop = hasDropdown(menu);

            if (!hasDrop) {
              return (
                <li key={menu._id || menu.slug}>
                  <Link
                    href={`/clientSide/category/${menu.slug}`}
                    className="block py-3 md:py-4 text-gray-300 hover:text-white uppercase text-xs md:text-sm transition-colors duration-200"
                  >
                    {menu.name}
                  </Link>
                </li>
              );
            }

            return (
              <li key={menu._id || menu.slug} className="relative group">
                <Link
                  href={`/clientSide/category/${menu.slug}`}
                  className="flex items-center gap-1 py-3 md:py-4 text-gray-300 hover:text-white uppercase text-xs md:text-sm transition-colors duration-200"
                >
                  {menu.name}
                  <ChevronDown
                    size={14}
                    className="transition-transform duration-300 group-hover:rotate-180"
                  />
                </Link>

                <div className={dropdownStyle}>
                  {(menu.children ?? []).map((child) => {
                    const childHasSubs = hasDropdown(child);

                    if (!childHasSubs) {
                      return (
                        <Link
                          key={child._id || child.slug}
                          href={`/clientSide/category/${child.slug}`}
                          className="block px-3 py-2.5 text-gray-300 hover:bg-cyan-900/30 hover:text-white border-b border-gray-800/80 last:border-0 text-xs md:text-sm transition-colors duration-200"
                        >
                          {child.name}
                        </Link>
                      );
                    }

                    return (
                      <div
                        key={child._id || child.slug}
                        className="relative group/item"
                      >
                        <Link
                          href={`/clientSide/category/${child.slug}`}
                          className="block px-3 py-2.5 text-gray-300 hover:bg-cyan-900/30 hover:text-white border-b border-gray-800/80 text-xs md:text-sm transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span>{child.name}</span>
                            <ChevronRight
                              size={14}
                              className="hidden md:block transition-transform duration-300 group-hover/item:translate-x-1"
                            />
                            <ChevronDown
                              size={12}
                              className="md:hidden transition-transform duration-300 group-hover/item:rotate-180"
                            />
                          </div>
                        </Link>

                        <div className={subDropdownStyle}>
                          {(child.children ?? []).map((sub) => {
                            const subHasItems =
                              sub.items && sub.items.length > 0;

                            if (!subHasItems) {
                              return (
                                <Link
                                  key={sub._id || sub.slug}
                                  href={`/clientSide/category/${sub.slug}`}
                                  className="block px-3 py-2.5 text-gray-300 hover:bg-cyan-900/30 hover:text-white border-b border-gray-800/80 last:border-0 text-xs md:text-sm transition-colors duration-200"
                                >
                                  {sub.name}
                                </Link>
                              );
                            }

                            return (
                              <div
                                key={sub._id || sub.slug}
                                className="relative group/subitem"
                              >
                                <Link
                                  href={`/clientSide/category/${sub.slug}`}
                                  className="block px-3 py-2.5 text-gray-300 hover:bg-cyan-900/30 hover:text-white border-b border-gray-800/80 last:border-0 text-xs md:text-sm transition-colors duration-200"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <span>{sub.name}</span>
                                    <ChevronRight
                                      size={14}
                                      className="hidden md:block transition-transform duration-300 group-hover/subitem:translate-x-1"
                                    />
                                    <ChevronDown
                                      size={12}
                                      className="md:hidden transition-transform duration-300 group-hover/subitem:rotate-180"
                                    />
                                  </div>
                                </Link>

                                <div className={thirdDropdownStyle}>
                                  {renderLeafItems(sub.items)}
                                </div>
                              </div>
                            );
                          })}

                          {renderLeafItems(child.items)}
                        </div>
                      </div>
                    );
                  })}

                  {renderLeafItems(menu.items)}
                </div>
              </li>
            );
          })}

          <li>
            <Link
              href="/clientSide/about"
              className="block py-3 md:py-4 text-gray-300 hover:text-white uppercase text-xs md:text-sm transition-colors duration-200"
            >
              About
            </Link>
          </li>

          <li>
            <Link
              href="/clientSide/contact"
              className="block py-3 md:py-4 text-gray-300 hover:text-white uppercase text-xs md:text-sm transition-colors duration-200"
            >
              Contact
            </Link>
          </li>

          <li className="md:hidden">
            <Link
              href="/admin/login"
              className="flex items-center gap-2 py-3 text-gray-300 hover:text-white uppercase text-xs transition-colors duration-200"
            >
              <Shield size={16} />
              Admin Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;