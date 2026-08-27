import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import { buildSeed } from './lib/seed'

const PREFS_KEY = 'drivercash:prefs:v1'
const StoreContext = createContext(null)

// UI preferences (tema e mês selecionado) ficam no navegador ------------------
function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  const now = new Date()
  return { theme: 'dark', currentMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` }
}

// Mapeamento entre formato do app (camelCase) e do banco (snake_case) ---------
const fromDBEntry = (r) => ({ ...r, vehicleId: r.vehicle_id ?? '' })
const toDBEarning = (e, userId) => ({
  user_id: userId,
  date: e.date,
  platform: e.platform,
  gross: Number(e.gross || 0),
  trips: Number(e.trips || 0),
  km: Number(e.km || 0),
  hours: Number(e.hours || 0),
  vehicle_id: e.vehicleId || null,
  note: e.note || null
})
const toDBExpense = (e, userId) => ({
  user_id: userId,
  date: e.date,
  category: e.category,
  description: e.description || null,
  amount: Number(e.amount || 0),
  liters: e.liters != null && e.liters !== '' ? Number(e.liters) : null,
  vehicle_id: e.vehicleId || null,
  note: e.note || null
})
const toDBVehicle = (v, userId) => ({
  user_id: userId,
  name: v.name || null,
  brand: v.brand || null,
  model: v.model || null,
  plate: v.plate || null,
  year: v.year ? Number(v.year) : null,
  color: v.color || null,
  odometer: Number(v.odometer || 0)
})

export function StoreProvider({ children }) {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [prefs, setPrefs] = useState(loadPrefs)
  const [profile, setProfileState] = useState({ name: 'Motorista', role: 'Motorista', avatar_url: '' })
  const [goals, setGoals] = useState({ monthly: 5000 })
  const [vehicles, setVehicles] = useState([])
  const [earnings, setEarnings] = useState([])
  const [expenses, setExpenses] = useState([])

  const userId = session?.user?.id

  // Persist prefs + apply theme
  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    const root = document.documentElement
    if (prefs.theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [prefs])

  // Auth session listener
  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthReady(true); return }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Load all data when logged in
  const loadAll = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      const [p, v, e, x] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('vehicles').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('earnings').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false })
      ])
      if (p.data) {
        setProfileState({ name: p.data.name, role: p.data.role, avatar_url: p.data.avatar_url || '' })
        setGoals({ monthly: Number(p.data.monthly_goal) || 0 })
      }
      setVehicles((v.data || []).map(fromDBEntry))
      setEarnings((e.data || []).map(fromDBEntry))
      setExpenses((x.data || []).map(fromDBEntry))
    } catch (err) {
      console.error(err)
      setError('Falha ao carregar seus dados.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) loadAll()
    else { setVehicles([]); setEarnings([]); setExpenses([]) }
  }, [userId, loadAll])

  // Auth actions ----------------------------------------------------
  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message || null
  }, [])

  const signUp = useCallback(async (email, password, name) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
    return error?.message || null
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
  }, [])

  // Preferences -----------------------------------------------------
  const setSettings = useCallback((patch) => setPrefs((p) => ({ ...p, ...patch })), [])
  const toggleTheme = useCallback(() => setPrefs((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' })), [])

  // Profile + goal --------------------------------------------------
  const setProfile = useCallback(async (patch) => {
    setProfileState((prev) => ({ ...prev, ...patch }))
    if (userId) await supabase.from('profiles').update(patch).eq('id', userId)
  }, [userId])

  const uploadAvatar = useCallback(async (file) => {
    if (!userId || !file) return null
    setLoading(true)
    try {
      const ext = file.name.split('.').pop() || 'png'
      const path = `${userId}/avatar-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = data.publicUrl
      setProfileState((prev) => ({ ...prev, avatar_url: publicUrl }))
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
      return publicUrl
    } catch (err) {
      console.error(err)
      setError(err.message || 'Falha ao enviar a foto.')
      return null
    } finally {
      setLoading(false)
    }
  }, [userId])

  const setGoal = useCallback(async (monthly) => {
    const value = Number(monthly) || 0
    setGoals({ monthly: value })
    if (userId) await supabase.from('profiles').update({ monthly_goal: value }).eq('id', userId)
  }, [userId])

  // Generic CRUD helpers -------------------------------------------
  const addRow = useCallback(async (table, dbRow, setList, mapBack) => {
    const { data, error } = await supabase.from(table).insert(dbRow).select().single()
    if (error) { console.error(error); setError(error.message); return }
    setList((list) => [mapBack(data), ...list])
  }, [])

  const updateRow = useCallback(async (table, id, patch, setList) => {
    setList((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    const { error } = await supabase.from(table).update(patch).eq('id', id)
    if (error) { console.error(error); setError(error.message) }
  }, [])

  const deleteRow = useCallback(async (table, id, setList) => {
    setList((list) => list.filter((r) => r.id !== id))
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) { console.error(error); setError(error.message) }
  }, [])

  // Earnings
  const addEarning = useCallback((entry) => addRow('earnings', toDBEarning(entry, userId), setEarnings, fromDBEntry), [addRow, userId])
  const updateEarning = useCallback((id, patch) => updateRow('earnings', id, toDBEarning({ ...patch }, userId), setEarnings), [updateRow, userId])
  const deleteEarning = useCallback((id) => deleteRow('earnings', id, setEarnings), [deleteRow])

  // Expenses
  const addExpense = useCallback((entry) => addRow('expenses', toDBExpense(entry, userId), setExpenses, fromDBEntry), [addRow, userId])
  const updateExpense = useCallback((id, patch) => updateRow('expenses', id, toDBExpense({ ...patch }, userId), setExpenses), [updateRow, userId])
  const deleteExpense = useCallback((id) => deleteRow('expenses', id, setExpenses), [deleteRow])

  // Vehicles
  const addVehicle = useCallback((v) => addRow('vehicles', toDBVehicle(v, userId), setVehicles, fromDBEntry), [addRow, userId])
  const updateVehicle = useCallback((id, patch) => updateRow('vehicles', id, toDBVehicle({ ...patch }, userId), setVehicles), [updateRow, userId])
  const deleteVehicle = useCallback((id) => deleteRow('vehicles', id, setVehicles), [deleteRow])

  // Bulk data ops ---------------------------------------------------
  const clearAll = useCallback(async () => {
    if (!userId) return
    setEarnings([]); setExpenses([])
    await Promise.all([
      supabase.from('earnings').delete().eq('user_id', userId),
      supabase.from('expenses').delete().eq('user_id', userId)
    ])
  }, [userId])

  const resetData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const seed = buildSeed()
    // limpa tudo antes
    await Promise.all([
      supabase.from('earnings').delete().eq('user_id', userId),
      supabase.from('expenses').delete().eq('user_id', userId),
      supabase.from('vehicles').delete().eq('user_id', userId)
    ])
    const veh = seed.vehicles[0]
    const { data: newVeh } = await supabase.from('vehicles').insert(toDBVehicle(veh, userId)).select().single()
    const vId = newVeh?.id || null
    await supabase.from('earnings').insert(seed.earnings.map((e) => ({ ...toDBEarning(e, userId), vehicle_id: vId })))
    await supabase.from('expenses').insert(seed.expenses.map((e) => ({ ...toDBExpense(e, userId), vehicle_id: vId })))
    await supabase.from('profiles').update({ monthly_goal: seed.goals.monthly }).eq('id', userId)
    await loadAll()
    setLoading(false)
  }, [userId, loadAll])

  const value = useMemo(
    () => ({
      // auth
      session, authReady, loading, error, isSupabaseConfigured,
      signIn, signUp, signOut, reload: loadAll,
      // data
      settings: prefs, profile, goals, vehicles, earnings, expenses,
      // prefs
      setSettings, toggleTheme,
      // mutations
      setProfile, uploadAvatar, setGoal,
      addEarning, updateEarning, deleteEarning,
      addExpense, updateExpense, deleteExpense,
      addVehicle, updateVehicle, deleteVehicle,
      resetData, clearAll
    }),
    [session, authReady, loading, error, signIn, signUp, signOut, loadAll, prefs, profile, goals, vehicles, earnings, expenses, setSettings, toggleTheme, setProfile, uploadAvatar, setGoal, addEarning, updateEarning, deleteEarning, addExpense, updateExpense, deleteExpense, addVehicle, updateVehicle, deleteVehicle, resetData, clearAll]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore deve ser usado dentro de <StoreProvider>')
  return ctx
}
