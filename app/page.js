import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">WaBot</h1>
        <p className="text-gray-400 text-lg mb-8">Plataforma de atención automatizada para negocios</p>
        <Link href="/dashboard" className="bg-green-500 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-green-400 transition-colors">
          Ir al panel
        </Link>
      </div>
    </main>
  )
}