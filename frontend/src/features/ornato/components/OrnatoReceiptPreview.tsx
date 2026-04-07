import { useEffect, useState } from 'react'
import { Button } from 'antd'
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons'
import type { OrnatoReceiptDocument } from '@/shared/api/types'

type OrnatoReceiptPreviewProps = {
  receipt: OrnatoReceiptDocument
  onDownload: () => void
}

export function OrnatoReceiptPreview({ receipt, onDownload }: OrnatoReceiptPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const pdfBinary = window.atob(receipt.pdfBase64)
    const bytes = Uint8Array.from(pdfBinary, (character) => character.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const objectUrl = window.URL.createObjectURL(blob)
    setPreviewUrl(objectUrl)

    return () => {
      window.URL.revokeObjectURL(objectUrl)
    }
  }, [receipt.pdfBase64])

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Comprobante generado
          </p>
          <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950">
            Previsualización del boleto pagado
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Este es tu comprobante oficial de pago del boleto de ornato. Descárgalo para conservarlo como respaldo de tu transacción.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<DownloadOutlined />}
          className="!rounded-2xl !px-6 !font-semibold"
          onClick={onDownload}
        >
          Descargar PDF
        </Button>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-300 bg-[#eef2fb] p-3 shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:p-4">
        <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
          {previewUrl ? (
            <iframe
              title="Vista previa del comprobante de ornato"
              src={previewUrl}
              className="h-[36rem] w-full bg-white sm:h-[52rem]"
            />
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-[22px] border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <FilePdfOutlined />
        <span>
          Archivo listo para descarga como <strong>{receipt.fileName}</strong>
        </span>
      </div>
    </div>
  )
}
