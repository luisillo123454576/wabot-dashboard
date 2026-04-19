'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { path: '/dashboard',             icon: 'dashboard',     label: 'Dashboard'        },
  { path: '/dashboard/chats',       icon: 'forum',         label: 'Chats'            },
  { path: '/dashboard/orders',      icon: 'shopping_cart', label: 'Pedidos'          },
  { path: '/dashboard/analytics',   icon: 'bar_chart',     label: 'Analytics'        },
  { path: '/dashboard/customers',   icon: 'group',         label: 'Clientes'         },
  { path: '/dashboard/automations', icon: 'auto_awesome',  label: 'Automatizaciones' },
  { path: '/dashboard/settings',    icon: 'settings',      label: 'Configuración'    },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-slate-900 h-screen w-64 fixed left-0 top-0 flex flex-col py-6 z-50">
      {/* Logo */}
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center">
          <span className="text-white font-black text-sm">W</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-white tracking-widest">WaBot</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panel Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {links.map(link => {
          const active = pathname === link.path
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative
                ${active
                  ? 'bg-slate-800 text-[#25D366] after:content-[""] after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-[#25D366] after:rounded-r-full'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Status */}
      <div className="px-6 mt-auto">
        <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse"></span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistema activo</p>
          </div>
          <p className="text-xs text-slate-500">Bot respondiendo</p>
        </div>
      </div>
    </aside>
  )
}