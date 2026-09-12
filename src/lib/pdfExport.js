import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { categoryColor, MONTH_NAMES } from './utils'

const INK = [30, 41, 59]
const MUTED = [100, 116, 139]
const BRAND = [101, 163, 13]
const ROSE = [220, 38, 38]
const LINE = [226, 232, 240]
const SOFT = [248, 250, 252]
const DARK = [15, 23, 42]

const money = (value) =>
  'R$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))

const fmtDate = (iso) => {
  const p = String(iso).split('-')
  return p[2] + '/' + p[1] + '/' + p[0]
}

const stampNow = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

const sortByDate = (list) =>
  list.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

const hexRgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]

const niceMax = (v) => {
  if (v <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / p
  const s = n <= 1.2 ? 1.2 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 8 ? 8 : 10
  return s * p
}

const compact = (value) => {
  const n = Number(value || 0)
  const abs = Math.abs(n)
  const txt = abs >= 1000000 ? (n / 1000000).toFixed(1).replace('.', ',') + 'M' : abs >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + 'k' : String(Math.round(n))
  return txt
}

const monthLabel = (y, m) => MONTH_NAMES[m].slice(0, 3) + '/' + String(y).slice(2)

const BAR_COLORS = { ganhos: [34, 197, 94], despesas: [244, 63, 94], lucro: [59, 130, 246] }

function drawBarChart(doc, box, buckets) {
  const x = box.x
  const y = box.y
  const w = box.w
  const h = box.h
  const padL = 38
  const padT = 12
  const padB = 14
  const cw = w - padL - 6
  const ch = h - padT - padB
  const maxV = niceMax(Math.max(1, ...buckets.map((b) => Math.max(b.ganhos, b.despesas, Math.abs(b.lucro)))))
  doc.setFont('helvetica', 'normal')
  for (let i = 0; i <= 4; i++) {
    const gy = y + padT + ch - (ch * i) / 4
    doc.setDrawColor(241, 245, 249)
    doc.setLineWidth(0.5)
    doc.line(x + padL, gy, x + w - 4, gy)
    doc.setFontSize(6.5)
    doc.setTextColor(...MUTED)
    doc.text(compact((maxV * i) / 4), x + padL - 4, gy + 2, { align: 'right' })
  }
  doc.setDrawColor(...LINE)
  doc.setLineWidth(0.8)
  doc.line(x + padL, y + padT + ch, x + w - 4, y + padT + ch)
  const gw = cw / buckets.length
  const bw = Math.min(18, Math.max(4, (gw - 14) / 3))
  buckets.forEach((b, i) => {
    const cx = x + padL + i * gw
    const series = [[b.ganhos, BAR_COLORS.ganhos], [b.despesas, BAR_COLORS.despesas], [b.lucro, BAR_COLORS.lucro]]
    const total = 3 * bw + 8
    let bx = cx + (gw - total) / 2
    series.forEach((s) => {
      const v = s[0]
      const hgt = (Math.max(0, v) / maxV) * ch
      if (hgt > 0.5) {
        doc.setFillColor(...s[1])
        doc.roundedRect(bx, y + padT + ch - hgt, bw, hgt, 1.5, 1.5, 'F')
      }
      if (Math.abs(v) > 0.004) {
        doc.setFontSize(5.6)
        doc.setTextColor(...MUTED)
        doc.text(compact(v), bx + bw / 2, y + padT + ch - hgt - 2, { align: 'center' })
      }
      bx += bw + 4
    })
    doc.setFontSize(6.5)
    doc.setTextColor(...INK)
    doc.text(b.label, cx + gw / 2, y + h - 3, { align: 'center' })
  })
}

function drawDonut(doc, cx, cy, r, segs) {
  const total = segs.reduce((s, x) => s + x.value, 0) || 1
  let a = -Math.PI / 2
  segs.forEach((s) => {
    const a2 = a + (s.value / total) * Math.PI * 2
    const steps = Math.max(2, Math.ceil(((a2 - a) / (Math.PI * 2)) * 72))
    for (let i = 0; i < steps; i++) {
      const t1 = a + (a2 - a) * (i / steps)
      const t2 = a + (a2 - a) * ((i + 1) / steps)
      doc.setFillColor(...s.color)
      doc.triangle(cx, cy, cx + Math.cos(t1) * r, cy + Math.sin(t1) * r, cx + Math.cos(t2) * r, cy + Math.sin(t2) * r, 'F')
    }
    a = a2
  })
  doc.setFillColor(255, 255, 255)
  doc.circle(cx, cy, r * 0.58, 'F')
  doc.setDrawColor(...LINE)
  doc.setLineWidth(0.5)
  doc.circle(cx, cy, r, 'S')
  doc.circle(cx, cy, r * 0.58, 'S')
}

const tableBase = {
  theme: 'grid',
  styles: { font: 'helvetica', fontSize: 9, cellPadding: 5, lineColor: LINE, lineWidth: 0.5, textColor: INK },
  headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold' },
  alternateRowStyles: { fillColor: SOFT },
  margin: { left: 40, right: 40 }
}


export function exportRelatorioPdf({ earnings = [], expenses = [], profile = null, period = null } = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const M = 40
  const RIGHT = 555.28

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...BRAND)
  doc.text('DriverCash', M, 54)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Relatório financeiro para motoristas de aplicativo', M, 68)

  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text('Motorista: ' + ((profile && profile.name) || 'Motorista'), RIGHT, 54, { align: 'right' })
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Emitido em: ' + stampNow(), RIGHT, 68, { align: 'right' })

  doc.setDrawColor(...LINE)
  doc.setLineWidth(1)
  doc.line(M, 82, RIGHT, 82)

  let y = 106
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  if (period && period.from && period.to) {
    doc.text('Período: ' + fmtDate(period.from) + ' a ' + fmtDate(period.to), M, y)
  } else {
    doc.text('Exportação completa — todos os lançamentos registrados no sistema', M, y)
  }

  const gross = earnings.reduce((s, e) => s + Number(e.gross || 0), 0)
  const totalExp = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const trips = earnings.reduce((s, e) => s + Number(e.trips || 0), 0)
  const km = earnings.reduce((s, e) => s + Number(e.km || 0), 0)
  const hours = earnings.reduce((s, e) => s + Number(e.hours || 0), 0)
  const avgTrip = trips ? gross / trips : 0
  const avgHour = hours ? gross / hours : 0

  const cards = [
    ['Ganhos brutos', money(gross), BRAND],
    ['Despesas totais', money(totalExp), ROSE],
    ['Lucro líquido', money(gross - totalExp), INK],
    ['Corridas', String(trips), INK],
    ['KM rodados', String(km), INK],
    ['Horas trabalhadas', String(hours), INK],
    ['Média por corrida', money(avgTrip), INK],
    ['Média por hora', money(avgHour), INK]
  ]

  y += 18
  const cardW = (RIGHT - M - 30) / 4
  const cardH = 60
  cards.forEach((c, i) => {
    const x = M + (i % 4) * (cardW + 10)
    const y0 = y + Math.floor(i / 4) * (cardH + 10)
    doc.setDrawColor(...LINE)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(x, y0, cardW, cardH, 6, 6, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text(c[0].toUpperCase(), x + 10, y0 + 18)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...c[2])
    doc.text(c[1], x + 10, y0 + 44)
  })

  y += 2 * (cardH + 10) + 10


  const sectionTitle = (text, y0) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...INK)
    doc.text(text, M, y0)
  }

  const buckets = []
  const today = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    buckets.push({
      key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
      label: monthLabel(d.getFullYear(), d.getMonth()),
      ganhos: 0,
      despesas: 0
    })
  }
  earnings.forEach((e) => {
    const b = buckets.find((x) => x.key === String(e.date).slice(0, 7))
    if (b) b.ganhos += Number(e.gross || 0)
  })
  expenses.forEach((e) => {
    const b = buckets.find((x) => x.key === String(e.date).slice(0, 7))
    if (b) b.despesas += Number(e.amount || 0)
  })
  buckets.forEach((b) => { b.lucro = b.ganhos - b.despesas })

  sectionTitle('Evolução dos últimos 6 meses', y)
  let legX = RIGHT - 160
  const legItems = [['Ganhos', BAR_COLORS.ganhos], ['Despesas', BAR_COLORS.despesas], ['Lucro', BAR_COLORS.lucro]]
  legItems.forEach((it) => {
    doc.setFillColor(...it[1])
    doc.roundedRect(legX, y - 9, 7, 7, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...INK)
    doc.text(it[0], legX + 11, y - 3)
    legX += 50
  })
  drawBarChart(doc, { x: 40, y: y + 5, w: RIGHT - 40, h: 200 }, buckets)
  y += 5 + 200 + 26

  if (expenses.length) {
    const byCat = {}
    expenses.forEach((e) => {
      const k = e.category || 'Outros'
      byCat[k] = (byCat[k] || 0) + Number(e.amount || 0)
    })
    const segs = Object.keys(byCat)
      .sort((a, b) => byCat[b] - byCat[a])
      .map((k) => ({ label: k, value: byCat[k], color: hexRgb(categoryColor(k)) }))
    sectionTitle('Despesas por categoria', y)
    drawDonut(doc, 106, y + 14 + 60, 60, segs)
    let ly = y + 24
    segs.forEach((s) => {
      doc.setFillColor(...s.color)
      doc.roundedRect(184, ly, 7, 7, 1.5, 1.5, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...INK)
      const share = totalExp ? Math.round((s.value / totalExp) * 100) : 0
      doc.text(s.label + ' — ' + money(s.value) + ' (' + share + '%)', 196, ly + 5.5)
      ly += 15
    })
    y += 14 + 120 + 26
  }

  if (expenses.length) {
    const byCat = {}
    expenses.forEach((e) => {
      const k = e.category || 'Outros'
      byCat[k] = (byCat[k] || 0) + Number(e.amount || 0)
    })
    const catRows = Object.keys(byCat).map((k) => [
      k,
      money(byCat[k]),
      (totalExp ? ((byCat[k] / totalExp) * 100).toFixed(1) : '0.0') + '\u0025'
    ])
    sectionTitle('Despesas por categoria', y)
    autoTable(doc, Object.assign({}, tableBase, {
      head: [['Categoria', 'Valor', '\u0025 do total']],
      body: catRows,
      startY: y + 8,
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right', cellWidth: 80 } }
    }))
    y = doc.lastAutoTable.finalY + 24
  }

  if (earnings.length) {
    const earnRows = sortByDate(earnings).map((e) => [
      fmtDate(e.date),
      e.platform || '-',
      String(e.trips || 0),
      String(e.km || 0),
      String(e.hours || 0),
      money(e.gross),
      e.note || ''
    ])
    const foot = [['Total', '', String(trips), String(km), String(hours), money(gross), '']]
    sectionTitle('Ganhos registrados', y)
    autoTable(doc, Object.assign({}, tableBase, {
      head: [['Data', 'Plataforma', 'Corridas', 'KM', 'Horas', 'Bruto', 'Observação']],
      body: earnRows,
      foot,
      footStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold' },
      startY: y + 8,
      columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 100 }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right', cellWidth: 85 } }
    }))
    y = doc.lastAutoTable.finalY + 24
  }

  if (expenses.length) {
    const expRows = sortByDate(expenses).map((e) => [
      fmtDate(e.date),
      e.category || '-',
      e.description || e.note || '-',
      money(e.amount)
    ])
    const foot = [['Total', '', '', money(totalExp)]]
    sectionTitle('Despesas registradas', y)
    autoTable(doc, Object.assign({}, tableBase, {
      head: [['Data', 'Categoria', 'Descrição', 'Valor']],
      body: expRows,
      foot,
      footStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold' },
      startY: y + 8,
      columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 110 }, 3: { halign: 'right', cellWidth: 90 } }
    }))
    y = doc.lastAutoTable.finalY + 24
  }

  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED)
    doc.text('Gerado por DriverCash', M, 826)
    doc.text('P\u00e1gina ' + i + ' de ' + total, RIGHT, 826, { align: 'right' })
  }

  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  doc.save('drivercash-relatorio-' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '.pdf')
  return true
}
