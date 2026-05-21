import Image from 'next/image';
import { Mail } from 'lucide-react';
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

  return (
    <div className={`h-[66px] w-full shrink-0 px-0 py-0 text-black ${className}`}>
      <div className="relative h-full w-full">
        <div className="absolute bottom-[4px] left-0 right-0 grid grid-cols-3 text-[11px] leading-[14px]">
          <div className="flex h-[52px] translate-x-[10px] items-end justify-center gap-2 text-center">
            <Image
              src="/quotation-globe.png"
              alt=""
              width={90}
              height={90}
              className="h-auto w-[50px] shrink-0"
            />
            <div className="w-[190px]">
              <div className="font-bold">{form.website || 'www.classicelectronics.com.pk'}</div>
              {addressLines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>

          <div className="flex h-[52px] items-end justify-center gap-2 text-center">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[3px] border-blue-600 text-blue-600">
              <Mail size={20} strokeWidth={2.4} />
            </div>
            <div className="w-[210px]">
              <div className="font-bold">NTN: 1700506</div>
              <div className="font-bold">GST: 05-07-8500-014-73</div>
              <div>{form.email || 'sales@classicelectronics.com.pk'}</div>
            </div>
          </div>

          <div className="flex h-[52px] items-end justify-center gap-2 text-center">
            <Image
              src="/quotation-whatsapp.png"
              alt=""
              width={60}
              height={60}
              className="h-auto w-[50px] shrink-0"
            />
            <div className="w-[125px] font-bold">
              <div>{formatClassicPhoneDisplay(form.phonePrimary, '+923 111 777 510')}</div>
              <div>{formatClassicPhoneDisplay(form.phoneSecondary, '+923 215 180 308')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
