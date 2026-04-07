import { Button, Form, Input, InputNumber, Result, Select, Space, message } from 'antd'
import { useState, useRef, useCallback } from 'react'
import { PlusOutlined, FormOutlined, CameraOutlined, DeleteOutlined } from '@ant-design/icons'
import { createFine } from '@/shared/api/fines'
import type { CreateFinePayload } from '@/shared/api/fines'
import { PortalPageHeader } from '@/shared/components/portal/PortalPageHeader'
import { PortalSurface } from '@/shared/components/portal/PortalSurface'

const { TextArea } = Input

/** Compress an image file to a base64 JPEG, max 1600px wide */
function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new window.Image()
      img.onerror = reject
      img.onload = () => {
        const MAX = 1600
        const scale = img.width > MAX ? MAX / img.width : 1
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

type FormValues = Omit<CreateFinePayload, 'evidencePhotoUrl'>

export function CreateFinePage() {
  const [form] = Form.useForm<FormValues>()
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(false)
  const [lastPlate, setLastPlate] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoLoading(true)
    try {
      const base64 = await compressPhoto(file)
      setPhotoPreview(base64)
    } catch {
      message.error('No se pudo procesar la foto.')
    } finally {
      setPhotoLoading(false)
      e.target.value = ''
    }
  }, [])

  async function handleSubmit(values: FormValues) {
    setLoading(true)
    try {
      const fine = await createFine({
        ...values,
        plateNumber: values.plateNumber.toUpperCase(),
        evidencePhotoUrl: photoPreview ?? undefined,
      })
      setLastPlate(`${fine.plateType}-${fine.plateNumber}`)
      setCreated(true)
      form.resetFields()
      setPhotoPreview(null)
    } catch {
      message.error('No se pudo registrar la multa. Verifica tu conexión e inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <PortalPageHeader
          eyebrow="Agente de tránsito"
          title="Infracción registrada exitosamente"
          description="La infracción ha sido registrada en el sistema."
        />
        <PortalSurface>
          <Result
            status="success"
            title="Multa registrada"
            subTitle={`La infracción para la placa ${lastPlate} fue ingresada correctamente.`}
            extra={[
              <Button
                key="new"
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setCreated(false)}
                style={{ minHeight: 48 }}
              >
                Registrar otra multa
              </Button>,
            ]}
          />
        </PortalSurface>
      </Space>
    )
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PortalPageHeader
        eyebrow="Agente de tránsito"
        title="Registrar infracción"
        description="Ingresa los datos del vehículo y los detalles de la infracción detectada en campo."
        meta={['Uso exclusivo agentes', 'Requiere autenticación']}
      />

      <PortalSurface
        title="Datos de la infracción"
        description="Todos los campos marcados son obligatorios."
        extra={<FormOutlined style={{ fontSize: 20, color: '#1696ff' }} />}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          style={{ maxWidth: 560 }}
        >
          <Form.Item
            label="Tipo de placa"
            name="plateType"
            rules={[{ required: true, message: 'Selecciona el tipo de placa' }]}
          >
            <Select
              placeholder="Selecciona tipo"
              style={{ minHeight: 48 }}
              options={[
                { value: 'M', label: 'M — Motocicleta' },
                { value: 'P', label: 'P — Particular' },
                { value: 'C', label: 'C — Comercial' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Número de placa"
            name="plateNumber"
            rules={[
              { required: true, message: 'Ingresa el número de placa' },
              { max: 16, message: 'Máximo 16 caracteres' },
            ]}
            normalize={(v: string) => v.toUpperCase()}
          >
            <Input
              placeholder="Ej. 556FQS"
              style={{ minHeight: 48, fontSize: 18, letterSpacing: 2, fontWeight: 600 }}
              maxLength={16}
            />
          </Form.Item>

          <Form.Item
            label="Motivo de la infracción"
            name="reason"
            rules={[
              { required: true, message: 'Describe el motivo' },
              { max: 220, message: 'Máximo 220 caracteres' },
            ]}
          >
            <TextArea
              placeholder="Ej. Estacionamiento en lugar prohibido"
              rows={3}
              maxLength={220}
              showCount
              style={{ fontSize: 16 }}
            />
          </Form.Item>

          <Form.Item
            label="Monto de la multa (GTQ)"
            name="amount"
            rules={[{ required: true, message: 'Ingresa el monto' }]}
          >
            <InputNumber
              prefix="Q"
              min={1}
              precision={2}
              style={{ width: '100%', minHeight: 48 }}
              placeholder="0.00"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item label="Notas de evidencia (opcional)" name="evidenceNotes">
            <TextArea
              placeholder="Descripción adicional del incidente o condiciones observadas"
              rows={3}
              style={{ fontSize: 16 }}
            />
          </Form.Item>

          {/* Evidence photo — camera capture on mobile, file picker on desktop */}
          <Form.Item label="Foto de evidencia (opcional)">
            {photoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                <img
                  src={photoPreview}
                  alt="Evidencia"
                  style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 12, display: 'block' }}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => setPhotoPreview(null)}
                  style={{ position: 'absolute', top: 8, right: 8 }}
                >
                  Eliminar
                </Button>
              </div>
            ) : (
              <Button
                icon={<CameraOutlined />}
                loading={photoLoading}
                onClick={() => cameraInputRef.current?.click()}
                style={{ width: '100%', minHeight: 52, fontSize: 15, borderStyle: 'dashed' }}
              >
                Tomar foto / seleccionar imagen
              </Button>
            )}
            {/*
              capture="environment" opens the rear camera directly on mobile phones.
              On desktop it falls back to a normal file picker.
            */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handlePhotoCapture}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ minHeight: 52, fontSize: 16, fontWeight: 600 }}
            >
              Registrar multa
            </Button>
          </Form.Item>
        </Form>
      </PortalSurface>
    </Space>
  )
}
