'use client'
import { useEffect, useState } from 'react'

export default function Chats() {
  const [customers, setCustomers] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    const businessId = localStorage.getItem('wabot_business_id')
    const api = process.env.NEXT_PUBLIC_API_URL

    try {
      const res = await fetch(`${api}/chats?business_id=${businessId}`)
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error cargando chats:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(customerId) {
    setLoadingMessages(true)
    const api = process.env.NEXT_PUBLIC_API_URL

    try {
      const res = await fetch(`${api}/chats/${customerId}/messages`)
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error cargando mensajes:', err)
    } finally {
      setLoadingMessages(false)
    }
  }

  function selectCustomer(customer) {
    setSelected(customer)
    loadMessages(customer.id)
  }

  function formatTime(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  const STATE_COLORS = {
    NUEVO:          'bg-slate-100 text-slate-600',
    MENU_ENVIADO:   'bg-blue-100 text-blue-700',
    ARMANDO_PEDIDO: 'bg-yellow-100 text-yellow-700',
    ESPERANDO_PAGO: 'bg-purple-100 text-purple-700',
    EN_PREPARACION: 'bg-orange-100 text-orange-700',
    EN_CAMINO:      'bg-purple-100 text-purple-700',
    ENTREGADO:      'bg-green-100 text-green-700',
    CANCELADO:      'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Chats</h1>
        <p className="text-slate-500 text-sm mt-1">Conversaciones de clientes</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex h-[70vh] overflow-hidden">

        {/* Lista de clientes */}
        <div className="w-80 border-r border-slate-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
              Conversaciones — {customers.length}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : customers.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">Sin conversaciones</p>
            ) : (
              customers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => selectCustomer(customer)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-all ${selected?.id === customer.id ? 'bg-slate-50 border-l-2 border-[#25D366]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#006d2f] font-black text-xs">
                        {customer.phone_number?.slice(-2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {customer.name || customer.phone_number}
                        </p>
                        <p className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                          {formatTime(customer.last_activity)}
                        </p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATE_COLORS[customer.state] || 'bg-slate-100 text-slate-600'}`}>
                        {customer.state}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel de mensajes */}
        <div className="flex-1 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <span className="material-symbols-outlined text-slate-200 text-6xl">forum</span>
              <p className="text-slate-400 font-medium mt-4">Selecciona una conversación</p>
            </div>
          ) : (
            <>
              {/* Header chat */}
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                  <span className="text-[#006d2f] font-black text-xs">
                    {selected.phone_number?.slice(-2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{selected.name || selected.phone_number}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATE_COLORS[selected.state] || 'bg-slate-100 text-slate-600'}`}>
                    {selected.state}
                  </span>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-6 h-6 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center">Sin mensajes registrados</p>
                ) : (
                  messages.map((msg, i) => {
                    const isUser = msg.role === 'user'
                    return (
                      <div key={i} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                        <div className="max-w-[70%]">
                          <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm
                            ${isUser
                              ? 'bg-white rounded-tl-none text-slate-900'
                              : 'bg-[#dcf8c6] rounded-tr-none text-slate-900'
                            }`}
                          >
                            <p className="leading-relaxed">{msg.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1 text-right">
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}