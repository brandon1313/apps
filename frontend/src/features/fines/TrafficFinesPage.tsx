import {
  Alert,
  Button,
  Empty,
  Form,
  Image,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Result,
  message,
} from 'antd'
import { useState } from 'react'
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons'
import { payFine, searchFines } from '@/shared/api/fines'
import type { TrafficFine } from '@/shared/api/types'
import { CreditCardPaymentForm } from '@/features/payments/components/CreditCardPaymentForm'
import { PortalPageHeader } from '@/shared/components/portal/PortalPageHeader'
import { formatCurrency, formatDateTime, formatStatus } from '@/shared/lib/format'
import { PortalSurface } from '@/shared/components/portal/PortalSurface'
import { PortalStepper } from '@/shared/components/portal/PortalStepper'

export function TrafficFinesPage() {
  const [items, setItems] = useState<TrafficFine[]>([])
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedFine, setSelectedFine] = useState<TrafficFine | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PortalPageHeader
        eyebrow="Pago guiado"
        title="Consulta y pago de multas"
        description="Busca infracciones por placa, revisa los detalles registrados y completa el pago con una experiencia segura."
        meta={['Búsqueda por placa', 'Evidencia visible', 'Pago con tarjeta']}
      />
      <PortalStepper
        current={currentStep}
        items={[
          { title: 'Búsqueda' },
          { title: 'Detalle' },
          { title: 'Pago' },
          { title: 'Confirmación' },
        ]}
      />
      {currentStep === 0 ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <PortalSurface
              title="Buscar por placa"
              description="Ingresa la información del vehículo para localizar infracciones registradas."
            >
            <Form
              layout="vertical"
              onFinish={async (values: { plateType: 'M' | 'P' | 'C'; plateNumber: string }) => {
                setLoading(true)
                try {
                  const data = await searchFines(values)
                  setItems(data)
                  setSearched(true)
                  setSelectedFine(null)
                } finally {
                  setLoading(false)
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-[170px_minmax(0,1fr)_auto] md:items-end">
                <Form.Item label="Tipo de placa" name="plateType" rules={[{ required: true }]}>
                  <Select size="large" options={[
                    { value: 'M', label: 'M – Motocicleta' },
                    { value: 'P', label: 'P – Particular' },
                    { value: 'C', label: 'C – Comercial' },
                  ]} />
                </Form.Item>
                <Form.Item label="Número de placa" name="plateNumber" rules={[{ required: true }]}>
                  <Input size="large" placeholder="556FQS" />
                </Form.Item>
                <Form.Item label=" " colon={false}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    loading={loading}
                    size="large"
                    block
                    className="!rounded-2xl !font-semibold"
                  >
                    Buscar multa
                  </Button>
                </Form.Item>
              </div>
            </Form>
            </PortalSurface>

            <PortalSurface
              title="Indicaciones"
              description="Consulta primero el detalle antes de pasar al pago para validar motivo, fecha y evidencia."
            >
              <div className="grid gap-3">
                {[
                  ['1', 'Ingresa placa', 'Busca por tipo y número exacto del vehículo.'],
                  ['2', 'Revisa evidencia', 'Confirma fecha, motivo y fotografía registrada.'],
                  ['3', 'Paga de forma segura', 'Avanza al formulario únicamente cuando estés conforme.'],
                ].map(([step, title, text]) => (
                  <div key={step} className="flex gap-3 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                      {step}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PortalSurface>
          </div>
          <Modal
            open={searched && items.length === 0}
            onCancel={() => setSearched(false)}
            title="Sin resultados"
            footer={
              <Button type="primary" className="!rounded-xl !font-semibold" onClick={() => setSearched(false)}>
                Entendido
              </Button>
            }
          >
            <Empty
              description="No se encontraron multas registradas para esa placa. Verifica el tipo y número e intenta de nuevo."
              style={{ padding: '24px 0' }}
            />
          </Modal>
          {items.length > 0 ? (
            <PortalSurface
              title="Resultados encontrados"
              description="Selecciona una multa para revisar sus datos completos antes de continuar."
            >
              <Table
                rowKey="id"
                loading={loading}
                pagination={false}
                scroll={{ x: 560 }}
                columns={[
                  { title: 'Fecha', render: (_, record: TrafficFine) => formatDateTime(record.issuedAt) },
                  { title: 'Motivo', dataIndex: 'reason' },
                  { title: 'Monto', render: (_, record: TrafficFine) => formatCurrency(record.amount) },
                  {
                    title: 'Estado',
                    render: (_, record: TrafficFine) => (
                      <Tag color={record.status === 'PAID' ? 'green' : 'orange'}>{formatStatus(record.status)}</Tag>
                    ),
                  },
                  {
                    title: 'Detalle',
                    render: (_, record: TrafficFine) => (
                      <Button
                        className="!rounded-xl !font-semibold"
                        onClick={() => {
                          setSelectedFine(record)
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
          ) : null}
        </>
      ) : null}
      {currentStep === 1 && selectedFine ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <PortalSurface
            title="Resumen de la infracción"
            description="Verifica los datos del acta y confirma que corresponde a la gestión que deseas resolver."
            extra={
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedFine.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {formatStatus(selectedFine.status)}
              </span>
            }
          >
            <div className="grid gap-3">
              {[
                ['Placa', `${selectedFine.plateType} ${selectedFine.plateNumber}`],
                ['Fecha y hora', formatDateTime(selectedFine.issuedAt)],
                ['Motivo', selectedFine.reason],
                ['Monto', formatCurrency(selectedFine.amount)],
                ['Estado', formatStatus(selectedFine.status)],
                ['Evidencia', selectedFine.evidenceNotes ?? 'Sin notas adicionales'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </PortalSurface>

          <PortalSurface title="Evidencia registrada" description="Imagen o soporte asociado a la multa.">
            {selectedFine.evidencePhotoUrl ? (
              <div className="overflow-hidden rounded-[24px] border border-slate-200">
                <Image src={selectedFine.evidencePhotoUrl} alt="Fotografía de la infracción" />
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 py-12">
                <Empty description="No hay fotografía asociada a esta multa." />
              </div>
            )}
          </PortalSurface>

          <div className="xl:col-span-2 flex flex-wrap gap-3">
            <Button size="large" className="!rounded-2xl !font-semibold" onClick={() => setCurrentStep(0)}>
              Volver a resultados
            </Button>
            <Button
              type="primary"
              size="large"
              className="!rounded-2xl !px-6 !font-semibold"
              onClick={() => setCurrentStep(selectedFine.status === 'PAID' ? 3 : 2)}
            >
              {selectedFine.status === 'PAID' ? 'Ver confirmación' : 'Continuar al pago'}
            </Button>
          </div>
        </div>
      ) : null}
      {currentStep === 2 && selectedFine ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={`Estas pagando la multa ${selectedFine.id.slice(0, 8).toUpperCase()} por ${formatCurrency(selectedFine.amount)}.`}
          />
          <CreditCardPaymentForm
            amount={Number(selectedFine.amount)}
            concept="multa de tránsito"
            reference={selectedFine.id.slice(0, 8).toUpperCase()}
            loading={paying}
            submitLabel="Pagar multa"
            showInlineSuccess={false}
            onSubmit={async () => {
              setPaying(true)
              try {
                await payFine(selectedFine.id)
                const refreshed = await searchFines({
                  plateType: selectedFine.plateType,
                  plateNumber: selectedFine.plateNumber,
                })
                const nextSelected = refreshed.find((item) => item.id === selectedFine.id) ?? null
                setItems(refreshed)
                setSelectedFine(nextSelected)
                setCurrentStep(3)
                void message.success('Multa pagada con éxito.')
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
      {currentStep === 3 && selectedFine ? (
        <PortalSurface>
          <Result
            status="success"
            title="Pago completado"
            subTitle={`La multa ${selectedFine.id.slice(0, 8).toUpperCase()} fue procesada correctamente.`}
            extra={[
              <Button key="back" size="large" className="!rounded-2xl !font-semibold" onClick={() => setCurrentStep(0)}>
                Consultar otra multa
              </Button>,
            ]}
          />
        </PortalSurface>
      ) : null}
    </Space>
  )
}
