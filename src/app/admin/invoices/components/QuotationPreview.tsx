import Image from 'next/image';
import { CLASSIC_LOGO_SRC } from '@/lib/brandAssets';
import type { InvoiceForm, InvoiceItem } from '../types';
import { createInvoiceItem, formatCurrency, getPictureSource } from '../utils';

type QuotationPreviewProps = {
  form: InvoiceForm;
  items: InvoiceItem[];
  totalAmount: number;
};

const estimateWrappedRows = (value: string, charactersPerLine: number) => {
  const lines = value.trim().split(/\r?\n/);
  const rowCount = lines.reduce((count, line) => {
    if (!line.trim()) return count + 1;

    const sentenceRows = Math.ceil(line.length / charactersPerLine);
    const longWordRows = line
      .trim()
      .split(/\s+/)
      .reduce((maxRows, word) => Math.max(maxRows, Math.ceil(word.length / charactersPerLine)), 1);

    return count + Math.max(sentenceRows, longWordRows, 1);
  }, 0);

  return Math.max(1, rowCount);
};

export const QuotationPreview = ({ form, items, totalAmount }: QuotationPreviewProps) => {
  const taxAmount = totalAmount * 0.18;
  const grandTotal = totalAmount + taxAmount;
  const quotationItems = items.length > 0 ? items : [createInvoiceItem()];

  const showItemImage = (item: InvoiceItem) => {
    const hasImage = Boolean(getPictureSource(item.picture));
    return hasImage && (item as any).showPicture !== false;
  };

  const baseRowHeight =
    quotationItems.length <= 1 ? 150 : quotationItems.length === 2 ? 210 : 165;
  const rowHeights = quotationItems.map((item) => {
    const descriptionRows = estimateWrappedRows(item.description || item.productName || '', 24);
    const remarksRows = estimateWrappedRows(item.remarks || item.productName || '', 27);
    const imageHeight = showItemImage(item) ? 104 : 0;
    const descriptionHeight = descriptionRows * 22 + 74;
    const remarksHeight = remarksRows * 22 + imageHeight + 50;

    return Math.max(baseRowHeight, descriptionHeight, remarksHeight);
  });

  const tableTop = 260;
  const tableHeaderHeight = 48;
  const tableHeight =
    tableHeaderHeight + rowHeights.reduce((height, itemRowHeight) => height + itemRowHeight, 0);
  const tableBottomGap = 26;
  const noteTop = tableTop + tableHeight + tableBottomGap;
  const detailsTop = noteTop + 28;

  return (
    <div className="quotation-a4 relative mx-auto h-[1123px] w-[794px] overflow-hidden bg-white text-black">
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
        <div className="text-[34px] leading-none">Quotation:{form.invoiceNo || '0050'}</div>
        <div className="mt-[4px] text-[22px] leading-none">
          Date: {form.date || '01/04/2026'}
        </div>
        <div className="mt-[10px] text-[22px] italic leading-none">
          Indent No: {form.purchaseOrder || ''}
        </div>
        <div className="mt-[6px] text-[22px] italic leading-none">
          Enquiry No: {form.quotationNo || ''}
        </div>
      </div>

      <div className="absolute left-[4px] top-[145px] h-[801px] w-[786px] rounded-[22px] border-[3px] border-violet-600 bg-white" />

      <div className="absolute left-[285px] top-[145px] h-[28px] w-[485px] rounded-br-[18px] border-b-[3px] border-r-[3px] border-violet-600 bg-white" />

      <div className="pointer-events-none absolute left-[118px] top-[385px] opacity-[0.14]">
        <Image
          src={CLASSIC_LOGO_SRC}
          alt=""
          width={500}
          height={200}
          className="h-auto w-[470px]"
        />
      </div>

      <div className="absolute left-[32px] top-[170px] text-[15px] leading-[18px]">
        <div>Manage Purchase;</div>
        <div>{form.companyName || 'Fecto Cement Ltd'}</div>
        <div>{form.location || 'Rawalpindi'}:</div>
      </div>

      <div className="absolute left-[30px] top-[230px] text-[14px] font-bold italic">
        Reference to your quotation the details is as below.
      </div>

      <div
        className="absolute left-[30px] w-[710px] border-[2px] border-black bg-white text-[14px]"
        style={{ top: tableTop }}
      >
        <div className="grid h-[48px] grid-cols-[38px_270px_285px_117px] border-b-[2px] border-black text-center">
          <div className="flex items-center justify-center border-r-[2px] border-black">
            Sr
          </div>

          <div className="border-r-[2px] border-black">
            <div className="h-[24px] leading-[24px]">DESCRIPTION</div>
            <div className="grid h-[24px] grid-cols-3 border-t-[2px] border-black leading-[24px]">
              <div className="border-r-[2px] border-black">UOM</div>
              <div className="border-r-[2px] border-black">QTY</div>
              <div>Unit Price</div>
            </div>
          </div>

          <div className="flex items-center justify-center border-r-[2px] border-black">
            Remarks/Picture
          </div>

          <div className="flex items-center justify-center">Total</div>
        </div>

        {quotationItems.map((item, index) => {
          const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
          const imageSrc = getPictureSource(item.picture);
          const rowHeight = rowHeights[index];

          return (
            <div
              key={item.id}
              className="grid min-w-0 grid-cols-[38px_270px_285px_117px] overflow-hidden border-b-[2px] border-black last:border-b-0"
              style={{ minHeight: rowHeight }}
            >
              <div className="flex items-center justify-center border-r-[2px] border-black">
                {index + 1}
              </div>

              <div className="grid min-w-0 grid-rows-[1fr_30px] border-r-[2px] border-black">
                <div
                  className="min-h-0 overflow-hidden px-3 py-4 text-[14px] leading-[21px]"
                  style={{
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.description || item.productName || ''}
                </div>

                <div className="grid min-w-0 grid-cols-[90px_90px_90px] overflow-hidden border-t-[2px] border-black text-center text-[15px] italic leading-[30px]">
                  <div
                    className="min-w-0 overflow-hidden truncate border-r-[2px] border-black px-1"
                    title={item.uom || 'NOS'}
                  >
                    {item.uom || 'NOS'}
                  </div>

                  <div
                    className="min-w-0 overflow-hidden truncate border-r-[2px] border-black bg-sky-100 px-1"
                    title={String(item.quantity || 0)}
                  >
                    {item.quantity || 0}
                  </div>

                  <div
                    className="min-w-0 overflow-hidden truncate px-1"
                    title={formatCurrency(item.unitPrice || 0)}
                  >
                    {formatCurrency(item.unitPrice || 0)}
                  </div>
                </div>
              </div>

              <div className="min-w-0 overflow-hidden border-r-[2px] border-black px-3 py-3">
                <div className="flex h-full min-w-0 flex-col items-center gap-2 overflow-hidden">
                  <div
                    className="w-full min-w-0 whitespace-pre-wrap break-words text-left text-[14px] leading-[21px]"
                    style={{
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.remarks || item.productName || ''}
                  </div>

                  {showItemImage(item) && imageSrc ? (
                    <div className="mt-auto flex h-[88px] w-full shrink-0 items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt={item.productName || item.description || 'Item image'}
                        className="max-h-[88px] max-w-[170px] object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-center overflow-hidden px-2 text-center text-[17px] font-bold italic">
                {formatCurrency(itemTotal)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute left-[30px] text-[10px] italic" style={{ top: noteTop }}>
        If you have any questions concerning this quotation please tell us.
      </div>

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

      <div
        className="absolute right-[42px] grid grid-cols-[85px_170px] items-center text-[16px] font-bold italic leading-[31px]"
        style={{ top: detailsTop - 7 }}
      >
        <div>Sub Total</div>
        <div className="border-[2px] border-black text-center font-normal">
          {formatCurrency(totalAmount)}
        </div>

        <div>Tax</div>
        <div className="border-x-[2px] border-b-[2px] border-black text-center font-normal">
          18%
        </div>

        <div>Total</div>
        <div className="border-x-[2px] border-b-[2px] border-black text-center font-normal">
          {formatCurrency(taxAmount)}
        </div>

        <div>Total as</div>
        <div className="border-x-[2px] border-b-[2px] border-black text-center font-normal">
          {formatCurrency(grandTotal)}
        </div>
      </div>

      <div className="absolute left-[18px] top-[760px] w-[160px]">
        <Image
          src="/quotation-stamp.png"
          alt=""
          width={120}
          height={100}
          className="ml-8 h-auto w-[90px]"
        />

        <div className="mt-[-8px] text-center text-[16px] font-bold italic text-sky-900">
          {form.directorName || 'M Fawad Younas'}
        </div>

        <div className="text-[15px]">Director</div>
      </div>

      <div className="absolute bottom-[24px] left-[10px]">
        <Image
          src="/quotation-globe.png"
          alt=""
          width={90}
          height={90}
          className="h-auto w-[78px]"
        />
      </div>

      <div className="absolute bottom-[45px] left-0 right-0 text-center">
        <div className="text-[17px] font-bold italic text-violet-700">
          THANK YOU FOR YOUR BUSINESS!
        </div>
        <div className="mt-[4px] text-[10px] font-bold">
          A wide range of industrial instrument & sensing solutions
        </div>
      </div>

      <div className="absolute bottom-[8px] left-[90px] w-[190px] text-center text-[11px] leading-[14px]">
        <div>{form.website || 'www.classicelectronics.com.pk'}</div>
        <div>{form.address || '133 G St # 109 Sector G 11/3 Islamabad'}</div>
      </div>

      <div className="absolute bottom-[8px] left-[302px] w-[210px] text-center text-[11px] leading-[14px]">
        <div className="font-bold">NTN: 1700506</div>
        <div className="font-bold">GST: 05-07-8500-014-73</div>
        <div>{form.email || 'sales@classicelectronics.com.pk'}</div>
      </div>

      <div className="absolute bottom-[18px] right-[82px]">
        <Image
          src="/quotation-whatsapp.png"
          alt=""
          width={60}
          height={60}
          className="h-auto w-[54px]"
        />
      </div>

      <div className="absolute bottom-[12px] right-[8px] text-right text-[12px] leading-[15px]">
        <div>{form.phonePrimary || '+92 3 111 777 510'}</div>
        <div>{form.phoneSecondary || '+92 321 5180308'}</div>
      </div>
    </div>
  );
};
