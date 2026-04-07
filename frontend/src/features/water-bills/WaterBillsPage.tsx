import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  Space,
  Table,
  Tag,
  Result,
  message,
} from 'antd'
import { useState } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import { payWaterBill, searchWaterBills } from '@/shared/api/water-bills'
import type { WaterBill } from '@/shared/api/types'
import { CreditCardPaymentForm } from '@/features/payments/components/CreditCardPaymentForm'
import { PortalPageHeader } from '@/shared/components/portal/PortalPageHeader'
import { formatCurrency, formatDate, formatStatus } from '@/shared/lib/format'
import { PortalSurface } from '@/shared/components/portal/PortalSurface'
import { PortalStepper } from '@/shared/components/portal/PortalStepper'

export function WaterBillsPage() {
  const [items, setItems] = useState<WaterBill[]>([])
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedBill, setSelectedBill] = useState<WaterBill | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PortalPageHeader
        eyebrow="Servicios"
        title="Pago de agua"
        description="Encuentra facturas vencidas por medidor, dirección o titular, revisa cada período y completa el pago en una experiencia guiada."
        meta={['Consulta flexible', 'Facturas pendientes', 'Pago con tarjeta']}
      />
      <PortalStepper
        current={currentStep}
        items={[
          { title: 'Consulta' },
          { title: 'Detalle' },
          { title: 'Pago' },
          { title: 'Confirmación' },
        ]}
      />
      {currentStep === 0 ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <PortalSurface
              title="Buscar facturas"
              description="Consulta obligaciones pendientes por medidor, dirección o nombre del titular."
            >
            <Form
              layout="vertical"
              onFinish={async (values: {
                meterNumber?: string
                address?: string
                accountHolderName?: string
              }) => {
                if (!values.meterNumber?.trim() && !values.address?.trim() && !values.accountHolderName?.trim()) {
                  void message.warning('Ingresa al menos un criterio de búsqueda para continuar.')
                  return
                }
                setLoading(true)
                try {
                  const data = await searchWaterBills(values)
                  setItems(data)
                  setSearched(true)
                  setSelectedBill(null)
                } finally {
                  setLoading(false)
                }
              }}
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <Form.Item label="Número de medidor" name="meterNumber">
                  <Input size="large" />
                </Form.Item>
                <Form.Item label="Dirección" name="address">
                  <Input size="large" />
                </Form.Item>
                <Form.Item label="Titular" name="accountHolderName">
                  <Input size="large" />
                </Form.Item>
              </div>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading} size="large" className="!rounded-2xl !px-6 !font-semibold">
                Buscar facturas
              </Button>
            </Form>
            </PortalSurface>
            <PortalSurface
              title="Estado del servicio"
              description="Usa cualquiera de los filtros para localizar la cuenta. Si no hay pendientes, el sistema te lo indicará."
            >
              <div className="grid gap-3">
                {[
                  ['Sin facturas pendientes', 'Cuando no existan pendientes verás un mensaje de cuenta al día.'],
                  ['Consulta flexible', 'Puedes buscar por medidor, dirección o titular sin llenar todos los campos.'],
                  ['Pago seguro', 'El formulario con tarjeta aparece solo cuando eliges una factura concreta.'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                    <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
                  </div>
                ))}
              </div>
            </PortalSurface>
          </div>
          {searched && items.length === 0 ? (
            <PortalSurface title="Sin resultados" description="No se encontraron facturas para los datos ingresados.">
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 py-12">
                <Empty description="No existen registros para los datos ingresados. Intenta con otro criterio." />
              </div>
            </PortalSurface>
          ) : items.length > 0 ? (
            <>
              <Alert type="info" showIcon message="Se encontraron facturas para esta búsqueda." />
              <PortalSurface title="Facturas encontradas" description="Selecciona la factura que deseas revisar antes de pagar.">
                <Table
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  columns={[
                    { title: 'Periodo', dataIndex: 'billingPeriod' },
                    { title: 'Vencimiento', render: (_, record: WaterBill) => formatDate(record.dueDate) },
                    { title: 'Monto', render: (_, record: WaterBill) => formatCurrency(record.amount) },
                    {
                      title: 'Estado',
                      render: (_, record: WaterBill) => (
                        <Tag color={record.status === 'PAID' ? 'green' : 'orange'}>{formatStatus(record.status)}</Tag>
                      ),
                    },
                    {
                      title: 'Detalle',
                      render: (_, record: WaterBill) => (
                        <Button
                          className="!rounded-xl !font-semibold"
                          onClick={() => {
                            setSelectedBill(record)
                            setCurrentStep(1)
                          }}
                        >
                          Revisar
                        </Button>
                      ),
                    },
                  ]}
                  dataSource={items}
                />
              </PortalSurface>
            </>
          ) : null}
        </>
      ) : null}
      {currentStep === 1 && selectedBill ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <PortalSurface
            title="Detalle de factura"
            description="Confirma periodo, vencimiento y monto antes de pasar al pago."
            extra={
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedBill.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {formatStatus(selectedBill.status)}
              </span>
            }
          >
            <div className="grid gap-3">
              {[
                ['Periodo', selectedBill.billingPeriod],
                ['Vencimiento', formatDate(selectedBill.dueDate)],
                ['Monto', formatCurrency(selectedBill.amount)],
                ['Estado', formatStatus(selectedBill.status)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </PortalSurface>
          <PortalSurface
            title="Recomendación"
            description="Verifica que el período corresponda a la cuenta correcta antes de confirmar el cobro."
          >
            <div className="rounded-[24px] bg-[linear-gradient(135deg,#071133,#1696ff)] p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100/80">
                Cobro municipal
              </p>
              <h4 className="mt-3 text-2xl font-black tracking-[-0.04em]">{formatCurrency(selectedBill.amount)}</h4>
              <p className="mt-3 text-sm leading-7 text-sky-50/84">
                Si la factura ya se encuentra pagada, el sistema mostrará la confirmación sin volver a cobrar.
              </p>
            </div>
          </PortalSurface>
          <div className="xl:col-span-2 flex flex-wrap gap-3">
            <Button size="large" className="!rounded-2xl !font-semibold" onClick={() => setCurrentStep(0)}>
              Volver a resultados
            </Button>
            <Button
              type="primary"
              size="large"
              className="!rounded-2xl !px-6 !font-semibold"
              onClick={() => setCurrentStep(selectedBill.status === 'PAID' ? 3 : 2)}
            >
              {selectedBill.status === 'PAID' ? 'Ver confirmación' : 'Continuar al pago'}
            </Button>
          </div>
        </div>
      ) : null}
      {currentStep === 2 && selectedBill ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={`Estás pagando la factura ${selectedBill.id.slice(0, 8).toUpperCase()} por ${formatCurrency(selectedBill.amount)}.`}
          />
          <CreditCardPaymentForm
            amount={Number(selectedBill.amount)}
            concept="factura de agua"
            reference={selectedBill.id.slice(0, 8).toUpperCase()}
            loading={paying}
            submitLabel="Pagar factura"
            showInlineSuccess={false}
            onSubmit={async () => {
              setPaying(true)
              try {
                await payWaterBill(selectedBill.id)
                setItems((current) =>
                  current.map((item) =>
                    item.id === selectedBill.id ? { ...item, status: 'PAID' } : item,
                  ),
                )
                setSelectedBill((current) => (current ? { ...current, status: 'PAID' } : current))
                setCurrentStep(3)
                void message.success('Factura pagada con éxito.')
              } finally {
                setPaying(false)
              }
            }}
          />
          <div>
            <Button size="large" className="!rounded-2xl !font-semibold" onClick={() => setCurrentStep(1)}>
              Volver al detalle
            </Button>
          </div>
        </Space>
      ) : null}
      {currentStep === 3 && selectedBill ? (
        <PortalSurface>
          <Result
            status="success"
            title="Pago completado"
            subTitle={`La factura ${selectedBill.id.slice(0, 8).toUpperCase()} fue pagada correctamente.`}
            extra={[
              <Button key="back" size="large" className="!rounded-2xl !font-semibold" onClick={() => setCurrentStep(0)}>
                Consultar otra cuenta
              </Button>,
            ]}
          />
        </PortalSurface>
      ) : null}
    </Space>
  )
}
