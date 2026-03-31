'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import supabase from '../../../../../lib/supabase'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditarNegocio() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    business_type: '',
    welcome_message: '',
    ai_context: '',
    is_active: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single()
      if (data) setForm({
        name: data.name || '',
        business_type: data.business_type || '',
        welcome_message: data.welcome_message || '',
        ai_context: data.ai_context || '',
        is_active: data.is_active
      })
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave() {
    setSaving(true)
    await supabase
      .from('businesses')
      .update(form)
      .eq('id', id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-green-400 animate-pulse">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/dashboard/negocio/${id}`} className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">Editar negocio</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-zinc-400 text-sm mb-2 block">Nombre del negocio</label>
            <input
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-2 block">Tipo de negocio</label>
            <input
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              value={form.business_type}
              onChange={e => setForm({ ...form, business_type: e.target.value })}
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-2 block">Mensaje de bienvenida</label>
            <input
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              value={form.welcome_message}
              onChange={e => setForm({ ...form, welcome_message: e.target.value })}
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-2 block">Contexto del bot (menú, horarios, políticas)</label>
            <textarea
              rows={10}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors resize-none"
              value={form.ai_context}
              onChange={e => setForm({ ...form, ai_context: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3">
            <div
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${form.is_active ? 'bg-green-500' : 'bg-zinc-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-zinc-400">Bot {form.is_active ? 'activo' : 'inactivo'}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-zinc-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}