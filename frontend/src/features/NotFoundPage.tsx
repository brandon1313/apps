import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Result
        status="404"
        title="404"
        subTitle="La página que buscas no existe o fue movida."
        extra={[
          <Button key="home" type="primary" size="large" onClick={() => navigate('/')}>
            Ir al inicio
          </Button>,
          <Button key="portal" size="large" onClick={() => navigate('/portal')}>
            Ir al portal
          </Button>,
        ]}
      />
    </div>
  )
}
