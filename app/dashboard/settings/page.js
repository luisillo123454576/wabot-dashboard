'use client'
import { useEffect, useState } from 'react'

export default function Settings() {
  const [business, setBusiness] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadBusiness()
  }, [])

  async function loadBusiness() {
    setLoading(true)
    const businessId = localStorage.getItem('wabot_business_id')
    const api = process.env.NEXT_PUBLIC_API_URL

    try {
      const res = await fetch(`${api}/business?business_id=${businessId}`)
      const data = await res.json()
      setBusiness(data)
      setProducts(data.products || [])
    } catch (err) {
      console.error('Error cargando negocio:', err)
    } finally {
      setLoading(false)
    }
  }

  async function saveBusiness() {
    setSaving(true)
    const businessId = localStorage.getItem('wabot_business_id')
    const api = process.env.NEXT_PUBLIC_API_URL

    try {
      await fetch(`${api}/business`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          ai_context: business.ai_context,
          payment_info: business.payment_info,
          welcome_message: business.welcome_message,
        })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error guardando:', err)
    } finally {
      setSaving(false)
    }
  }

  async function toggleProduct(productId, currentValue) {
    const api = process.env.NEXT_PUBLIC_API_URL
    try {
      await fetch(`${api}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !currentValue })
      })
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, is_available: !currentValue } : p
      ))
    } catch (err) {
      console.error('Error actualizando producto:', err)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Configuración</h1>
        <p className="text-slate-500 text-sm mt-1">Gestiona tu negocio y productos</p>
      </div>

      {/* Info del negocio */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
          Información del negocio
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Nombre
            </label>
            <input
              value={business?.name || ''}
              disabled
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Tipo
            </label>
            <input
              value={business?.business_type || ''}
              disabled
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Método de pago
          </label>
          <input
            value={business?.payment_info || ''}
            onChange={e => setBusiness({ ...business, payment_info: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            placeholder="Ej: Nequi 3235949088"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Mensaje de bienvenida
          </label>
          <input
            value={business?.welcome_message || ''}
            onChange={e => setBusiness({ ...business, welcome_message: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
            placeholder="Ej: ¡Bienvenido! ¿En qué te puedo ayudar?"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Contexto IA
          </label>
          <textarea
            value={business?.ai_context || ''}
            onChange={e => setBusiness({ ...business, ai_context: e.target.value })}
            rows={6}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] resize-none"
            placeholder="Describe tu negocio, horarios, políticas..."
          />
        </div>

        <button
          onClick={saveBusiness}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {saving ? 'Guardando...' : saved ? '✅ Guardado' : 'Guardar cambios'}
        </button>
      </div>

      {/* Productos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
          Productos — {products.length}
        </h2>

        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-bold text-slate-900">{product.name}</p>
                <p className="text-xs text-slate-400">${Number(product.price).toLocaleString('es-CO')}</p>
              </div>
              <button
                onClick={() => toggleProduct(product.id, product.is_available)}
                className={`relative w-12 h-6 rounded-full transition-all ${product.is_available ? 'bg-[#25D366]' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${product.is_available ? 'left-7' : 'left-1'}`}></span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}