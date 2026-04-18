import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen">
            <section className="bg-gradient-to-r from-[#0b1120] to-[#1e293b] py-16">
                <div className="container mx-auto px-4">
                    <span className="text-cyan-500 font-bold uppercase tracking-wider text-sm block mb-4">Legal</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Privacy Policy</h1>
                    <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
                        This policy is provided as a general template. Please review and update this page to reflect your actual data handling practices.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 py-16">
                <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-800 max-w-4xl">
                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <p>
                            Classic Electronics may collect limited information when you contact us, request a quote, or place an order. We use this information to respond to inquiries and provide services.
                        </p>

                        <div>
                            <h2 className="text-white font-bold text-xl mb-2">1. Information We Collect</h2>
                            <p>
                                This may include your name, email address, phone number, company name, shipping details, and any information you include in messages or order notes.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-white font-bold text-xl mb-2">2. How We Use Information</h2>
                            <p>
                                We use the information to communicate with you, process requests, improve customer support, and fulfill orders.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-white font-bold text-xl mb-2">3. Sharing</h2>
                            <p>
                                We do not sell personal information. We may share details with service providers (e.g., logistics) only as needed to fulfill services.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-white font-bold text-xl mb-2">4. Contact</h2>
                            <p>
                                If you have questions about this policy, please{' '}
                                <Link href="/clientSide/contact" className="text-cyan-400 hover:text-white transition-colors">
                                    contact us
                                </Link>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

