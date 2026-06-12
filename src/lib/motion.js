import { gsap, ScrollTrigger } from './gsap'

// Editores: helpers de GSAP para el diseno animalista de VetHelp.
// Todos respetan prefers-reduced-motion y exponen un cleanup.

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Revelado editorial: cada elemento sube 24px, aparece y se acomoda.
// Ideal para tarjetas, secciones y headers dentro de "data-rise".
export const riseIn = (targets, { delay = 0, y = 24, stagger = 0.08, duration = 0.8 } = {}) => {
  if (!targets) return null
  const elements = gsap.utils.toArray(targets)
  if (!elements.length) return null
  if (reduceMotion()) {
    gsap.set(elements, { clearProps: 'all', autoAlpha: 1, y: 0 })
    return null
  }
  return gsap.from(elements, {
    autoAlpha: 0,
    y,
    duration,
    delay,
    ease: 'power3.out',
    stagger,
  })
}

// Stagger editorial en cualquier grupo (cards, lineas, pills).
export const staggerIn = (targets, options = {}) =>
  riseIn(targets, { stagger: 0.12, duration: 0.7, ...options })

// Reveal al hacer scroll. Reentrante: limpia cualquier ScrollTrigger previo
// registrado para este root antes de crear los nuevos. Usa "once: true" para
// que los nodos no se vuelvan invisibles si la pagina se re-monta.
export const scrollReveal = (root, selector = '[data-rise]', options = {}) => {
  if (!root) return null
  // Limpia triggers que apunten a nodos de este root para evitar duplicados.
  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger.trigger && root.contains(trigger.trigger)) trigger.kill()
  })
  const elements = root.querySelectorAll(selector)
  if (!elements.length) return null
  if (reduceMotion()) {
    gsap.set(elements, { clearProps: 'all', autoAlpha: 1, y: 0 })
    return null
  }
  // Garantiza visibilidad inicial y luego anima al entrar al viewport.
  gsap.set(elements, { autoAlpha: 1, y: 0 })
  return gsap.utils.toArray(elements).forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 24,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
        once: true,
      },
      ...options,
    })
  })
}

// Hover lift para piezas interactivas (cards, items de lista, etc.)
export const attachHoverLift = (root, selector = '[data-hover]') => {
  if (!root) return () => {}
  if (reduceMotion()) return () => {}
  const elements = root.querySelectorAll(selector)
  const handlers = []
  elements.forEach((el) => {
    const onEnter = () => gsap.to(el, { y: -3, scale: 1.01, duration: 0.28, ease: 'power2.out' })
    const onLeave = () => gsap.to(el, { y: 0, scale: 1, duration: 0.32, ease: 'power2.out' })
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    handlers.push([el, onEnter, onLeave])
  })
  return () =>
    handlers.forEach(([el, onEnter, onLeave]) => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
    })
}

// Parallax suave: mueve un elemento segun scroll.
export const parallaxY = (root, selector, { amount = 40, start = 'top bottom', end = 'bottom top' } = {}) => {
  if (!root || reduceMotion()) return null
  const elements = root.querySelectorAll(selector)
  if (!elements.length) return null
  elements.forEach((el) => {
    gsap.fromTo(
      el,
      { y: -amount },
      {
        y: amount,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start,
          end,
          scrub: true,
        },
      }
    )
  })
  return null
}

// Marquee horizontal: infinito, no depende de scroll.
export const marquee = (root, selector, { speed = 0.6, direction = 1 } = {}) => {
  if (!root || reduceMotion()) return null
  const track = root.querySelector(selector)
  if (!track) return null
  const width = track.scrollWidth / 2
  const tween = gsap.to(track, {
    x: direction > 0 ? -width : width,
    duration: width / (60 * speed),
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize((value) => {
        const v = parseFloat(value)
        if (direction > 0) return `${((v % width) - width) % width}px`
        return `${((v % width) + width) % width}px`
      }),
    },
  })
  return () => tween.kill()
}

// Hover magnetic: el boton se acerca al cursor.
export const attachMagnetic = (root, selector = '[data-magnetic]', strength = 0.25) => {
  if (!root || reduceMotion()) return () => {}
  const elements = root.querySelectorAll(selector)
  const handlers = []
  elements.forEach((el) => {
    const onMove = (event) => {
      const rect = el.getBoundingClientRect()
      const relX = (event.clientX - rect.left) / rect.width - 0.5
      const relY = (event.clientY - rect.top) / rect.height - 0.5
      gsap.to(el, { x: relX * 12 * strength, y: relY * 12 * strength, duration: 0.4, ease: 'power3.out' })
    }
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    handlers.push([el, onMove, onLeave])
  })
  return () =>
    handlers.forEach(([el, onMove, onLeave]) => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    })
}

// Sutil entrada de lista: cada hijo se levanta 12px con stagger.
export const staggerChildren = (root, selector, options = {}) => {
  if (!root) return null
  const parent = root.querySelector(selector)
  if (!parent) return null
  const children = parent.children
  if (!children.length) return null
  if (reduceMotion()) {
    gsap.set(children, { clearProps: 'all', autoAlpha: 1, y: 0 })
    return null
  }
  return gsap.from(children, {
    autoAlpha: 0,
    y: 12,
    duration: 0.5,
    ease: 'power3.out',
    stagger: 0.06,
    ...options,
  })
}

// Resaltado de elementos activos (NavLink activo, tab seleccionado).
export const pulseActive = (root, selector = '[data-active]') => {
  if (!root) return null
  const el = root.querySelector(selector)
  if (!el) return null
  if (reduceMotion()) return null
  return gsap.fromTo(
    el,
    { boxShadow: '0 0 0 0 rgba(63, 107, 77, 0.0)' },
    {
      boxShadow: '0 0 0 6px rgba(63, 107, 77, 0.0)',
      duration: 1.2,
      ease: 'power2.out',
      repeat: -1,
      yoyo: true,
    }
  )
}
