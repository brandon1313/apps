import type React from 'react'
import { useEffect, useState } from 'react'
import { Alert, Button, Form, Input, Modal, Select, Space, Result, message } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { createOrnatoTicket, fetchOrnatoReceipt, payOrnatoTicket } from '@/shared/api/ornato'
import { CreditCardPaymentForm } from '@/features/payments/components/CreditCardPaymentForm'
import type { OrnatoReceiptDocument, OrnatoTicket } from '@/shared/api/types'
import { PortalPageHeader } from '@/shared/components/portal/PortalPageHeader'
import { formatCurrency, formatStatus } from '@/shared/lib/format'
import { PortalSurface } from '@/shared/components/portal/PortalSurface'
import { PortalStepper } from '@/shared/components/portal/PortalStepper'
import { OrnatoReceiptPreview } from './components/OrnatoReceiptPreview'

type OrnatoFormValues = { name: string; dpi: string; amount: number }

export function OrnatoPage() {
  const [creating, setCreating] = useState(false)
  const [paying, setPaying] = useState(false)
  const [priceModalOpen, setPriceModalOpen] = useState(false)

  const thStyle: React.CSSProperties = {
    padding: '10px 14px', fontWeight: 700, fontSize: 12,
    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b',
    borderBottom: '1px solid #e2e8f0', textAlign: 'left',
  }
  const tdStyle: React.CSSProperties = {
    padding: '10px 14px', fontSize: 14, color: '#1e293b',
    borderBottom: '1px solid #f1f5f9',
  }
  const [pendingValues, setPendingValues] = useState<OrnatoFormValues | null>(null)
  const [ticket, setTicket] = useState<OrnatoTicket | null>(null)
  const [receipt, setReceipt] = useState<OrnatoReceiptDocument | null>(null)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const loadReceipt = async () => {
      if (!ticket || ticket.status !== 'PAID' || receipt) {
        return
      }

      try {
        const nextReceipt = await fetchOrnatoReceipt(ticket.id)
        setReceipt(nextReceipt)
      } catch {
        void message.warning('No fue posible recuperar el comprobante del boleto.')
      }
    }

    void loadReceipt()
  }, [receipt, ticket])

  const downloadReceipt = () => {
    if (!receipt) {
      return
    }

    const pdfBinary = window.atob(receipt.pdfBase64)
    const bytes = Uint8Array.from(pdfBinary, (character) => character.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const objectUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = receipt.fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(objectUrl)
  }

  const handleContinueToPayment = async () => {
    if (!pendingValues) return
    setCreating(true)
    try {
      const createdTicket = await createOrnatoTicket(pendingValues)
      setTicket(createdTicket)
      setReceipt(null)
      setResultMessage(null)
      setCurrentStep(2)
      void message.success('Boleto generado. Completa el pago para finalizar.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PortalPageHeader
        eyebrow="Tributos"
        title="Pago de boleto de ornato"
        description="Registra los datos del contribuyente, genera el boleto y completa el pago desde un flujo más claro y confiable."
        meta={['Generación de boleto', 'Resumen del contribuyente', 'Pago con tarjeta']}
      />
      <PortalStepper
        current={currentStep}
        items={[
          { title: 'Datos del boleto' },
          { title: 'Revisión' },
          { title: 'Pago' },
          { title: 'Confirmación' },
        ]}
      />
      {resultMessage ? <Alert type="success" message={resultMessage} showIcon /> : null}
      {currentStep === 0 ? (
        <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <PortalSurface
            title="Datos del contribuyente"
            description="Completa la información básica para generar el boleto de ornato."
          >
          <Form
            layout="vertical"
            requiredMark={false}
            onFinish={(values: OrnatoFormValues) => {
              setPendingValues(values)
              setCurrentStep(1)
            }}
          >
            <Form.Item label="Nombre" name="name" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item label="DPI" name="dpi" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Monto
                  <button
                    type="button"
                    onClick={() => setPriceModalOpen(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 18, height: 18, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: '#f1f5f9', color: '#64748b', padding: 0,
                    }}
                    aria-label="Ver tabla de precios"
                  >
                    <QuestionCircleOutlined style={{ fontSize: 12 }} />
                  </button>
                </span>
              }
              name="amount"
              rules={[{ required: true, message: 'Selecciona el monto correspondiente.' }]}
            >
              <Select
                size="large"
                placeholder="Selecciona según tu sueldo mensual"
                options={[
                  { value: 10,  label: 'Q10.00 — Sueldo de Q501.01 a Q1,000.00' },
                  { value: 15,  label: 'Q15.00 — Sueldo de Q1,000.01 a Q3,000.00' },
                  { value: 50,  label: 'Q50.00 — Sueldo de Q3,000.01 a Q6,000.00' },
                  { value: 75,  label: 'Q75.00 — Sueldo de Q6,000.01 a Q9,000.00' },
                  { value: 100, label: 'Q100.00 — Sueldo de Q9,000.01 a Q12,000.00' },
                  { value: 150, label: 'Q150.00 — Sueldo de Q12,000.01 en adelante' },
                ]}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" className="!rounded-2xl !px-6 !font-semibold">
              Revisar datos
            </Button>
          </Form>
          </PortalSurface>
          <PortalSurface
            title="Antes de continuar"
            description="El boleto se genera solo después de que el ciudadano revisa y confirma los datos."
          >
            <div className="grid gap-3">
              {[
                ['Validación previa', 'Confirma nombre, DPI y monto antes de crear el boleto.'],
                ['Revisión clara', 'Antes del pago verás un resumen para evitar errores.'],
                ['Pago seguro', 'El formulario de tarjeta aparece en una etapa independiente.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </PortalSurface>
        </div>
      ) : null}
      {currentStep === 1 && pendingValues ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <PortalSurface
            title="Resumen del boleto"
            description="Verifica la información antes de generar el boleto y proceder con el pago."
          >
            <div className="grid gap-3">
              {[
                ['Contribuyente', pendingValues.name],
                ['DPI', pendingValues.dpi],
                ['Monto', formatCurrency(pendingValues.amount)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </PortalSurface>
          <PortalSurface
            title="Resumen del cobro"
            description="Verifica el monto y los datos del contribuyente antes de proceder al pago."
          >
            <div className="rounded-[24px] bg-[linear-gradient(135deg,#071133,#1696ff)] p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100/80">
                Boleto municipal
              </p>
              <h4 className="mt-3 text-2xl font-black tracking-[-0.04em]">{formatCurrency(pendingValues.amount)}</h4>
              <p className="mt-3 text-sm leading-7 text-sky-50/84">
                Revisa que los datos del contribuyente sean correctos antes de avanzar al formulario de pago.
              </p>
            </div>
          </PortalSurface>
          <div className="xl:col-span-2 flex flex-wrap gap-3">
            <Button size="large" className="!rounded-2xl !font-semibold" onClick={() => setCurrentStep(0)}>
              Editar datos
            </Button>
            <Button
              type="primary"
              size="large"
              className="!rounded-2xl !px-6 !font-semibold"
              loading={creating}
              onClick={() => { void handleContinueToPayment() }}
            >
              Continuar al pago
            </Button>
          </div>
        </div>
      ) : null}
      {currentStep === 2 && ticket ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={`Estás pagando el boleto ${ticket.id.slice(0, 8).toUpperCase()} por ${formatCurrency(ticket.amount)}.`}
          />
          <CreditCardPaymentForm
            amount={Number(ticket.amount)}
            concept="boleto de ornato"
            payerName={ticket.name}
            reference={ticket.id.slice(0, 8).toUpperCase()}
            loading={paying}
            submitLabel="Pagar boleto"
            showInlineSuccess={false}
            onSubmit={async () => {
              setPaying(true)
              try {
                const paymentResult = await payOrnatoTicket(ticket.id)
                setTicket(paymentResult.ticket)
                setReceipt(paymentResult.receipt)
                setResultMessage('Boleto de ornato pagado con éxito.')
                setCurrentStep(3)
                void message.success('Pago realizado. El comprobante ya está listo.')
              } finally {
                setPaying(false)
              }
            }}
          />
          <div>
            <Button size="large" className="!rounded-2xl !font-semibold" onClick={() => setCurrentStep(1)}>
              Volver al resumen
            </Button>
          </div>
        </Space>
      ) : null}
      {currentStep === 3 && ticket ? (
        <PortalSurface>
          <div className="grid gap-6">
            <Result
              status="success"
              title="Pago completado"
              subTitle={`El boleto ${ticket.id.slice(0, 8).toUpperCase()} fue pagado correctamente.`}
            />

            {receipt ? <OrnatoReceiptPreview receipt={receipt} onDownload={downloadReceipt} /> : null}

            <div className="flex flex-wrap gap-3">
              {receipt ? (
                <Button
                  type="primary"
                  size="large"
                  className="!rounded-2xl !px-6 !font-semibold"
                  onClick={downloadReceipt}
                >
                  Descargar comprobante
                </Button>
              ) : null}
              <Button
                size="large"
                className="!rounded-2xl !font-semibold"
                onClick={() => {
                  setCurrentStep(0)
                  setPendingValues(null)
                  setTicket(null)
                  setReceipt(null)
                  setResultMessage(null)
                }}
              >
                Generar otro boleto
              </Button>
            </div>
          </div>
        </PortalSurface>
      ) : null}
      <Modal
        title="Sueldos mensuales — tabla de precios"
        open={priceModalOpen}
        onCancel={() => setPriceModalOpen(false)}
        footer={null}
        width={480}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={thStyle}>Sueldo mensual</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Precio</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['De Q501.01 a Q1,000.00',     'Q10.00'],
              ['De Q1,000.01 a Q3,000.00',   'Q15.00'],
              ['De Q3,000.01 a Q6,000.00',   'Q50.00'],
              ['De Q6,000.01 a Q9,000.00',   'Q75.00'],
              ['De Q9,000.01 a Q12,000.00',  'Q100.00'],
              ['De Q12,000.01 en adelante',  'Q150.00'],
            ] as const).map(([range, price]) => (
              <tr key={price}>
                <td style={tdStyle}>{range}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>{price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </Space>
  )
}
