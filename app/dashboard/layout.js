'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/TopBar'

export default function DashboardLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('wabot_token')
    if (!token) {
      router.push('/login')
    }
  }, [])

  return (
    <div className="bg-slate-50 min-h-screen">
      <Sidebar />
      <TopBar />
      <main className="ml-64 pt-16 p-8">
        {children}
      </main>
    </div>
  )
}