import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { useAuth } from '@/shared/auth/auth-provider'
import { municipalLogoUrl } from '@/features/public/landing/constants'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-card__hero">
          <span className="auth-card__kicker">Acceso ciudadano</span>
          <div className="auth-card__brand">
            <img src={municipalLogoUrl} alt="Logo de la Municipalidad de San Juan Sacatepequez" className="auth-card__logo" />
            <div className="auth-card__brand-copy">
              <span>Municipalidad de</span>
              <strong>San Juan Sacatepequez</strong>
            </div>
          </div>
          <div className="auth-card__trust-row">
            <span>Perfil ciudadano</span>
            <span>Pagos y servicios</span>
          </div>
        </div>

        <div className="auth-card__content">
          <Typography.Title level={2}>Registro ciudadano</Typography.Title>
          <Typography.Paragraph className="auth-card__intro">
            Crea tu acceso al portal para consultar pagos, noticias y servicios municipales.
          </Typography.Paragraph>
          {errorMessage ? <Alert type="error" message={errorMessage} style={{ marginBottom: 16 }} /> : null}
          <Form
            layout="vertical"
            onFinish={async (values: {
              fullName: string
              dpi: string
              email: string
              phoneNumber?: string
              password: string
              confirmPassword: string
            }) => {
              setSubmitting(true)
              setErrorMessage(null)

              try {
                const { confirmPassword: _, ...payload } = values
                await register(payload)
                void navigate('/portal')
              } catch (err) {
                const axiosErr = err as AxiosError<{ message: string | string[] }>
                const status = axiosErr.response?.status
                const raw = axiosErr.response?.data?.message

                if (status === 429) {
                  const msg = axiosErr.response?.data?.message
                  setErrorMessage(typeof msg === 'string' ? msg : 'Demasiados intentos. Por favor espera unos minutos antes de volver a intentarlo.')
                } else if (status === 409) {
                  const msg = Array.isArray(raw) ? raw[0] : (raw ?? '')
                  if (msg.includes('DPI')) {
                    setErrorMessage('Este DPI ya está registrado. Si ya tienes cuenta, inicia sesión.')
                  } else if (msg.includes('email') || msg.includes('Email')) {
                    setErrorMessage('Este correo ya está registrado. ¿Ya tienes cuenta?')
                  } else {
                    setErrorMessage('Ya existe una cuenta con estos datos.')
                  }
                } else if (raw) {
                  setErrorMessage(Array.isArray(raw) ? raw[0] : raw)
                } else {
                  setErrorMessage('No fue posible completar el registro. Intenta de nuevo.')
                }
              } finally {
                setSubmitting(false)
              }
            }}
          >
            <Form.Item
              label="Nombre completo"
              name="fullName"
              rules={[
                { required: true, message: 'Ingresa tu nombre completo.' },
                { max: 180, message: 'El nombre no puede superar 180 caracteres.' },
              ]}
            >
              <Input size="large" placeholder="Ingresa tu nombre completo" autoComplete="name" />
            </Form.Item>

            <Form.Item
              label="DPI"
              name="dpi"
              rules={[
                { required: true, message: 'Ingresa tu número de DPI.' },
                { max: 32, message: 'El DPI no puede superar 32 caracteres.' },
              ]}
            >
              <Input size="large" placeholder="Ingresa tu DPI" />
            </Form.Item>

            <Form.Item
              label="Correo electrónico"
              name="email"
              rules={[
                { required: true, message: 'Ingresa tu correo electrónico.' },
                { type: 'email', message: 'El correo no tiene un formato válido.' },
                { max: 180, message: 'El correo no puede superar 180 caracteres.' },
              ]}
            >
              <Input size="large" placeholder="correo@ejemplo.com" autoComplete="email" />
            </Form.Item>

            <Form.Item
              label="Teléfono"
              name="phoneNumber"
              rules={[
                { pattern: /^\d+$/, message: 'El teléfono solo puede contener números.' },
                { max: 32, message: 'El teléfono no puede superar 32 caracteres.' },
              ]}
            >
              <Input size="large" placeholder="Número de teléfono (opcional)" autoComplete="tel" />
            </Form.Item>

            <Form.Item
              label="Contraseña"
              name="password"
              rules={[
                { required: true, message: 'Ingresa una contraseña.' },
                { min: 10, message: 'La contraseña debe tener al menos 10 caracteres.' },
                { max: 72, message: 'La contraseña no puede superar 72 caracteres.' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: 'La contraseña debe incluir al menos una mayúscula, una minúscula y un número.',
                },
              ]}
            >
              <Input.Password size="large" placeholder="Mínimo 10 caracteres, mayúscula, minúscula y número" autoComplete="new-password" visibilityToggle />
            </Form.Item>

            <Form.Item
              label="Confirmar contraseña"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Por favor confirma tu contraseña.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve()
                    return Promise.reject('Las contraseñas no coinciden.')
                  },
                }),
              ]}
            >
              <Input.Password size="large" placeholder="Repite tu contraseña" autoComplete="new-password" visibilityToggle />
            </Form.Item>

            <Button type="primary" htmlType="submit" block loading={submitting} size="large">
              Crear cuenta
            </Button>
          </Form>
          <Typography.Paragraph className="auth-card__footer">
            ¿Ya tienes cuenta? <Link to="/portal/login">Inicia sesión aquí</Link>
          </Typography.Paragraph>
        </div>
      </Card>
    </div>
  )
}
