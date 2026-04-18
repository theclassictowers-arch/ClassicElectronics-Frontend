'use client';

import React from 'react';
import { Award, Users, Factory, Clock, Shield, Wrench, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const AboutPage = () => {

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-[#0b1120] to-[#1e293b] py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl">
                        <span className="text-cyan-500 font-bold uppercase tracking-wider text-sm block mb-4">About Us</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Classic Electronics
                        </h1>
                        <p className="text-xl text-gray-300 leading-relaxed">
                            Your trusted partner for industrial automation solutions. We specialize in high-quality solenoid valves, diaphragm valves, controllers, and electronic components for dust collection systems and industrial applications.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-[#0b1120] py-16 border-y border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">15+</div>
                            <div className="text-gray-400">Years Experience</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">500+</div>
                            <div className="text-gray-400">Happy Clients</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">1000+</div>
                            <div className="text-gray-400">Products Delivered</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">24/7</div>
                            <div className="text-gray-400">Support Available</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="text-cyan-500 font-bold uppercase tracking-wider text-sm block mb-4">Our Story</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Building Quality Since 2008
                        </h2>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Classic Electronics was founded with a vision to provide high-quality industrial automation components at competitive prices. What started as a small trading company has grown into a trusted name in the industry, serving clients across Pakistan and beyond.
                        </p>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Our focus on quality, reliability, and customer service has helped us build long-lasting relationships with our clients. We understand the importance of precision and durability in industrial applications, which is why we only source products that meet international standards.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-cyan-400">
                                <CheckCircle size={18} /> ISO 9001 Certified
                            </div>
                            <div className="flex items-center gap-2 text-cyan-400">
                                <CheckCircle size={18} /> CE Certified Products
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-800">
                        <img
                            src="/images/products/valvesSliderimg.jpeg"
                            alt="Classic Electronics Products"
                            className="w-full h-64 object-cover rounded-lg mb-6"
                        />
                        <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
                        <p className="text-gray-400">
                            To provide reliable, high-quality industrial automation solutions that help our clients achieve operational excellence and efficiency in their manufacturing processes.
                        </p>
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="bg-[#0b1120] py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-cyan-500 font-bold uppercase tracking-wider text-sm block mb-4">What We Offer</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Our Products & Services</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-[#1e293b] p-8 rounded-xl border border-gray-800 hover:border-cyan-600 transition-colors">
                            <div className="w-14 h-14 bg-cyan-900/30 rounded-lg flex items-center justify-center mb-6">
                                <Factory className="text-cyan-400" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Industrial Valves</h3>
                            <p className="text-gray-400 mb-4">Complete range of solenoid valves, diaphragm valves, and repair kits from leading brands including ASCO, GOYEN, MECAIR, and TURBO equivalents.</p>
                            <Link href="/clientSide/valves" className="text-cyan-400 font-medium flex items-center gap-2 hover:text-white transition-colors">
                                View Valves <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="bg-[#1e293b] p-8 rounded-xl border border-gray-800 hover:border-cyan-600 transition-colors">
                            <div className="w-14 h-14 bg-cyan-900/30 rounded-lg flex items-center justify-center mb-6">
                                <Clock className="text-cyan-400" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Controllers</h3>
                            <p className="text-gray-400 mb-4">Sequential timer controllers, PLC-based systems, and differential pressure controllers for complete automation solutions.</p>
                            <Link href="/clientSide/controllers" className="text-cyan-400 font-medium flex items-center gap-2 hover:text-white transition-colors">
                                View Controllers <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="bg-[#1e293b] p-8 rounded-xl border border-gray-800 hover:border-cyan-600 transition-colors">
                            <div className="w-14 h-14 bg-cyan-900/30 rounded-lg flex items-center justify-center mb-6">
                                <Wrench className="text-cyan-400" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Custom Solutions</h3>
                            <p className="text-gray-400 mb-4">Custom PCB design, control panel manufacturing, and complete turnkey solutions for your specific industrial requirements.</p>
                            <Link href="/clientSide/contact" className="text-cyan-400 font-medium flex items-center gap-2 hover:text-white transition-colors">
                                Contact Us <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <span className="text-cyan-500 font-bold uppercase tracking-wider text-sm block mb-4">Why Choose Us</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Our Strengths</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#1e293b] p-6 rounded-lg border border-gray-800 text-center">
                        <div className="w-12 h-12 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="text-cyan-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Quality Products</h3>
                        <p className="text-gray-400 text-sm">CE and ISO certified products from trusted manufacturers.</p>
                    </div>

                    <div className="bg-[#1e293b] p-6 rounded-lg border border-gray-800 text-center">
                        <div className="w-12 h-12 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="text-cyan-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Expert Team</h3>
                        <p className="text-gray-400 text-sm">Experienced engineers and technical support staff.</p>
                    </div>

                    <div className="bg-[#1e293b] p-6 rounded-lg border border-gray-800 text-center">
                        <div className="w-12 h-12 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-cyan-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Fast Delivery</h3>
                        <p className="text-gray-400 text-sm">Quick dispatch and reliable delivery nationwide.</p>
                    </div>

                    <div className="bg-[#1e293b] p-6 rounded-lg border border-gray-800 text-center">
                        <div className="w-12 h-12 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="text-cyan-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Warranty</h3>
                        <p className="text-gray-400 text-sm">Manufacturer warranty on all products.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 py-16 border-y border-gray-800">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                        Contact us today to discuss your industrial automation needs. Our team is ready to help you find the right solutions.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/clientSide/contact"
                            className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded font-bold uppercase tracking-wide transition-colors"
                        >
                            Contact Us
                        </Link>
                        <Link
                            href="/clientSide/products"
                            className="bg-transparent border border-white text-white hover:bg-white/10 px-8 py-4 rounded font-bold uppercase tracking-wide transition-colors"
                        >
                            Browse Products
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
