'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                subject: '',
                message: ''
            });
        }, 3000);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-[#0b1120] to-[#1e293b] py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <span className="text-cyan-500 font-bold uppercase tracking-wider text-sm block mb-4">Get in Touch</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contact Us</h1>
                        <p className="text-xl text-gray-300">
                            Have questions about our products? Need a custom solution? We&apos;re here to help. Reach out to us and our team will get back to you as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Info & Form */}
            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#1e293b] rounded-lg p-6 border border-gray-800">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MapPin className="text-cyan-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Address</h3>
                                    <p className="text-gray-400">
                                        Classic Electronics<br />
                                        G11 Markaz, Islamabad<br />
                                        Pakistan
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1e293b] rounded-lg p-6 border border-gray-800">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Phone className="text-cyan-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Phone</h3>
                                    <p className="text-gray-400">
                                        +923 111 777 510
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1e293b] rounded-lg p-6 border border-gray-800">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="text-cyan-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                                    <p className="text-gray-400">
                                        sales@classicelectronics.pk
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1e293b] rounded-lg p-6 border border-gray-800">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="text-cyan-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Business Hours</h3>
                                    <p className="text-gray-400">
                                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                                        Saturday: 9:00 AM - 2:00 PM<br />
                                        Sunday: Closed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-800">
                            <div className="flex items-center gap-3 mb-6">
                                <MessageSquare className="text-cyan-400" size={24} />
                                <h2 className="text-2xl font-bold text-white">Send us a Message</h2>
                            </div>

                            {submitted ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="text-green-400 mx-auto mb-4" size={64} />
                                    <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                                    <p className="text-gray-400">Your message has been sent successfully. We'll get back to you soon.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-[#0f172a] text-white px-4 py-3 rounded border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-[#0f172a] text-white px-4 py-3 rounded border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-[#0f172a] text-white px-4 py-3 rounded border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">Company Name</label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                className="w-full bg-[#0f172a] text-white px-4 py-3 rounded border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                                placeholder="Enter company name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">Subject *</label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-[#0f172a] text-white px-4 py-3 rounded border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors"
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="product-inquiry">Product Inquiry</option>
                                            <option value="quote-request">Request a Quote</option>
                                            <option value="technical-support">Technical Support</option>
                                            <option value="custom-solution">Custom Solution</option>
                                            <option value="order-status">Order Status</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">Message *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className="w-full bg-[#0f172a] text-white px-4 py-3 rounded border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-colors resize-none"
                                            placeholder="Tell us more about your requirements..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-8 rounded flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Send size={20} />
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Links */}
            <section className="bg-[#0b1120] py-16 border-t border-gray-800">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Quick Links</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <a href="/clientSide/valves" className="bg-[#1e293b] p-6 rounded-lg border border-gray-800 hover:border-cyan-600 transition-colors">
                            <h3 className="text-white font-bold mb-2">Valves</h3>
                            <p className="text-gray-400 text-sm">Browse our valve collection</p>
                        </a>
                        <a href="/clientSide/controllers" className="bg-[#1e293b] p-6 rounded-lg border border-gray-800 hover:border-cyan-600 transition-colors">
                            <h3 className="text-white font-bold mb-2">Controllers</h3>
                            <p className="text-gray-400 text-sm">View industrial controllers</p>
                        </a>
                        <a href="/clientSide/electronics" className="bg-[#1e293b] p-6 rounded-lg border border-gray-800 hover:border-cyan-600 transition-colors">
                            <h3 className="text-white font-bold mb-2">Electronics</h3>
                            <p className="text-gray-400 text-sm">Explore electronic components</p>
                        </a>
                        <a href="/clientSide/track-order" className="bg-[#1e293b] p-6 rounded-lg border border-gray-800 hover:border-cyan-600 transition-colors">
                            <h3 className="text-white font-bold mb-2">Track Order</h3>
                            <p className="text-gray-400 text-sm">Check your order status</p>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
