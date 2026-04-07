import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/auth-provider'
import { municipalLogoUrl } from '@/features/public/landing/constants'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const redirectTo =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/portal'

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-card__hero">
          <span className="auth-card__kicker">Portal institucional</span>
          <div className="auth-card__brand">
            <img src={municipalLogoUrl} alt="Logo de la Municipalidad de San Juan Sacatepequez" className="auth-card__logo" />
            <div className="auth-card__brand-copy">
              <span>Municipalidad de</span>
              <strong>San Juan Sacatepequez</strong>
            </div>
          </div>
          <div className="auth-card__trust-row">
            <span>Servicios municipales</span>
            <span>Acceso seguro</span>
          </div>
        </div>

        <div className="auth-card__content">
          <Typography.Title level={2}>Ingresar al portal</Typography.Title>
          <Typography.Paragraph className="auth-card__intro">
            Accede a tu perfil ciudadano, pagos municipales y servicios del portal.
          </Typography.Paragraph>
          {errorMessage ? <Alert type="error" message={errorMessage} style={{ marginBottom: 16 }} /> : null}
          <Form
            layout="vertical"
            onFinish={async (values: { email: string; password: string }) => {
              setSubmitting(true)
              setErrorMessage(null)

              try {
                await login(values)
                void navigate(redirectTo, { replace: true })
              } catch {
                setErrorMessage('No fue posible iniciar sesión.')
              } finally {
                setSubmitting(false)
              }
            }}
          >
            <Form.Item label="Correo electrónico" name="email" rules={[{ required: true }]}>
              <Input size="large" placeholder="correo@ejemplo.com" autoComplete="email" />
            </Form.Item>
            <Form.Item label="Contraseña" name="password" rules={[{ required: true }]}>
              <Input.Password size="large" placeholder="Ingresa tu contraseña" autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={submitting} size="large">
              Ingresar
            </Button>
          </Form>
          <Typography.Paragraph className="auth-card__footer">
            ¿No tienes cuenta? <Link to="/portal/register">Regístrate aquí</Link>
          </Typography.Paragraph>
        </div>
      </Card>
    </div>
  )
}
