'use client';

import React, { useState } from 'react';
import TopHeader from './TopHeader';
import MainHeader from './MainHeader';

const Header = ({ navbar }: { navbar?: React.ReactNode }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <TopHeader />
            <header className="bg-background text-foreground border-b border-border sticky top-0 z-50 transition-colors duration-300">
                <MainHeader isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
                <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block transition-all`}>
                    {navbar}
                </div>
            </header>
        </>
    );
};

export default Header;
