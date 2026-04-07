import { Steps } from 'antd'
import { PortalSurface } from './PortalSurface'

type PortalStepperProps = {
  current: number
  items: Array<{ title: string }>
}

export function PortalStepper({ current, items }: PortalStepperProps) {
  return (
    <PortalSurface>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Flujo guiado
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Completa una etapa a la vez para evitar errores y mantener claridad en el proceso.
          </p>
        </div>
      </div>
      <nav aria-label="Progreso del proceso">
        <h2 className="sr-only">
          Paso {current + 1} de {items.length}: {items[current]?.title}
        </h2>
        <Steps current={current} items={items} />
      </nav>
    </PortalSurface>
  )
}
