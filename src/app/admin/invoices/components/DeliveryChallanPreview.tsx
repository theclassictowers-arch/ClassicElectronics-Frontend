import Image from 'next/image';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import type { InvoiceForm, InvoiceItem } from '../types';
import { GST_REGISTRATION_PLACEHOLDER } from '../utils';
import { DocumentFooter } from './DocumentFooter';

type DeliveryChallanPreviewProps = {
  form: InvoiceForm;
  items: InvoiceItem[];
};

export const DeliveryChallanPreview = ({ form, items }: DeliveryChallanPreviewProps) => (
  <div className="relative flex min-h-[1040px] flex-col overflow-hidden bg-white px-8 py-10 text-black">
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.08]">
      <Image
        src={CLASSIC_LOGO_SRC}
        alt=""
        width={900}
        height={360}
        className="h-auto w-[78%] max-w-[520px]"
      />
    </div>

    <div className="relative z-10 flex items-start justify-between">
      <div>
        <Image
          src={CLASSIC_LOGO_SRC}
          alt="Classic Electronics"
          width={300}
          height={120}
          className="h-auto w-[190px]"
          priority
        />
      </div>
      <div className="pt-4 text-right text-[16px] font-semibold leading-tight">
        <div>Delivery Challan:{form.invoiceNo || '---'}</div>
        <div>Date: {form.date || '--/--/----'}</div>
      </div>
    </div>

    <div className="mt-4 grid grid-cols-[110px_1fr_125px_155px] gap-x-2 text-[14px] leading-[1.55]">
      <div>Name of Buyer</div>
      <div className="font-semibold">{form.companyName || 'Customer Company'}</div>
      <div>Our Sale tax Reg #:</div>
      <div>05-07-8500-014-73</div>
      <div>Address</div>
      <div className="font-semibold">{form.location || 'Customer Address'}</div>
    </div>

    <div className="mt-16 text-[14px] leading-[1.55]">
      <div>Sales Tax Registration No {form.gst || GST_REGISTRATION_PLACEHOLDER}</div>
      <div>PO:{form.purchaseOrder || '________________'}</div>
    </div>

    <table className="mt-1 w-full table-fixed border-collapse border border-black text-[14px]">
      <thead>
        <tr className="h-6 border-b border-black">
          <th className="w-[17%] border-r border-black text-center font-semibold">S.No</th>
          <th className="w-[47%] border-r border-black text-center font-semibold">Particulars</th>
          <th className="w-[14%] border-r border-black text-center font-semibold">Qty</th>
          <th className="w-[22%] text-center font-semibold">Remarks</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id} className="h-24 align-top">
            <td className="border-r border-black px-3 py-8 text-center">{index + 1}</td>
            <td className="border-r border-black px-3 py-8">
              {item.description || item.productName || 'Item particulars'}
            </td>
            <td className="border-r border-black px-3 py-8 text-center">{item.quantity || ''}</td>
            <td className="px-3 py-8">{item.remarks}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="mt-8 flex items-start gap-6">
      <div className="pt-4 text-[14px]">From Classic Electronics</div>
    </div>

    <div className="mt-20 text-[14px] font-semibold leading-[1.55]">
      <div>{form.directorName || 'M Fawad  Younis'}</div>
      <div>Director</div>
    </div>

    <div className="mt-8 text-right text-[14px] font-black italic leading-none text-violet-700 drop-shadow-[1px_1px_1px_rgba(15,23,42,0.22)]">
      {form.thankYouNote || 'THANK YOU FOR YOUR BUSINESS!'}
    </div>
    <div className="mt-2 text-center text-[11px] font-bold leading-none text-black">
      {form.subtitle || 'A wide range of industrial instrument & sensing solutions'}
    </div>

    <DocumentFooter form={form} className="-mx-8 mt-0 w-[calc(100%+64px)]" />
  </div>
);
