'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import supabase from '../../../../lib/supabase'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, User, Pencil } from 'lucide-react'

export default function NegocioPage() {
  const { id } = useParams()
  const [business, setBusiness] = useState(null)
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBusiness() {
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single()
      setBusiness(data)

      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', id)
        .order('created_at', { ascending: false })
      setCustomers(customerData || [])
      setLoading(false)
    }
    loadBusiness()
  }, [id])

  useEffect(() => {
    if (!selectedCustomer) return
    async function loadConversations() {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', selectedCustomer.id)
        .order('created_at', { ascending: true })
      setConversations(data || [])
    }
    loadConversations()
  }, [selectedCustomer])

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-green-400 animate-pulse">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{business?.name}</h1>
            <p className="text-zinc-400 text-sm mt-1">{business?.business_type}</p>
          </div>
          <Link href={`/dashboard/negocio/${id}/editar`} className="ml-auto bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors">
            <Pencil size={14} />
            Editar
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Lista de clientes */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
              <User size={16} className="text-green-400" />
              <span className="text-sm font-medium">Clientes</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {customers.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`p-4 cursor-pointer hover:bg-zinc-800 transition-colors ${selectedCustomer?.id === c.id ? 'bg-zinc-800' : ''}`}
                >
                  <p className="text-sm font-medium">{c.name || 'Cliente'}</p>
                  <p className="text-zinc-500 text-xs mt-1">+{c.phone_number}</p>
                </div>
              ))}
              {customers.length === 0 && (
                <p className="p-4 text-zinc-500 text-sm text-center">Sin clientes aún</p>
              )}
            </div>
          </div>

          {/* Conversación */}
          <div className="col-span-2 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
              <MessageSquare size={16} className="text-green-400" />
              <span className="text-sm font-medium">
                {selectedCustomer ? `Conversación con +${selectedCustomer.phone_number}` : 'Selecciona un cliente'}
              </span>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-96">
              {conversations.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-zinc-700 text-white' : 'bg-green-500 text-white'}`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              {selectedCustomer && conversations.length === 0 && (
                <p className="text-zinc-500 text-sm text-center">Sin mensajes</p>
              )}
              {!selectedCustomer && (
                <p className="text-zinc-500 text-sm text-center mt-8">Selecciona un cliente para ver la conversación</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}