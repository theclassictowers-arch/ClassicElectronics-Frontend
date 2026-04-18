import Link from 'next/link';

export default function TermsAndConditionsPage() {
    return (
        <div className="min-h-screen">
            <section className="bg-gradient-to-r from-[#0b1120] to-[#1e293b] py-16">
                <div className="container mx-auto px-4">
                    <span className="text-cyan-500 font-bold uppercase tracking-wider text-sm block mb-4">Legal</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Terms &amp; Conditions</h1>
                    <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
                        These terms are provided as a general template. Please review and update this page to match your business policies.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 py-16">
                <div className="bg-[#1e293b] rounded-lg p-8 border border-gray-800 max-w-4xl">
                    <div className="space-y-6 text-gray-300 leading-relaxed">
                        <p>
                            By accessing and using the Classic Electronics website and services, you agree to comply with these Terms &amp; Conditions.
                        </p>

                        <div>
                            <h2 className="text-white font-bold text-xl mb-2">1. Products &amp; Pricing</h2>
                            <p>
                                Product information, availability, and pricing may change without notice. For quotations and bulk orders, please contact our sales team.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-white font-bold text-xl mb-2">2. Orders</h2>
                            <p>
                                Orders are subject to confirmation and acceptance. We may request additional details to process an order, including shipping information and contact details.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-white font-bold text-xl mb-2">3. Warranty &amp; Returns</h2>
                            <p>
                                Warranty terms (if any) depend on the product and manufacturer policies. Returns and exchanges are handled on a case-by-case basis.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-white font-bold text-xl mb-2">4. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by law, Classic Electronics will not be liable for any indirect, incidental, or consequential damages arising from the use of this website or products.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-white font-bold text-xl mb-2">5. Contact</h2>
                            <p>
                                For questions about these terms, please{' '}
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

