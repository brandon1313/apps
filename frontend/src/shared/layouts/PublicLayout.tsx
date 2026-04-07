import { Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <main id="main-content">
      <Outlet />
    </main>
  )
}
