import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer data-shell-footer className="relative z-10 mt-16 border-t border-dark/10">
      <div className="container mx-auto px-4 py-12">
        <div className="footer-panel grid gap-10 text-white md:grid-cols-[1.35fr_0.75fr_0.9fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="brand-mark">VH</div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">Clinical frontend</p>
                <h3 className="text-3xl font-semibold text-white">VetHelp</h3>
              </div>
            </div>
            <p className="max-w-md text-sm text-white/78">
              Un frontend mas elegante para una ficha clinica multi-especie: identidad, permisos, consultas, viajes y operacion real en una sola experiencia.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: '5', label: 'roles conectados' },
                { value: '6+', label: 'especies visibles' },
                { value: '24/7', label: 'lectura operativa' },
              ].map((item) => (
                <div key={item.label} className="rounded-[0.95rem] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/58">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {['Perros', 'Gatos', 'Aves', 'Conejos', 'Mas especies'].map((item) => (
                <span key={item} className="rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">{item}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">Explorar</h4>
            <div className="mt-4 space-y-3 text-sm text-white/78">
              <Link to="/clinics" className="block transition hover:text-white">Clinicas</Link>
              <Link to="/guides" className="block transition hover:text-white">Guias</Link>
              <Link to="/auth" className="block transition hover:text-white">Acceso</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">Contacto</h4>
            <div className="mt-4 space-y-3 text-sm text-white/78">
              <p>info@vethelp.cloud</p>
              <p>Operacion multirol y seguimiento clinico trazable.</p>
              <p>Frontend editorial, limpio y pensado para uso real.</p>
            </div>
          </div>
        </div>

        <div className="pt-5 text-center text-sm text-dark/45">
          <p>&copy; 2026 VetHelp Cloud. Historial clinico digital para mascotas.</p>
        </div>
      </div>
    </footer>
  )
}
