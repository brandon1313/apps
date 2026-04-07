import {
  Alert,
  Button,
  Form,
  Input,
  Select,
  Tag,
  message,
} from 'antd'
import { useEffect, useState } from 'react'
import { useAuth } from '@/shared/auth/auth-provider'
import { updateProfile } from '@/shared/api/users'
import { PortalPageHeader } from '@/shared/components/portal/PortalPageHeader'
import { PortalSurface } from '@/shared/components/portal/PortalSurface'

export function ProfilePage() {
  const { user, setUser } = useAuth()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      return
    }

    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      dpi: user.dpi,
      phoneNumber: user.phoneNumber ?? '',
      role: user.role,
    })
  }, [form, user])

  if (!user) {
    return <Alert type="warning" message="No hay usuario autenticado." />
  }

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Cuenta"
        title="Perfil ciudadano"
        description="Mantén actualizados tus datos de contacto y revisa la información oficial asociada a tu cuenta."
        meta={['Información segura', 'Actualización controlada', `Rol: ${{ ADMIN: 'Administrador', USER: 'Ciudadano', WRITER: 'Redactor', POLICE: 'Agente de tránsito' }[user.role] ?? user.role}`]}
      />
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <PortalSurface
          title="Resumen de identidad"
          description="Información oficial registrada para tu cuenta dentro del portal municipal."
        >
          <div className="space-y-4">
            <div className="rounded-[28px] bg-[linear-gradient(135deg,#071133,#1696ff)] p-5 text-white shadow-[0_18px_40px_rgba(7,17,51,0.18)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100/80">
                Cuenta ciudadana
              </p>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">{user.fullName}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/14 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                  {({ ADMIN: 'Administrador', USER: 'Ciudadano', WRITER: 'Redactor', POLICE: 'Agente de tránsito' } as Record<string, string>)[user.role] ?? user.role}
                </span>
                <span className="rounded-full bg-emerald-400/16 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                  Cuenta activa
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                ['Correo', user.email],
                ['DPI', user.dpi],
                ['Teléfono', user.phoneNumber ?? 'No registrado'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </PortalSurface>

        <PortalSurface
          title="Editar perfil"
          description="Actualiza solo los campos permitidos. Tus datos oficiales quedan visibles para facilitar verificacion."
          extra={<Tag color="blue">Edicion controlada</Tag>}
        >
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={async (values: { fullName?: string; phoneNumber?: string }) => {
              setSaving(true)

              try {
                const updatedUser = await updateProfile(values)
                setUser(updatedUser)
                void message.success('Perfil actualizado.')
              } finally {
                setSaving(false)
              }
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Form.Item label="Nombre completo" name="fullName" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
              <Form.Item label="Teléfono" name="phoneNumber">
                <Input size="large" placeholder="Número opcional para futuras verificaciones" />
              </Form.Item>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Form.Item label="Email" name="email">
                <Input size="large" disabled />
              </Form.Item>
              <Form.Item label="DPI" name="dpi">
                <Input size="large" disabled />
              </Form.Item>
            </div>
            <Form.Item label="Rol" name="role">
              <Select
                size="large"
                disabled
                options={[{ value: 'ADMIN' }, { value: 'WRITER' }, { value: 'USER' }]}
              />
            </Form.Item>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">
                Mantener tus datos al día mejora la trazabilidad de pagos y gestiones.
              </p>
              <Button type="primary" htmlType="submit" loading={saving} size="large" className="!rounded-2xl !px-6 !font-semibold">
                Guardar cambios
              </Button>
            </div>
          </Form>
        </PortalSurface>
      </div>
    </div>
  )
}
