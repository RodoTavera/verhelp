import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'

export function useLayoutMotion(scopeRef, pathname) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          desktop: '(min-width: 960px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { reduceMotion } = context.conditions
          const scope = scopeRef.current
          const main = scope?.querySelector('[data-shell-main]')

          if (!scope || !main) return undefined

          const header = scope.querySelector('[data-shell-header]')
          const footer = scope.querySelector('[data-shell-footer]')
          const heroPanels = gsap.utils.toArray(main.querySelectorAll('.hero-panel, [data-hero]'))
          const heroLines = gsap.utils.toArray(main.querySelectorAll('[data-hero-line]'))
          const revealItems = gsap.utils.toArray(
            main.querySelectorAll('[data-reveal], .card, .card-soft, .metric-pill')
          ).filter((element) => !heroPanels.includes(element))
          const parallaxItems = gsap.utils.toArray(main.querySelectorAll('[data-parallax]'))
          const scrubItems = gsap.utils.toArray(main.querySelectorAll('[data-scrub]'))

          if (reduceMotion) {
            gsap.set([header, footer, ...heroPanels, ...heroLines, ...revealItems, ...parallaxItems, ...scrubItems], {
              clearProps: 'all',
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotate: 0,
            })
            return undefined
          }

          const introTimeline = gsap.timeline({
            defaults: {
              ease: 'power3.out',
              duration: 0.88,
            },
          })

          if (header) {
            introTimeline.from(header, { yPercent: -40, autoAlpha: 0, duration: 0.72 })
          }

          if (heroPanels.length) {
            introTimeline.from(heroPanels, { y: 34, autoAlpha: 0, stagger: 0.12 }, '<0.08')
          }

          if (heroLines.length) {
            introTimeline.from(heroLines, { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.68 }, '<0.12')
          }

          if (revealItems.length) {
            ScrollTrigger.batch(revealItems, {
              start: 'top 88%',
              once: true,
              interval: 0.1,
              batchMax: 6,
              onEnter: (batch) => {
                gsap.fromTo(
                  batch,
                  { autoAlpha: 0, y: 26 },
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.82,
                    ease: 'power3.out',
                    stagger: 0.12,
                    overwrite: true,
                  }
                )
              },
            })
          }

          parallaxItems.forEach((element) => {
            const depth = Number(element.dataset.depth || 12)
            gsap.to(element, {
              yPercent: -depth,
              ease: 'none',
              scrollTrigger: {
                trigger: element.closest('[data-parallax-root]') || element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.9,
              },
            })
          })

          scrubItems.forEach((element) => {
            const moveX = Number(element.dataset.scrubX || 0)
            const moveY = Number(element.dataset.scrubY || 0)
            const rotation = Number(element.dataset.rotate || 0)

            gsap.to(element, {
              x: moveX,
              y: moveY,
              rotate: rotation,
              ease: 'none',
              scrollTrigger: {
                trigger: element.closest('[data-scrub-root]') || element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            })
          })

          if (footer) {
            gsap.fromTo(
              footer,
              { autoAlpha: 0, y: 26 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.82,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: footer,
                  start: 'top bottom-=80',
                  once: true,
                },
              }
            )
          }

          ScrollTrigger.refresh()
          return undefined
        },
        scopeRef
      )

      return () => {
        mm.revert()
      }
    },
    {
      scope: scopeRef,
      dependencies: [pathname],
      revertOnUpdate: true,
    }
  )
}