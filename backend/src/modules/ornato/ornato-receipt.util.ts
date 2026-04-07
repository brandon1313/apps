import { PaymentEntity } from '@/modules/payments/entities/payment.entity'
import { OrnatoTicketEntity } from './entities/ornato-ticket.entity'

export type OrnatoReceiptPreview = {
  municipality: string
  jurisdictionCode: string
  comptroller: string
  formTitle: string
  receiptLabel: string
  receiptNumber: string
  issuedDate: string
  issuedTime: string
  vin: string
  nit: string
  payerName: string
  domicile: string
  concept: string
  accountEntries: Array<{ label: string; amount: string }>
  total: string
  totalInWords: string
  paymentMethod: string
  cashierFooter: string
  legalReference: string
}

export type OrnatoReceiptDocument = {
  fileName: string
  pdfBase64: string
  preview: OrnatoReceiptPreview
}

export function createOrnatoReceiptDocument(
  ticket: OrnatoTicketEntity,
  payment: PaymentEntity,
): OrnatoReceiptDocument {
  const issuedAt = payment.processedAt ?? payment.createdAt
  const receiptNumber = payment.reference.replace('MUNI-', 'D-').slice(0, 14)
  const preview: OrnatoReceiptPreview = {
    municipality: 'MUNICIPALIDAD DE SAN JUAN SACATEPEQUEZ, GUATEMALA',
    jurisdictionCode: 'CODIGO JURISDICCIONAL SJ-01',
    comptroller: 'CONTRALORIA GENERAL DE CUENTAS',
    formTitle: 'FORMA 7-B INGRESOS VARIOS',
    receiptLabel: 'RECIBO ORIGINAL',
    receiptNumber,
    issuedDate: formatReceiptDate(issuedAt),
    issuedTime: formatReceiptTime(issuedAt),
    vin: payment.reference.slice(-6),
    nit: ticket.dpi,
    payerName: ticket.name.toUpperCase(),
    domicile: 'SAN JUAN SACATEPEQUEZ, GUATEMALA',
    concept: 'Boleto de Ornato',
    accountEntries: [
      {
        label: `BOLETO DE ORNATO ${issuedAt.getFullYear()}`,
        amount: formatAmount(ticket.amount),
      },
    ],
    total: formatAmount(ticket.amount),
    totalInWords: `${amountToSpanishWords(Number(ticket.amount))} CON ${formatCents(ticket.amount)}/100`,
    paymentMethod: 'TARJETA AUTORIZADA',
    cashierFooter: 'FIRMA Y SELLO DE CAJERO  AG. 009  CAJA 01  USUARIO  SIS_INT_VISA',
    legalReference:
      'AUTORIZADO SEGUN RESOLUCION DE LA CONTRALORIA GENERAL DE CUENTAS. DOCUMENTO SIMULADO PARA PREVISUALIZACION Y PRUEBAS DEL PORTAL MUNICIPAL.',
  }

  const pdfLines = buildPdfLines(preview)
  const pdfBuffer = createPlainTextPdf(pdfLines)

  return {
    fileName: `boleto-ornato-${ticket.id.slice(0, 8).toLowerCase()}.pdf`,
    pdfBase64: pdfBuffer.toString('base64'),
    preview,
  }
}

function buildPdfLines(preview: OrnatoReceiptPreview): string[] {
  const lines = [
    preview.municipality,
    preview.jurisdictionCode,
    preview.comptroller,
    preview.formTitle,
    '',
    `${padRight('RECIBO DE TESORERIA No:', 30)} ${preview.receiptNumber}`,
    `${padRight('', 30)} ${preview.issuedDate}    ${preview.issuedTime}`,
    `${padRight('VIN:', 30)} ${preview.vin}`,
    `${padRight('NIT:', 30)} ${preview.nit}`,
    '',
    `NOMBRE: ${preview.payerName}`,
    `DOMICILIO: ${preview.domicile}`,
    '',
    `CONCEPTO: ${preview.concept.toUpperCase()}`,
    '          BOLETO DE ORNATO',
    '',
    'CUENTA',
    ...preview.accountEntries.map((entry) => `${padRight(entry.label, 42)} ${entry.amount}`),
    `${padRight('TOTAL:', 42)} ${preview.total}`,
    '',
    'TOTAL EN LETRAS',
    preview.totalInWords,
    '',
    preview.paymentMethod,
    '',
    preview.cashierFooter,
    '',
    preview.legalReference,
  ]

  return lines
}

function createPlainTextPdf(lines: string[]): Buffer {
  const escapedLines = lines.map((line) => escapePdfText(line))
  const content = buildPdfContent(escapedLines)

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>\nendobj',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    `7 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream\nendobj`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = [0]

  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += `${object}\n`
  })

  const xrefOffset = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${offsets[index].toString().padStart(10, '0')} 00000 n \n`
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(pdf, 'utf8')
}

function buildPdfContent(lines: string[]): string {
  const commands = [
    '0.1 w',
    '0.7 0.74 0.82 RG',
    '18 18 559 806 re',
    'S',
    'q',
    '0.9 0.92 0.97 rg',
    'BT',
    '/F2 34 Tf',
    '70 460 Td',
    '(NO ES VALIDO) Tj',
    'ET',
    'BT',
    '/F3 18 Tf',
    '122 430 Td',
    '(DOCUMENTO DE PRUEBA) Tj',
    'ET',
    '0.93 0.95 0.99 rg',
    'BT',
    '/F2 22 Tf',
    '92 360 Td',
    '(MUNICIPALIDAD SAN JUAN SACATEPEQUEZ) Tj',
    'ET',
    'Q',
    '0 0 0 rg',
    'BT',
    '/F1 11 Tf',
    '42 800 Td',
    ...lines.flatMap((line, index) => {
      if (index === 0) {
        return [`(${line}) Tj`]
      }

      return ['0 -18 Td', `(${line}) Tj`]
    }),
    'ET',
  ]

  return commands.join('\n')
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function formatReceiptDate(value: Date): string {
  const day = value.getDate().toString().padStart(2, '0')
  const month = (value.getMonth() + 1).toString().padStart(2, '0')
  const year = value.getFullYear()
  return `${day}.${month}.${year}`
}

function formatReceiptTime(value: Date): string {
  return `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}:${value.getSeconds().toString().padStart(2, '0')}`
}

function formatAmount(value: string): string {
  return Number(value).toFixed(2)
}

function formatCents(value: string): string {
  const cents = Math.round((Number(value) % 1) * 100)
  return cents.toString().padStart(2, '0')
}

function padRight(value: string, width: number): string {
  return value.padEnd(width, ' ')
}

function amountToSpanishWords(value: number): string {
  const integerPart = Math.floor(value)

  if (integerPart === 0) {
    return 'CERO'
  }

  return numberToWords(integerPart).trim().toUpperCase()
}

function numberToWords(value: number): string {
  const units = [
    '',
    'uno',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
  ]
  const teens = [
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciseis',
    'diecisiete',
    'dieciocho',
    'diecinueve',
  ]
  const tens = [
    '',
    '',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa',
  ]
  const hundreds = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
  ]

  if (value === 100) {
    return 'cien'
  }

  if (value < 10) {
    return units[value]
  }

  if (value < 20) {
    return teens[value - 10]
  }

  if (value < 30) {
    return value === 20 ? 'veinte' : `veinti${units[value - 20]}`
  }

  if (value < 100) {
    const ten = Math.floor(value / 10)
    const unit = value % 10
    return unit === 0 ? tens[ten] : `${tens[ten]} y ${units[unit]}`
  }

  if (value < 1000) {
    const hundred = Math.floor(value / 100)
    const remainder = value % 100
    return remainder === 0 ? hundreds[hundred] : `${hundreds[hundred]} ${numberToWords(remainder)}`
  }

  if (value < 1_000_000) {
    const thousands = Math.floor(value / 1000)
    const remainder = value % 1000
    const thousandsLabel = thousands === 1 ? 'mil' : `${numberToWords(thousands)} mil`
    return remainder === 0 ? thousandsLabel : `${thousandsLabel} ${numberToWords(remainder)}`
  }

  const millions = Math.floor(value / 1_000_000)
  const remainder = value % 1_000_000
  const millionsLabel = millions === 1 ? 'un millon' : `${numberToWords(millions)} millones`
  return remainder === 0 ? millionsLabel : `${millionsLabel} ${numberToWords(remainder)}`
}
