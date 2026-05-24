import Image from 'next/image';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import type { InvoiceForm, InvoiceItem } from '../types';
import { getCustomerDetailRows } from '../utils';
import { DocumentFooter } from './DocumentFooter';

type DeliveryChallanPreviewProps = {
  form: InvoiceForm;
  items: InvoiceItem[];
};

export const DeliveryChallanPreview = ({ form, items }: DeliveryChallanPreviewProps) => {
  const customerRows = getCustomerDetailRows(form);

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div className="max-w-[285px] shrink-0">
          <Image
            src={CLASSIC_LOGO_SRC}
            alt="Classic Electronics"
            width={360}
            height={135}
            className="h-auto w-full"
            priority
          />
        </div>
        <div className="ml-auto w-full max-w-[340px] text-right">
          <div className="text-[20px] font-black uppercase leading-none text-slate-950">
            DELIVERY CHALLAN: {form.invoiceNo || '---'}
          </div>
          <div className="mt-[4px] text-[14px] font-black leading-none text-slate-950">
            Date: {form.date || '--/--/----'}
          </div>
          <div className="mt-[4px] w-full space-y-[3px]">
            <div className="text-[14px] font-black italic leading-none text-slate-950">
              Purchase Order: {form.purchaseOrder || '____________'}
            </div>
            <div className="text-[14px] font-black italic leading-none text-slate-950">
              Quotation No: {form.quotationNo || '____________'}
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative mt-7 flex flex-1 flex-col overflow-hidden rounded-[34px] border-2 border-violet-600 bg-white px-4 pb-5 pt-8 sm:px-5"
        style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.08]">
          <Image
            src={CLASSIC_LOGO_SRC}
            alt=""
            width={900}
            height={360}
            className="h-auto w-[76%] max-w-[500px]"
          />
        </div>
        <div className="absolute left-6 top-0 h-6 w-[42%] -translate-y-1/2 rounded-[18px] border-2 border-violet-600 bg-white" />

        <div className="relative flex h-full flex-1 flex-col">
          <div className="flex max-w-[460px] flex-col text-[12px] leading-snug text-slate-900">
              {customerRows.map(([label, value], index) => (
                <div key={`${label || 'customer'}-${index}`} className="min-w-0 break-words">
                  {label ? `${label} ${value || '________________'}` : value || '________________'}
                </div>
              ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-[20px] border-2 border-slate-950 bg-white">
            <table className="w-full table-fixed border-collapse text-slate-950">
              <thead>
                <tr className="border-b-2 border-slate-950">
                  <th className="w-[10%] border-r-2 border-slate-950 px-2 py-2 text-center text-[12px] font-semibold">
                    S.No
                  </th>
                  <th className="w-[48%] border-r-2 border-slate-950 px-2 py-2 text-center text-[12px] font-semibold">
                    Particulars
                  </th>
                  <th className="w-[24%] border-r-2 border-slate-950 px-2 py-2 text-center text-[12px] font-semibold">
                    Remarks
                  </th>
                  <th className="w-[18%] px-2 py-2 text-center text-[12px] font-semibold">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="min-h-24 align-top [&:not(:last-child)]:border-b-2 [&:not(:last-child)]:border-slate-950"
                  >
                    <td className="border-r-2 border-slate-950 px-3 py-6 text-center text-sm">
                      {index + 1}
                    </td>
                    <td className="whitespace-pre-wrap border-r-2 border-slate-950 px-3 py-6 text-[13px] leading-snug">
                      {item.description || item.productName || 'Item particulars'}
                    </td>
                    <td className="border-r-2 border-slate-950 px-3 py-6 text-[13px] leading-snug">
                      {item.remarks}
                    </td>
                    <td className="p-0 text-[13px]">
                      <div className="grid h-full min-h-[96px] grid-rows-2">
                        {[
                          ['UOM', item.uom || 'PCS'],
                          ['QTY', String(item.quantity || '')],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="grid grid-cols-[46px_1fr] border-b-2 border-slate-950 last:border-b-0"
                          >
                            <div className="flex items-center border-r-2 border-slate-950 px-1 font-semibold">
                              {label}
                            </div>
                            <div className="flex items-center justify-center px-1 text-center">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 text-[14px] text-slate-950">From Classic Electronics</div>
          <div className="mt-16 max-w-xs">
            <div className="text-[20px] italic text-sky-700 sm:text-[22px]">
              {form.directorName || 'M Fawad Younas'}
            </div>
            <div className="mt-2 w-28 border-t border-slate-400 pt-1 text-[12px] font-semibold text-slate-900">
              Director
            </div>
          </div>

          <div className="absolute bottom-[30px] left-0 right-0 text-center text-[14px] font-black italic leading-none text-violet-700 drop-shadow-[1px_1px_1px_rgba(15,23,42,0.22)]">
            {form.thankYouNote || 'THANK YOU FOR YOUR BUSINESS!'}
          </div>
          <div className="absolute bottom-[10px] left-0 right-0 text-center text-[14px] font-bold leading-none text-black">
            {form.subtitle || 'A wide range of industrial instrument & sensing solutions'}
          </div>

          <div className="flex-1" />
        </div>
      </div>

      <DocumentFooter form={form} className="mt-0" />
    </>
  );
};
