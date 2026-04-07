import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Result,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd'
import { useMemo, useState } from 'react'
import { CheckCircleFilled, CreditCardOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { formatCurrency } from '@/shared/lib/format'

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'
type FocusedField = 'cardNumber' | 'cardholderName' | 'expiry' | 'cvv' | null

type CreditCardFormValues = {
  cardNumber: string
  cardholderName: string
  expiry: string
  cvv: string
}

export type CreditCardPaymentPayload = {
  cardNumber: string
  cardholderName: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  brand: CardBrand
  last4: string
}

type CreditCardPaymentFormProps = {
  amount: number
  concept: string
  reference?: string
  payerName?: string
  submitLabel?: string
  loading?: boolean
  showInlineSuccess?: boolean
  onSubmit: (payload: CreditCardPaymentPayload) => Promise<void>
  onSuccess?: (payload: CreditCardPaymentPayload) => void
}

type CompletedPayment = {
  brand: CardBrand
  last4: string
}

function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function detectCardBrand(value: string): CardBrand {
  const digits = sanitizeDigits(value)

  if (/^4/.test(digits)) {
    return 'visa'
  }

  if (/^(5[1-5]|2[2-7])/.test(digits)) {
    return 'mastercard'
  }

  if (/^3[47]/.test(digits)) {
    return 'amex'
  }

  if (/^(6011|65|64[4-9])/.test(digits)) {
    return 'discover'
  }

  return 'unknown'
}

function formatCardNumber(value: string): string {
  const digits = sanitizeDigits(value).slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = sanitizeDigits(value).slice(0, 4)

  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function maskCardNumber(value: string): string {
  const digits = sanitizeDigits(value)

  if (digits.length === 0) {
    return '•••• •••• •••• ••••'
  }

  const padded = digits.padEnd(16, '•')
  return padded.replace(/(.{4})/g, '$1 ').trim()
}

function getBrandLabel(brand: CardBrand): string {
  switch (brand) {
    case 'visa':
      return 'VISA'
    case 'mastercard':
      return 'Mastercard'
    case 'amex':
      return 'AmEx'
    case 'discover':
      return 'Discover'
    default:
      return 'Tarjeta'
  }
}

function waitForGatewaySimulation(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 3000)
  })
}

export function CreditCardPaymentForm({
  amount,
  concept,
  reference,
  payerName,
  submitLabel = 'Pagar ahora',
  loading = false,
  showInlineSuccess = true,
  onSubmit,
  onSuccess,
}: CreditCardPaymentFormProps) {
  const [form] = Form.useForm<CreditCardFormValues>()
  const [focusedField, setFocusedField] = useState<FocusedField>('cardNumber')
  const [completedPayment, setCompletedPayment] = useState<CompletedPayment | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const cardNumber = Form.useWatch('cardNumber', form) ?? ''
  const cardholderName = Form.useWatch('cardholderName', form) ?? payerName ?? ''
  const expiry = Form.useWatch('expiry', form) ?? ''
  const cvv = Form.useWatch('cvv', form) ?? ''

  const brand = useMemo<CardBrand>(() => detectCardBrand(cardNumber), [cardNumber])
  const isFlipped = focusedField === 'cvv'
  const maskedNumber = maskCardNumber(cardNumber)
  const [expiryMonth = 'MM', expiryYear = 'YY'] = expiry.split('/')

  if (completedPayment) {
    return (
      <Card className="payment-card payment-card--success">
        <Result
          status="success"
          icon={<CheckCircleFilled />}
          title="Pago procesado con éxito"
          subTitle={`${concept} pagado por ${formatCurrency(amount)} con terminación ${completedPayment.last4}.`}
          extra={[
            <Button
              key="another"
              onClick={() => {
                form.resetFields()
                setCompletedPayment(null)
                setErrorMessage(null)
                setFocusedField('cardNumber')
              }}
            >
              Realizar otro pago
            </Button>,
          ]}
        />
      </Card>
    )
  }

  if (isProcessing) {
    return (
      <Card className="payment-card payment-card--processing" bordered={false}>
        <div className="payment-processing-state">
          <Spin size="large" />
          <Typography.Title level={3}>Procesando pago seguro</Typography.Title>
          <Typography.Paragraph>
            Estamos validando tu tarjeta y comunicándonos con la pasarela externa. Esto puede tardar unos segundos. No cierres esta ventana.
          </Typography.Paragraph>
          <div className="payment-processing-state__summary">
            <span>{reference ? `Referencia ${reference}` : 'Pago municipal'}</span>
            <strong>{formatCurrency(amount)}</strong>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="credit-card-payment">
      <Card className="credit-card-preview-card" bordered={false}>
        <div className={`credit-card-preview ${isFlipped ? 'is-flipped' : ''}`}>
          <div className="credit-card-preview__face credit-card-preview__face--front">
            <div className="credit-card-preview__glow" />
            <div className="credit-card-preview__top">
              <span className="credit-card-preview__chip" />
              <Tag className="credit-card-preview__brand" bordered={false}>
                {getBrandLabel(brand)}
              </Tag>
            </div>
            <Typography.Text className="credit-card-preview__number">
              {maskedNumber}
            </Typography.Text>
            <div className="credit-card-preview__meta">
              <div>
                <span className="credit-card-preview__label">Titular</span>
                <strong>{cardholderName.trim() || 'NOMBRE DEL TITULAR'}</strong>
              </div>
              <div>
                <span className="credit-card-preview__label">Vence</span>
                <strong>{`${expiryMonth || 'MM'}/${expiryYear || 'YY'}`}</strong>
              </div>
            </div>
          </div>
          <div className="credit-card-preview__face credit-card-preview__face--back">
            <div className="credit-card-preview__band" />
            <div className="credit-card-preview__signature">
              <span>Código de seguridad</span>
              <strong>{cvv || '•••'}</strong>
            </div>
            <p className="credit-card-preview__back-note">
              Esta simulacion protege la experiencia del ciudadano mientras la pasarela real se integra.
            </p>
          </div>
        </div>
      </Card>

      <Card className="payment-card" bordered={false}>
        <div className="payment-card__header">
          <div>
            <Typography.Title level={4}>Pago con tarjeta</Typography.Title>
            <Typography.Paragraph>
              Completa los datos de tu tarjeta para continuar con el pago seguro de {concept.toLowerCase()}.
            </Typography.Paragraph>
          </div>
          <div className="payment-card__amount-block">
            <span>Monto a pagar</span>
            <strong>{formatCurrency(amount)}</strong>
          </div>
        </div>

        <Space className="payment-card__meta" size={[8, 8]} wrap>
          <Tag icon={<SafetyCertificateOutlined />} color="processing">
            Pago seguro
          </Tag>
          {reference ? <Tag icon={<CreditCardOutlined />}>Referencia {reference}</Tag> : null}
          <Tag icon={<LockOutlined />}>Validación en tiempo real</Tag>
        </Space>

        {errorMessage ? (
          <Alert
            type="error"
            showIcon
            message={errorMessage}
            style={{ marginBottom: 20 }}
          />
        ) : null}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ cardholderName: payerName ?? '' }}
          onFinish={async (values) => {
            const [month = '', year = ''] = values.expiry.split('/')

            setErrorMessage(null)
            setIsProcessing(true)

            try {
              const payload: CreditCardPaymentPayload = {
                cardNumber: sanitizeDigits(values.cardNumber),
                cardholderName: values.cardholderName.trim(),
                expiryMonth: month,
                expiryYear: year,
                cvv: values.cvv,
                brand,
                last4: sanitizeDigits(values.cardNumber).slice(-4),
              }

              await waitForGatewaySimulation()
              await onSubmit(payload)
              onSuccess?.(payload)

              if (showInlineSuccess) {
                setCompletedPayment({
                  brand,
                  last4: sanitizeDigits(values.cardNumber).slice(-4),
                })
              }
            } catch {
              setErrorMessage('No fue posible procesar el pago. Verifica la información e intenta nuevamente.')
            } finally {
              setIsProcessing(false)
            }
          }}
        >
          <Form.Item
            label="Número de tarjeta"
            name="cardNumber"
            rules={[
              { required: true, message: 'Ingresa el número de tarjeta.' },
              {
                validator: async (_, value: string | undefined) => {
                  if (sanitizeDigits(value ?? '').length < 16) {
                    throw new Error('Ingresa 16 dígitos para continuar.')
                  }
                },
              },
            ]}
          >
            <Input
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              autoComplete="cc-number"
              onFocus={() => setFocusedField('cardNumber')}
              onChange={(event) => {
                form.setFieldValue('cardNumber', formatCardNumber(event.target.value))
              }}
            />
          </Form.Item>

          <Form.Item
            label="Nombre del titular"
            name="cardholderName"
            rules={[{ required: true, message: 'Ingresa el nombre del titular.' }]}
          >
            <Input
              placeholder="Como aparece en la tarjeta"
              autoComplete="cc-name"
              onFocus={() => setFocusedField('cardholderName')}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Fecha de vencimiento"
                name="expiry"
                rules={[
                  { required: true, message: 'Ingresa la fecha de vencimiento.' },
                  {
                    validator: async (_, value: string | undefined) => {
                      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value ?? '')) {
                        throw new Error('Usa el formato MM/YY.')
                      }
                    },
                  },
                ]}
              >
                <Input
                  placeholder="MM/YY"
                  maxLength={5}
                  autoComplete="cc-exp"
                  onFocus={() => setFocusedField('expiry')}
                  onChange={(event) => {
                    form.setFieldValue('expiry', formatExpiry(event.target.value))
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="CVV"
                name="cvv"
                rules={[
                  { required: true, message: 'Ingresa el CVV.' },
                  {
                    validator: async (_, value: string | undefined) => {
                      if (sanitizeDigits(value ?? '').length < 3) {
                        throw new Error('Ingresa 3 dígitos.')
                      }
                    },
                  },
                ]}
              >
                <Input
                  placeholder="123"
                  maxLength={4}
                  autoComplete="cc-csc"
                  onFocus={() => setFocusedField('cvv')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(event) => {
                    form.setFieldValue('cvv', sanitizeDigits(event.target.value).slice(0, 4))
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit" size="large" block loading={loading || isProcessing}>
            {submitLabel}
          </Button>
        </Form>
      </Card>
    </div>
  )
}
