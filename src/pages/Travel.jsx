import { useState } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function Travel() {
  const { user } = useAuth()
  const [petId, setPetId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.get(`/api/airline/verify/${petId}`)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Mascota no encontrada')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'airline') {
    return (
      <div className="card p-12 text-center">
        <p className="text-2xl mb-4">✈️</p>
        <p className="text-gray-600">Esta sección es solo para aerolíneas autorizadas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-fade">
      <section className="hero-panel text-center animate-in">
        <div className="space-y-3">
          <span className="section-kicker">Viajes y embarque</span>
          <h1 className="text-4xl font-bold text-dark">Verificacion de viajes ✈️</h1>
          <p className="text-dark/68">Consulta aptitud sanitaria, vacunas y fecha de ultimo control para embarque.</p>
        </div>
      </section>

      <form onSubmit={handleVerify} className="card p-8 space-y-4 animate-in">
        <div>
          <label className="block text-sm font-semibold mb-2">ID de Mascota</label>
          <input
            type="text"
            placeholder="Ej: PET-2024-1234"
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Buscar mascota'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-md animate-in">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="card p-8 space-y-6 animate-in">
          <div className="bg-gradient-soft p-6 rounded-md text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-dark/50">Ficha evaluada</p>
            <h2 className="text-3xl font-bold text-dark mb-2">{result.petName}</h2>
            <p className="text-gray-600 capitalize">{result.species}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-brand/10 rounded-md border border-brand/15">
              <p className="text-sm text-gray-600">Estado</p>
              <p className="text-2xl font-bold text-brand capitalize">{result.travelStatus}</p>
            </div>
            <div className="text-center p-4 bg-brand/10 rounded-md border border-brand/15">
              <p className="text-sm text-gray-600">Última Consulta</p>
              <p className="text-lg font-semibold">{result.lastControlDate || 'N/A'}</p>
            </div>
          </div>

          {result.vaccines && (
            <div>
              <p className="font-bold mb-3 text-dark">💉 Vacunas</p>
              <div className="flex flex-wrap gap-2">
                {result.vaccines.map((v, i) => (
                  <span key={i} className="tag">{v}</span>
                ))}
              </div>
            </div>
          )}

          {result.allergies && result.allergies.length > 0 && (
            <div>
              <p className="font-bold mb-3 text-dark">⚠️ Alergias</p>
              <div className="flex flex-wrap gap-2">
                {result.allergies.map((a, i) => (
                  <span key={i} className="inline-block rounded-md bg-red-100 px-3 py-1 text-sm text-red-700">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-md p-4 text-center font-semibold ${
            result.travelStatus === 'APTO' 
              ? 'bg-green-100 text-green-700'
              : result.travelStatus === 'CONDICIONAL'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {result.travelStatus === 'APTO' && '✅ Mascota apta para viajar'}
            {result.travelStatus === 'CONDICIONAL' && '⚠️ Requiere actualización de documentos'}
            {result.travelStatus === 'NO APTO' && '❌ Mascota no apta para viajar'}
          </div>
        </div>
      )}
    </div>
  )
}
