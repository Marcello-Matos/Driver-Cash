import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

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
