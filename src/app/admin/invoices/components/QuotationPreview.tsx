import Image from 'next/image';
import { Mail } from 'lucide-react';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import type { InvoiceForm, InvoiceItem } from '../types';
import { createInvoiceItem, formatCurrency, getPictureSource } from '../utils';

type QuotationPreviewProps = {
  form: InvoiceForm;
  items: InvoiceItem[];
  totalAmount: number;
};

export const QuotationPreview = ({
  form,
  items,
  totalAmount,
}: QuotationPreviewProps) => {
  const taxAmount = totalAmount * 0.18;
  const grandTotal = totalAmount + taxAmount;

  const quotationItems =
    items.length > 0 ? items : [createInvoiceItem()];
  const quotationRowHeight =
    quotationItems.length <= 2 ? 150 : quotationItems.length <= 4 ? 112 : 82;
  const tableTop = 260;
  const tableHeight = 48 + quotationRowHeight * quotationItems.length;
  const noteTop = tableTop + tableHeight + 10;
  const detailsTop = noteTop + 22;
  const signatureTop = Math.min(detailsTop + 170, 815);

  return (
    <div className="quotation-a4 relative mx-auto h-[1123px] w-[794px] overflow-hidden bg-white text-black">

      {/* HEADER */}

      <div className="absolute left-[10px] top-[8px]">
        <Image
          src={CLASSIC_LOGO_SRC}
          alt="Classic Electronics"
          width={300}
          height={120}
          className="h-auto w-[285px]"
          priority
        />
      </div>

      <div className="absolute right-[22px] top-[10px] text-right font-black">
        <div className="text-[34px] leading-none">
          Quotation:{form.invoiceNo || '0050'}
        </div>

        <div className="mt-[4px] text-[22px] leading-none">
          Date: {form.date || '01/04/2026'}
        </div>

        <div className="mt-[10px] text-[22px] italic leading-none">
          Indent No:
        </div>

        <div className="mt-[6px] text-[22px] italic leading-none">
          Enquiry No:
        </div>
      </div>

      {/* MAIN BORDER */}

      <div className="absolute left-[4px] top-[160px] h-[786px] w-[786px] rounded-[22px] border-[3px] border-violet-600 bg-white" />

      {/* WATERMARK */}

      <div className="pointer-events-none absolute left-[118px] top-[385px] opacity-[0.14]">
        <Image
          src={CLASSIC_LOGO_SRC}
          alt=""
          width={500}
          height={200}
          className="h-auto w-[470px]"
        />
      </div>

      {/* CUSTOMER */}

      <div className="absolute left-[32px] top-[170px] text-[15px] leading-[18px]">
        <div>Manage Purchase;</div>

        <div>
          {form.companyName || 'Fecto Cement Ltd'}
        </div>

        <div>
          {form.location || 'Rawalpindi'}:
        </div>
      </div>

      {/* REF */}

      <div className="absolute left-[30px] top-[230px] text-[14px] font-bold italic">
        Reference to your quotation the details is as below.
      </div>

      {/* TABLE */}

      <div
        className="absolute left-[30px] w-[710px] border-[2px] border-black bg-white text-[14px]"
        style={{ top: tableTop }}
      >

        {/* HEADER */}

        <div className="grid h-[48px] grid-cols-[38px_270px_285px_117px] border-b-[2px] border-black text-center">

          <div className="row-span-2 flex items-center justify-center border-r-[2px] border-black">
            Sr
          </div>

          <div className="border-r-[2px] border-black">
            <div>DESCRIPTION</div>

            <div className="grid grid-cols-3 border-t-[2px] border-black">
              <div className="border-r-[2px] border-black">
                UOM
              </div>

              <div className="border-r-[2px] border-black">
                QTY
              </div>

              <div>Unit Price</div>
            </div>
          </div>

          <div className="flex items-center justify-center border-r-[2px] border-black">
            Remarks/Picture
          </div>

          <div className="flex items-center justify-center">
            Total
          </div>
        </div>

        {/* ROWS */}

        {quotationItems.map((item, index) => {
          const itemTotal =
            Number(item.quantity || 0) *
            Number(item.unitPrice || 0);

          return (
            <div
              key={item.id}
              className="grid grid-cols-[38px_270px_285px_117px] border-b-[2px] border-black last:border-b-0"
              style={{ height: quotationRowHeight }}
            >

              {/* SR */}

              <div className="flex items-center justify-center border-r-[2px] border-black">
                {index + 1}
              </div>

              {/* DESCRIPTION */}

              <div className="grid grid-rows-[1fr_30px] border-r-[2px] border-black">

                <div className="px-3 py-4 text-[14px]">
                  {item.description ||
                    item.productName ||
                    ''}
                </div>

                <div className="grid grid-cols-3 border-t-[2px] border-black text-center text-[15px] italic">

                  <div className="border-r-[2px] border-black">
                    {item.uom || 'NOS'}
                  </div>

                  <div className="border-r-[2px] border-black bg-sky-100">
                    {item.quantity || 2}
                  </div>

                  <div>
                    {item.unitPrice || 100}
                  </div>
                </div>
              </div>

              {/* REMARKS */}

              <div className="border-r-[2px] border-black px-3 py-3">
                <div className="flex h-full flex-col items-center gap-2">
                  <div className="w-full text-left">
                    {item.remarks || item.productName || ''}
                  </div>
                  {item.showPicture && getPictureSource(item.picture) ? (
                    <div className="mt-1 flex h-[70px] w-[110px] items-center justify-center overflow-hidden border border-slate-300 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getPictureSource(item.picture)}
                        alt={item.productName || item.description || 'Quotation item'}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* TOTAL */}

              <div className="flex items-center justify-center text-[16px] font-bold italic">
                {Math.round(itemTotal || 200)} Rs
              </div>
            </div>
          );
        })}
      </div>

      {/* NOTE */}

      <div
        className="absolute left-[30px] text-[10px] italic"
        style={{ top: noteTop }}
      >
        If you have any questions concerning this quotation please tell us.
      </div>

      {/* DELIVERY */}

      <div
        className="absolute left-[28px] grid grid-cols-[150px_130px] text-[16px] font-bold italic leading-[30px]"
        style={{ top: detailsTop }}
      >

        <div>Delivery Period:</div>

        <div className="border-[2px] border-black bg-pink-100 text-center font-normal">
          {form.deliveryPeriod || '4 Weeks'}
        </div>

        <div>Validity Date:</div>

        <div className="border-x-[2px] border-b-[2px] border-black bg-pink-100 text-center font-normal">
          1 WEEK
        </div>
      </div>

      {/* TOTALS */}

      <div
        className="absolute right-[42px] grid grid-cols-[85px_170px] items-center text-[16px] font-bold italic leading-[31px]"
        style={{ top: detailsTop - 7 }}
      >

        <div>Sub Total</div>

        <div className="border-[2px] border-black text-center font-normal">
          {formatCurrency(totalAmount || 200)}
        </div>

        <div>Tax</div>

        <div className="border-x-[2px] border-b-[2px] border-black text-center font-normal">
          18%
        </div>

        <div>Total</div>

        <div className="border-x-[2px] border-b-[2px] border-black text-center font-normal">
          {formatCurrency(taxAmount || 36)}
        </div>

        <div>Total as</div>

        <div className="border-x-[2px] border-b-[2px] border-black text-center font-normal">
          {formatCurrency(grandTotal || 236)}
        </div>
      </div>

      {/* SIGN */}

      <div
        className="absolute left-[18px] w-[190px]"
        style={{ top: signatureTop }}
      >

        <Image
          src="/quotation-stamp-signature.png"
          alt=""
          width={220}
          height={132}
          className="h-auto w-[160px]"
        />

      </div>

      {/* FOOTER */}

      <div className="absolute bottom-[28px] left-[24px] right-[24px] text-center">
        <div className="text-[16px] font-bold italic text-violet-700">
          THANK YOU FOR YOUR BUSINESS!
        </div>

        <div className="mt-[2px] text-[10px] font-bold">
          A wide range of industrial instrument & sensing solutions
        </div>

        <div className="mt-[8px] grid grid-cols-3 items-start gap-[18px] text-[10px] leading-[13px]">
          <div className="flex flex-col items-center">
            <Image
              src="/quotation-globe.png"
              alt=""
              width={38}
              height={38}
              className="mb-[3px] h-auto w-[30px]"
            />
            <div className="font-bold">
              {form.website ||
                'www.classicelectronics.com.pk'}
            </div>
            <div>
              {form.address ||
                '133 G St # 109 Sector G 11/3 Islamabad'}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-[9px] flex h-[27px] w-[27px] items-center justify-center rounded-full border border-violet-500 text-violet-700">
              <Mail size={15} strokeWidth={2.4} />
            </div>
            <div className="font-bold">
              NTN: 1700506
            </div>
            <div className="font-bold">
              GST: 05-07-8500-014-73
            </div>
            <div>
              {form.email ||
                'sales@classicelectronics.com.pk'}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Image
              src="/quotation-whatsapp.png"
              alt=""
              width={34}
              height={34}
              className="mb-[4px] h-auto w-[27px]"
            />
            <div className="font-bold">
              {form.phonePrimary ||
                '+92 3 111 777 510'}
            </div>
            <div>
              {form.phoneSecondary ||
                '+92 321 5180308'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
