'use client';

import Image from 'next/image';
import { Mail } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import type { InvoiceForm } from '../types';
import { formatClassicPhoneDisplay } from '../utils';

type DocumentFooterProps = {
  form: InvoiceForm;
  className?: string;
};

const getFooterAddressLines = (address?: string) => {
  const footerAddress = address || '133G St # 109 Sector G 11/3, Islamabad';

  if (!footerAddress.toLowerCase().includes('islamabad')) {
    return [footerAddress];
  }

  return [footerAddress.replace(/,?\s*islamabad/i, '').trim(), 'Islamabad'];
};

export const DocumentFooter = ({ form, className = '' }: DocumentFooterProps) => {
  const addressLines = getFooterAddressLines(form.address);
  const [websiteQr, setWebsiteQr] = useState('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL('https://classicelectronics.com.pk/', {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 320,
      color: { dark: '#000000', light: '#FFFFFF' },
    }).then((value) => {
      if (active) setWebsiteQr(value);
    }).catch((error) => console.error('Unable to generate website QR code', error));

    return () => { active = false; };
  }, []);

  return (
    <div className={`h-[66px] w-full shrink-0 px-0 py-0 text-black ${className}`}>
      <div className="relative h-full w-full">
        {websiteQr ? (
          <div className="absolute bottom-[1px] left-1/2 z-20 -translate-x-1/2 rounded bg-white p-[2px] text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={websiteQr} alt="Scan to open Classic Electronics website" className="h-[58px] w-[58px]" />
          </div>
        ) : null}
        <div className="absolute bottom-[4px] left-0 right-0 grid grid-cols-3 items-end text-[12px] leading-[15px]">
          <div className="flex h-[52px] items-end justify-center pl-[68px] text-left">
            <div className="flex w-[250px] items-end justify-center gap-2">
              <Image
                src="/quotation-globe.png"
                alt=""
                width={90}
                height={90}
                className="h-auto w-[58px] shrink-0"
              />
              <div className="w-[182px]">
                <div className="font-bold">{form.website || 'www.classicelectronics.com.pk'}</div>
                {addressLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex h-[52px] items-end justify-center text-center">
            <div className="flex w-[250px] items-end justify-center gap-2">
              <div className="mb-[2px] flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-[3px] border-blue-600 text-blue-600">
                <Mail size={21} strokeWidth={2.4} />
              </div>
              <div className="w-[145px] text-[10px] leading-[13px]">
                <div className="font-bold">NTN: 1700506</div>
                <div className="font-bold">GST: 05-07-8500-014-73</div>
                <div>{form.email || 'sales@classicelectronics.com.pk'}</div>
              </div>
            </div>
          </div>

          <div className="flex h-[52px] items-end justify-center text-center">
            <div className="flex w-[250px] items-end justify-center gap-2">
              <Image
                src="/quotation-whatsapp.png"
                alt=""
                width={60}
                height={60}
                className="h-auto w-[50px] shrink-0"
              />
              <div className="w-[140px] font-bold">
                <div>{formatClassicPhoneDisplay(form.phonePrimary, '+923 111 777 510')}</div>
                <div>{formatClassicPhoneDisplay(form.phoneSecondary, '+923 215 180 308')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
