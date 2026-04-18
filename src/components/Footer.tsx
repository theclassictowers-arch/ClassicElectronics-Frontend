import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
    const quickLinks = [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/clientSide/about' },
        { label: 'Products', href: '/clientSide/products' },
        { label: 'Contact Us', href: '/clientSide/contact' },
        { label: 'Terms & Conditions', href: '/clientSide/terms-and-conditions' },
        { label: 'Privacy Policy', href: '/clientSide/privacy-policy' },
    ] as const;

    const productLinks = [
        { label: 'Bag Filter Controllers', href: '/clientSide/category/sequential-timer-controllers' },
        { label: 'Purging Valves', href: '/clientSide/category/solenoid-valves' },
        { label: 'Sequential Timers', href: '/clientSide/category/sequential-timer-controllers' },
        { label: 'Industrial Sensors', href: '/clientSide/category/sensors' },
        { label: 'Power Supplies', href: '/clientSide/category/power-supplies' },
    ] as const;

    const address = 'Al Rahmat plaza Shop No is 7 & 8, G11 Markaz, Islamabad, Pakistan';
    const phone = '+923111777510';
    const email = 'sales@classicelectronics.com.pk';
    const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    return (
        <footer className="bg-[#0b1120] text-gray-400 pt-16 pb-8 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Info */}
                    <div>
                        <Link href="/" className="flex items-center gap-3 mb-6 text-white">
                            <div className="relative w-[200px] h-[60px]">
                                <Image
                                    src="/Classic_logo.png"
                                    alt="Classic Electronics Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <p className="mb-6 leading-relaxed text-sm">
                            Creator of new ideas in industrial electronics and purging solutions. Engineered for reliability and performance in the toughest conditions.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="bg-gray-800 p-2 rounded-full hover:bg-cyan-600 hover:text-white transition-all"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider mb-6">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            {quickLinks.map(({ label, href }) => (
                                <li key={label}>
                                    <Link href={href} className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                                        <span className="text-cyan-600">›</span> {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider mb-6">Products</h3>
                        <ul className="space-y-3 text-sm">
                            {productLinks.map(({ label, href }) => (
                                <li key={label}>
                                    <Link href={href} className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                                        <span className="text-cyan-600">›</span> {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider mb-6">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-4">
                                <MapPin className="text-cyan-600 shrink-0 mt-1" size={18} />
                                <a
                                    href={mapsHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-cyan-400 transition-colors"
                                >
                                    {address}
                                </a>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="text-cyan-600 shrink-0" size={18} />
                                <a href={`tel:${phone}`} className="hover:text-cyan-400 transition-colors">
                                    +923 111 777 510
                                </a>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="text-cyan-600 shrink-0" size={18} />
                                <a href={`mailto:${email}`} className="hover:text-cyan-400 transition-colors">
                                    {email}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center bg-[#0b1120]">
                    <p className="text-sm text-center md:text-left mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} Classic Electronics. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <span className="text-gray-500">Premium Industrial Solutions</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
