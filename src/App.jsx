import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { StoreProvider, useStore } from './store'
import Auth from './components/Auth'
import ConfigNeeded from './components/ConfigNeeded'
import InstallPrompt from './components/InstallPrompt'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Ganhos from './pages/Ganhos'
import Despesas from './pages/Despesas'
import Combustivel from './pages/Combustivel'
import Manutencao from './pages/Manutencao'
import Veiculos from './pages/Veiculos'
import Metas from './pages/Metas'
import Relatorios from './pages/Relatorios'
import Calendario from './pages/Calendario'
import Configuracoes from './pages/Configuracoes'

const PAGES = {
  dashboard: { title: 'Dashboard', component: Dashboard },
  ganhos: { title: 'Ganhos', component: Ganhos },
  despesas: { title: 'Despesas', component: Despesas },
  combustivel: { title: 'Combustível', component: Combustivel },
  manutencao: { title: 'Manutenção', component: Manutencao },
  veiculos: { title: 'Veículos', component: Veiculos },
  metas: { title: 'Metas', component: Metas },
  relatorios: { title: 'Relatórios', component: Relatorios },
  calendario: { title: 'Calendário', component: Calendario },
  configuracoes: { title: 'Configurações', component: Configuracoes }
}

function FullScreenLoader() {
  return (
    <div className="app-shell flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400">
      <Loader2 className="animate-spin" size={28} />
    </div>
  )
}

function AppShell() {
  const { isSupabaseConfigured, authReady, session } = useStore()
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isSupabaseConfigured) return <ConfigNeeded />
  if (!authReady) return <FullScreenLoader />
  if (!session) return <Auth />

  const Current = PAGES[page]?.component || Dashboard

  return (
    <div className="app-shell bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex">
      <Sidebar
        page={page}
        setPage={(p) => {
          setPage(p)
          setSidebarOpen(false)
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 pb-bottom-nav lg:pb-0">
        <Topbar
          title={PAGES[page]?.title}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
          <Current goTo={setPage} />
        </main>
      </div>

      <BottomNav page={page} setPage={setPage} onToggleMenu={() => setSidebarOpen((v) => !v)} />
      <InstallPrompt />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  )
}
