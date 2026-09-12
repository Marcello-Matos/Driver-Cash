import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { StoreProvider, useStore } from './store'
import Auth from './components/Auth'
import ConfigNeeded from './components/ConfigNeeded'
import InstallPrompt from './components/InstallPrompt'
import Paywall from './components/Paywall'
import TrialBanner from './components/TrialBanner'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Topbar from './components/Topbar'

// Cod splitting: cada tela carrega sob demanda (arquivo separado)
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ResumoDiario = lazy(() => import('./pages/ResumoDiario'))
const Ganhos = lazy(() => import('./pages/Ganhos'))
const Despesas = lazy(() => import('./pages/Despesas'))
const Combustivel = lazy(() => import('./pages/Combustivel'))
const Manutencao = lazy(() => import('./pages/Manutencao'))
const Veiculos = lazy(() => import('./pages/Veiculos'))
const Metas = lazy(() => import('./pages/Metas'))
const Relatorios = lazy(() => import('./pages/Relatorios'))
const Calendario = lazy(() => import('./pages/Calendario'))
const Configuracoes = lazy(() => import('./pages/Configuracoes'))
import { isProPage, verifyPayment } from './lib/billing'
import { readEntry, LANDING_URL, markKnownDevice, getPendingPreapproval, setPendingPreapproval } from './lib/entry'

// Lido uma única vez ao abrir o app (antes do primeiro render)
const ENTRY = readEntry()

const PAGES = {
  dashboard: { title: 'Dashboard', component: Dashboard },
  hoje: { title: 'Resumo diário', component: ResumoDiario },
  ganhos: { title: 'Ganhos', component: Ganhos },
  despesas: { title: 'Despesas', component: Despesas },
  combustivel: { title: 'Combustível', component: Combustivel },
  manutencao: { title: 'Manutenção', component: Manutencao },
  veiculos: { title: 'Veículos', component: Veiculos },
  metas: { title: 'Metas', component: Metas },
  relatorios: { title: 'Relatórios', component: Relatorios },
  calendario: { title: 'Calendário', component: Calendario },
  configuracoes: { title: 'Configurações', component: Configuracoes },
  assinatura: { title: 'Assinatura', component: Paywall }
}

function FullScreenLoader() {
  return (
    <div className="app-shell flex items-center justify-center bg-slate-100 dark:bg-[#0a101f] text-slate-400">
      <Loader2 className="animate-spin" size={28} />
    </div>
  )
}

function AppShell() {
  const { isSupabaseConfigured, authReady, session, dataReady, access, reload } = useStore()
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [linking, setLinking] = useState(false)

  // Aparelho com login vira "conhecido": não volta mais para a landing automaticamente
  useEffect(() => {
    if (session) markKnownDevice()
  }, [session])

  // Visitante desconhecido sem login -> landing page
  const goLanding = isSupabaseConfigured && authReady && !session && ENTRY.redirectToLanding
  useEffect(() => {
    if (goLanding) window.location.replace(LANDING_URL)
  }, [goLanding])

  // Retorno do checkout do Mercado Pago: após o login, vincula a assinatura à conta
  useEffect(() => {
    const pending = getPendingPreapproval()
    if (!session || !dataReady || !pending || access.state === 'active') {
      if (session && dataReady && pending && access.state === 'active') setPendingPreapproval('')
      return
    }
    let cancelled = false
    setLinking(true)
    verifyPayment({ preapprovalId: pending })
      .then(async (r) => {
        if (cancelled) return
        setPendingPreapproval('')
        if (r.ok) await reload()
      })
      .catch(() => { /* sem rede: tenta de novo na próxima abertura */ })
      .finally(() => { if (!cancelled) setLinking(false) })
    return () => { cancelled = true }
  }, [session, dataReady]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isSupabaseConfigured) return <ConfigNeeded />
  if (!authReady || goLanding) return <FullScreenLoader />
  if (!session) return <Auth initialMode={ENTRY.authMode || 'login'} fromPayment={ENTRY.fromPayment} />
  if (!dataReady || linking) return <FullScreenLoader />

  const locked = !access.isPro && isProPage(page)
  const Current = PAGES[page]?.component || Dashboard

  return (
    <div className="app-shell bg-slate-100 dark:bg-[#0a101f] text-slate-800 dark:text-slate-100 flex">
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
        <TrialBanner goTo={setPage} page={page} />
        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
          <Suspense fallback={<FullScreenLoader />}>
            {locked ? <Paywall feature={PAGES[page]?.title} goTo={setPage} /> : <Current goTo={setPage} />}
          </Suspense>
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
