import { useMemo, useState } from 'react'
import {
  BookOpen, Brain, ChartNoAxesColumnIncreasing, ChevronDown, CircleHelp, Clock3,
  CloudUpload, Flame, Flower2, FlaskConical, House, Leaf, Library,
  Search, Settings, Sparkles, Sprout, Sun, CheckCircle2, ArrowRight, MoreHorizontal,
  Plus, X, Check, AlertCircle, Play,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { importSchema } from './lib/import-schema'

type Card = { type?: 'basic' | 'cloze'; front?: string; back?: string; text?: string; tags?: string[] }
type Deck = { name: string; cards: number; due: number; progress: number; tone: string; icon: typeof Leaf }

const initialDecks: Deck[] = [
  { name: 'Biology', cards: 120, due: 15, progress: 68, tone: 'sage', icon: Sprout },
  { name: 'Chemistry', cards: 85, due: 10, progress: 72, tone: 'olive', icon: FlaskConical },
  { name: 'Mathematics', cards: 64, due: 8, progress: 61, tone: 'sand', icon: ChartNoAxesColumnIncreasing },
]
const chartData = [
  { day: 'Oct 1', cards: 26 }, { day: 'Oct 4', cards: 42 }, { day: 'Oct 8', cards: 52 },
  { day: 'Oct 11', cards: 59 }, { day: 'Oct 15', cards: 55 }, { day: 'Oct 18', cards: 70 },
  { day: 'Oct 21', cards: 76 }, { day: 'Oct 24', cards: 62 }, { day: 'Oct 27', cards: 72 },
  { day: 'Oct 30', cards: 94 },
]
const sampleJSON = JSON.stringify({ deck: 'Biology', cards: [
  { type: 'basic', front: 'What is the powerhouse of the cell?', back: 'Mitochondrion', tags: ['cell'] },
  { type: 'cloze', text: 'Photosynthesis takes place in the {{c1::chloroplast}}.', tags: ['plant'] },
]}, null, 2)

export default function App() {
  const [page, setPage] = useState('Dashboard')
  const [json, setJson] = useState('')
  const [payload, setPayload] = useState<{ deck: string; cards: Card[] } | null>(null)
  const [error, setError] = useState('')
  const [decks, setDecks] = useState(initialDecks)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const totalCards = decks.reduce((sum, deck) => sum + deck.cards, 0)
  const filteredDecks = useMemo(() => decks.filter(deck => deck.name.toLowerCase().includes(search.toLowerCase())), [decks, search])

  function previewImport() {
    setError('')
    setPayload(null)
    const parsed = importSchema.safeParse(JSON.parse(json))
    if (!parsed.success) {
      setError(parsed.error.issues.map(issue => issue.message).join(' · '))
      return
    }
    setPayload(parsed.data)
    setShowPreview(true)
  }
  function handleImport() {
    if (!payload) return
    const existing = decks.find(deck => deck.name.toLowerCase() === payload.deck.toLowerCase())
    if (existing) setDecks(decks.map(deck => deck.name === existing.name ? { ...deck, cards: deck.cards + payload.cards.length } : deck))
    else setDecks([...decks, { name: payload.deck, cards: payload.cards.length, due: 0, progress: 0, tone: 'sage', icon: BookOpen }])
    setNotice(`Imported ${payload.cards.length} cards into ${payload.deck}`)
    setShowPreview(false); setJson(''); setPayload(null)
    setPage('Library')
  }

  const nav = [
    { label: 'Dashboard', icon: House }, { label: 'Library', icon: Library },
    { label: 'Import', icon: CloudUpload }, { label: 'Study', icon: Brain },
    { label: 'Statistics', icon: ChartNoAxesColumnIncreasing },
  ]
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Leaf size={23} /></span><span>Amplicard</span></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.label} className={page === item.label ? 'nav-item active' : 'nav-item'} onClick={() => { setPage(item.label); setNotice('') }}><item.icon size={19} strokeWidth={1.8}/><span>{item.label}</span>{item.label === 'Study' && <span className="nav-count">24</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="side-label">PREFERENCES</div>
        <button className="nav-item" onClick={() => setPage('Settings')}><Settings size={19}/><span>Settings</span></button>
        <button className="nav-item"><CircleHelp size={19}/><span>Help center</span></button>
        <div className="sidebar-note"><div className="note-art"><Sprout size={30}/></div><strong>Grow your knowledge.</strong><p>A little review every day goes a long way.</p></div>
        <button className="theme-toggle"><Sun size={18}/> Light mode <ChevronDown size={15}/></button>
      </div>
      <div className="profile"><div className="avatar">N</div><div><strong>My workspace</strong><span>Personal account</span></div><MoreHorizontal size={19}/></div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="searchbox"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cards, decks, or tags..." /><kbd>⌘ K</kbd></div>
        <div className="top-actions"><span className="sync-status"><i/> Local workspace</span><button className="icon-button"><CircleHelp size={19}/></button></div>
      </header>
      {notice && <div className="notice"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}
      {page === 'Dashboard' && <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow">YOUR LEARNING SPACE</div><h1>A fresh page, a little progress. <span>✳</span></h1><p>Make today count, one card at a time.</p></div><button className="primary-button" onClick={() => setPage('Study')}><Play size={16} fill="currentColor"/> Start studying <ArrowRight size={16}/></button></div>
        <section className="stats-grid">
          <Stat icon={Clock3} label="Due today" value="24" foot="Ready when you are" tone="sage"/>
          <Stat icon={CheckCircle2} label="Reviewed" value="18" foot="Cards completed today" tone="green"/>
          <Stat icon={Library} label="Total cards" value={String(totalCards)} foot={`${decks.length} active decks`} tone="sand"/>
          <Stat icon={Flame} label="Study streak" value="12 days" foot="Keep the rhythm going" tone="clay"/>
        </section>
        <div className="content-grid">
          <section className="panel deck-panel">
            <div className="panel-heading"><div><span className="panel-icon"><BookOpen size={19}/></span><h2>Your decks</h2></div><button className="text-button" onClick={() => setPage('Library')}>View library <ArrowRight size={15}/></button></div>
            <div className="deck-list">{filteredDecks.map(deck => <DeckRow key={deck.name} deck={deck} onClick={() => setPage('Study')}/>)}
              {filteredDecks.length === 0 && <p className="empty-state">No decks match your search.</p>}</div>
            <button className="add-deck" onClick={() => setPage('Library')}><Plus size={16}/> Browse all decks</button>
          </section>
          <section className="panel import-panel">
            <div className="panel-heading"><div><span className="panel-icon"><Sparkles size={19}/></span><h2>AI JSON Import</h2><span className="ready-pill">Ready to import</span></div></div>
            <p className="panel-description">Bring your notes to life. Paste the JSON generated by your AI assistant.</p>
            <textarea className="json-input" value={json} onChange={e => setJson(e.target.value)} placeholder={'Paste your flashcard JSON here...\n\n{\n  "deck": "Biology",\n  "cards": [...]\n}'}/>
            {error && <div className="error-text"><AlertCircle size={15}/>{error}</div>}
            <div className="import-actions"><button className="sample-button" onClick={() => { setJson(sampleJSON); setError('') }}>Load sample</button><button className="primary-button" disabled={!json.trim()} onClick={() => { try { previewImport() } catch { setError('Invalid JSON. Check the syntax and try again.') } }}>Preview import <ArrowRight size={16}/></button></div>
            <div className="import-foot"><Check size={14}/> Supports Basic Q&A and Cloze cards</div>
          </section>
        </div>
        <div className="content-grid lower-grid">
          <section className="panel chart-panel"><div className="panel-heading"><div><span className="panel-icon"><ChartNoAxesColumnIncreasing size={19}/></span><h2>Study activity</h2></div><span className="period-label">Last 30 days <ChevronDown size={14}/></span></div><p className="panel-description">Cards reviewed over time</p><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e9e8dc" strokeDasharray="3 4"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#898b7b', fontSize: 11 }}/><Tooltip cursor={{ fill: '#f0f1e8' }}/><Bar dataKey="cards" fill="#6e8b68" radius={[5,5,0,0]} maxBarSize={28}/></BarChart></ResponsiveContainer></div></section>
          <section className="panel activity-panel"><div className="panel-heading"><div><span className="panel-icon"><Clock3 size={19}/></span><h2>Recent activity</h2></div><button className="text-button">See all <ArrowRight size={15}/></button></div><Activity color="green" title="Reviewed 18 cards" detail="Biology · 90% accuracy" time="Today, 10:42"/><Activity color="sage" title="Imported a new deck" detail="Cell Biology · 24 cards" time="Yesterday"/><Activity color="clay" title="Completed a study session" detail="Chemistry · 12 cards" time="Yesterday"/></section>
        </div>
      </div>}
      {page === 'Library' && <div className="page-content"><div className="page-heading"><div><div className="eyebrow">COLLECTION</div><h1>Your deck library</h1><p>All your subjects, thoughtfully organized.</p></div><button className="primary-button" onClick={() => setPage('Import')}><Plus size={16}/> Import cards</button></div><section className="library-grid">{filteredDecks.map(deck => <div className="library-card" key={deck.name}><div className={`deck-art ${deck.tone}`}><deck.icon size={27}/></div><h3>{deck.name}</h3><p>{deck.cards} cards · {deck.due} due today</p><div className="progress-track"><span style={{width:`${deck.progress}%`}}/></div><div className="library-card-foot"><span>{deck.progress}% learned</span><button className="small-study" onClick={() => setPage('Study')}>Study <ArrowRight size={14}/></button></div></div>)}</section></div>}
      {page === 'Import' && <div className="page-content"><div className="page-heading"><div><div className="eyebrow">ADD TO YOUR LIBRARY</div><h1>Import flashcards</h1><p>Paste structured JSON from your AI-generated study notes.</p></div></div><section className="panel import-page-panel"><div className="import-guide"><Sparkles size={22}/><div><strong>From notes to flashcards</strong><p>Ask your AI to return a JSON object with a deck name and a cards array. Preview everything before saving.</p></div></div><textarea className="json-input large" value={json} onChange={e => setJson(e.target.value)} placeholder={sampleJSON}/>{error && <div className="error-text"><AlertCircle size={15}/>{error}</div>}<div className="import-actions"><button className="sample-button" onClick={() => setJson(sampleJSON)}>Load sample JSON</button><button className="primary-button" disabled={!json.trim()} onClick={() => { try { previewImport() } catch { setError('Invalid JSON. Check the syntax and try again.') } }}>Validate & preview <ArrowRight size={16}/></button></div></section></div>}
      {page === 'Study' && <div className="page-content"><div className="page-heading"><div><div className="eyebrow">FOCUS SESSION</div><h1>Time to remember.</h1><p>Choose a deck to begin your review.</p></div></div><section className="study-chooser">{decks.map(deck => <DeckRow key={deck.name} deck={deck} onClick={() => setNotice(`Study session for ${deck.name} is coming next.`)}/>)}</section></div>}
      {(page === 'Statistics' || page === 'Settings') && <div className="page-content"><div className="page-heading"><div><div className="eyebrow">AMPlicard</div><h1>{page}</h1><p>{page === 'Statistics' ? 'Your learning trends will appear here as you review.' : 'Personalize your study space.'}</p></div></div><section className="panel placeholder-panel"><Flower2 size={34}/><h2>{page === 'Statistics' ? 'Your progress is taking root' : 'A space that works for you'}</h2><p>{page === 'Statistics' ? 'Complete a few review sessions to start building your learning history.' : 'Preferences and backup options will be available here.'}</p></section></div>}
    </main>
    {showPreview && payload && <div className="modal-backdrop" onClick={() => setShowPreview(false)}><section className="preview-modal" onClick={e => e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">IMPORT PREVIEW</span><h2>{payload.deck}</h2><p>{payload.cards.length} cards ready to add</p></div><button className="icon-button" onClick={() => setShowPreview(false)}><X size={19}/></button></div><div className="preview-list">{payload.cards.slice(0,5).map((card,i) => <div className="preview-card" key={i}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{card.type === 'cloze' ? 'Cloze deletion' : card.front}</strong><p>{card.type === 'cloze' ? card.text : card.back}</p></div><CheckCircle2 size={17}/></div>)}</div>{payload.cards.length > 5 && <p className="muted-note">And {payload.cards.length - 5} more cards…</p>}<div className="modal-actions"><button className="sample-button" onClick={() => setShowPreview(false)}>Back to edit</button><button className="primary-button" onClick={handleImport}>Import {payload.cards.length} cards <ArrowRight size={16}/></button></div></section></div>}
  </div>
}

function LayersIcon({ size=20 }: { size?: number }) { return <Library size={size}/> }
function Stat({ icon: Icon, label, value, foot, tone }: { icon: typeof Clock3; label: string; value: string; foot: string; tone: string }) {
  return <div className="stat-card"><div className="stat-top"><span className={`stat-icon ${tone}`}><Icon size={18}/></span><span>{label}</span></div><strong className="stat-value">{value}</strong><span className="stat-foot">{foot}</span><div className="stat-decoration"/></div>
}
function DeckRow({ deck, onClick }: { deck: Deck; onClick: () => void }) {
  return <button className="deck-row" onClick={onClick}><span className={`deck-icon ${deck.tone}`}><deck.icon size={22}/></span><span className="deck-meta"><strong>{deck.name}</strong><small>{deck.cards} cards <i/> {deck.due} due today</small></span><span className="row-progress"><i style={{width:`${deck.progress}%`}}/></span><strong className="progress-number">{deck.progress}%</strong><ArrowRight className="row-arrow" size={16}/></button>
}
function Activity({ color, title, detail, time }: { color: string; title: string; detail: string; time: string }) {
  return <div className="activity-row"><span className={`activity-dot ${color}`}/><div><strong>{title}</strong><p>{detail}</p></div><time>{time}</time></div>
}
