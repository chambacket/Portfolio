import { useEffect, useRef, useState } from "react"
import { PullCord } from "pullcord"
import "pullcord/pullcord.css"
import heroPortrait from "../imgsources/newherosection.webp"
import frontendImg from "../imgsources/Project_FrontendBuild.png"
import project2Img from "../imgsources/2nd-project.png"

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen]
}

const PROJECTS = [
  {
    index: "01",
    category: "Frontend Build",
    title: "CamiGO",
    year: "2026",
    img: project2Img,
    desc: "CamiGO is a hyper-local mobile commerce and delivery app — Shopee-style shopping for the island community. I designed the UX/UI and built the flow from browsing and ordering to doorstep delivery.",
  },
  {
    index: "02",
    category: "Frontend Build",
    title: "RSTW ISLA",
    year: "2026",
    img: frontendImg,
    desc: "RSTW ISLA brings the Regional Science and Technology Week to the island community — a fast, responsive frontend that makes science programs and events accessible to everyone, built around the theme Science for the People.",
  },
]

const SERVICES = [
  ["Mobile Development", "User research · Wireframes · Prototyping · Interaction design"],
  ["Web Design", "Responsive layouts · Landing pages · Design systems"],
  ["Frontend Development", "React · Vite · Tailwind · Motion & interactions"],
  ["UI/UX Design", "Flutter · Cross-platform apps · App UI/UX"],
]

export default function App() {
  const [dark, setDark] = useState(() => localStorage.theme === "dark")
  const [introDone, setIntroDone] = useState(() => sessionStorage.getItem("introPlayed") === "true")

  useEffect(() => {
    localStorage.theme = dark ? "dark" : "light"
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  useEffect(() => {
    if (introDone) sessionStorage.setItem("introPlayed", "true")
  }, [introDone])

  return (
    <div className="min-h-screen">
      <PullCord
        onPull={() => setDark((d) => !d)}
        pulled={dark}
        ariaLabel="Toggle dark mode"
        noEntrance
      />
      {!introDone && <Loader onDone={() => setIntroDone(true)} />}
      <Header />
      <main className="relative">
        <Hero show={introDone} />
        <About />
        <Featured />
        <Quote />
        <Services />
      </main>
      <Footer />
    </div>
  )
}

const Loader = ({ onDone }) => {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let p = 0
    const timer = setInterval(() => {
      p += 4 + Math.floor(Math.random() * 22)
      if (p >= 100) {
        p = 100
        clearInterval(timer)
        setTimeout(onDone, 900)
      }
      setPct(Math.min(p, 100))
    }, 110)
    return () => clearInterval(timer)
  }, [onDone])

  return (
    <section className="fixed inset-0 z-[1000] flex flex-col justify-between overflow-hidden bg-black">
      <div className="absolute inset-0 flex items-end">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="loader-wipe h-full w-[12.5%] bg-black" style={{ animation: `wipeUp 0.9s ${i * 0.09 + 1.1}s ease forwards` }} />
        ))}
      </div>
      <div className="flex h-full flex-col items-start justify-end px-[2.23vw] pb-[2.5rem] text-white">
        <span className="font-display text-[clamp(3rem,5vw,4.375rem)] uppercase leading-[1.2]">{pct}%</span>
      </div>
    </section>
  )
}

const Header = () => {
  const [open, setOpen] = useState(false)
  const links = [
    ["About", "#about"],
    ["Projects", "#projects"],
    ["Contact", "#contact"],
  ]
  return (
    <header className="fixed top-0 left-0 z-[100] w-full">
      <div className="mx-auto flex max-w-[1920px] items-center justify-between px-[2.23vw] py-5 md:py-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer border border-(--fg) bg-transparent px-4 py-2 text-sm uppercase hover:bg-(--fg) hover:text-(--bg) md:hidden"
        >
          menu
        </button>

        <nav className="hidden items-center gap-8 md:flex">
            {links.map(([label, href]) => (
            <a key={href} href={href} className="group relative cursor-pointer text-current no-underline">
              <span className="capitalize">{label}</span>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-current transition-[width] duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
      </div>

      {open && (
        <div className="fixed inset-0 z-[110] bg-(--bg) md:hidden">
          <div className="flex items-center justify-end px-[2.23vw] py-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer border border-(--fg) bg-transparent px-4 py-2 text-sm uppercase hover:bg-(--fg) hover:text-(--bg)"
            >
              close
            </button>
          </div>
          <nav className="flex flex-col gap-8 px-[2.23vw] pt-8">
          {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="flex cursor-pointer items-baseline capitalize">
                <span className="font-display text-5xl font-bold uppercase">{label}</span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

// ponytail: JS marquee so hover reversal eases through zero; CSS can't smooth keyframe direction flips
const Marquee = ({ children }) => {
  const trackRef = useRef(null)
  useEffect(() => {
    const track = trackRef.current
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let pos = 0
    let speed = 0
    let target = 2.3
    let raf
    const tick = (t, last = t) => {
      const dt = Math.min((t - last) / 1000, 0.05)
      speed += (target - speed) * Math.min(1, dt * 3)
      pos = (((pos + speed * dt) % 50) + 50) % 50
      track.style.transform = `translateX(${-pos}%)`
      raf = requestAnimationFrame((nt) => tick(nt, t))
    }
    raf = requestAnimationFrame((t) => tick(t, t))
    const enter = () => (target = -2.3)
    const leave = () => (target = 2.3)
    track.addEventListener("mouseenter", enter)
    track.addEventListener("mouseleave", leave)
    return () => {
      cancelAnimationFrame(raf)
      track.removeEventListener("mouseenter", enter)
      track.removeEventListener("mouseleave", leave)
    }
  }, [])
  return (
    <div className="relative overflow-hidden whitespace-nowrap">
      <div
        ref={trackRef}
        className="flex w-max font-display font-bold uppercase text-(--fg)"
        style={{ fontSize: "calc((100vh - 300px) / 3 * 1.2)", lineHeight: 0.9 }}
      >
        <span className="pr-12 md:pr-20">{children}</span>
        <span className="pr-12 md:pr-20">{children}</span>
      </div>
    </div>
  )
}

const Hero = ({ show }) => (
  <section className="relative flex flex-col justify-between overflow-hidden border-t border-(--line)" style={{ minHeight: "calc(100vh - 88px)", marginBottom: "7.5rem" }}>
    <div className="flex min-h-0 flex-1 flex-col justify-center">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="py-1" style={{ clipPath: show ? "inset(0 0 0 0)" : "inset(100% 0 0 0)", transition: `clip-path 1.2s ${EASE} ${0.1 + i * 0.12}s` }}>
          <Marquee>Frontend developer UX/UI Designer Creative</Marquee>
        </div>
      ))}
    </div>

    <div className="absolute top-1/2 left-1/2 w-[380px] -translate-x-1/2 -translate-y-1/2 overflow-hidden md:w-[520px] lg:w-[700px]" style={{ clipPath: show ? "inset(0 0 0 0)" : "inset(100% 0 0 0)", transition: `clip-path 1.2s ${EASE} 0.55s` }}>
      <div className="aspect-[3/4] overflow-hidden">
        <img src={heroPortrait} alt="Portrait" className="h-full w-full object-cover grayscale" />
      </div>
    </div>

    <div className="relative z-10 flex w-full items-center justify-end px-[2.23vw] pb-4 text-sm uppercase" style={{ opacity: show ? 1 : 0, transition: "opacity 0.8s ease 0.7s" }}>
      <p className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping bg-green-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        <span className="text-(--muted)">Open to work</span>
      </p>
    </div>
  </section>
)

const Container = ({ children, className = "" }) => (
  <div className={`mx-auto max-w-[1920px] px-[2.23vw] ${className}`}>{children}</div>
)

const Label = ({ children }) => (
  <div className="mb-6 flex items-center justify-between border-b border-(--line) pb-3">
    <p className="text-sm uppercase tracking-[0.2em]">{children}</p>
  </div>
)

const About = () => (
  <section id="about" className="mb-10 md:mb-16">
    <Container>
      <Label>(01)</Label>
      <h2 className="font-body text-[clamp(2rem,6vw+1rem,6rem)] font-bold uppercase" style={{ lineHeight: 1.2 }}>
        About
      </h2>
      <div className="mt-8 flex flex-col gap-10 md:mt-14 md:gap-16">
        <p className="max-w-[800px] text-[clamp(0.875rem,7vw,2.5rem)] leading-normal">
          Based in the Philippines, I bring ideas to life — from concept to code, with meticulous
          attention to detail.
        </p>
        <p className="max-w-[800px] self-start text-[clamp(0.875rem,7vw,2.5rem)] leading-normal md:self-end md:text-right">
          turns ideas into real apps — caring about UI/UX beyond looks,
          down to how it feels.
        </p>
      </div>
    </Container>
  </section>
)

const LineReveal = ({ children, delay = 0 }) => {
  const [ref, seen] = useInView()
  return (
    <div ref={ref} className="overflow-hidden">
      <div
        style={{
          transform: seen ? "none" : "translateY(110%)",
          transition: `transform 1.4s ${EASE} ${delay}s`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

const Project = ({ p, flip }) => (
  <article className="py-10 md:py-16">
    <Container>
      <div className="mb-5 flex items-center justify-between border-b border-(--line) pb-3 md:mb-10">
        <p className="text-sm uppercase tracking-[0.2em]">({p.index})</p>
        <div className="flex gap-6 text-sm uppercase tracking-[0.2em]">
          <span>{p.category}</span>
          <span className="text-(--muted-dim)">{p.year}</span>
        </div>
      </div>

      <h3 className="mb-8 font-body text-[clamp(3rem,10vw,8.75rem)] font-bold uppercase leading-[0.9] tracking-[-0.02em] md:mb-10">
        {p.title.split(" ").map((part, i) => (
          <LineReveal key={i} delay={i * 0.12}>
            {part}
          </LineReveal>
        ))}
      </h3>

      <div className={`flex flex-col items-start gap-6 md:gap-10 ${flip ? "md:flex-row-reverse" : "md:flex-row"}`}>
        <a href="#" className="block w-full cursor-pointer md:w-[55%]">
          <div className="aspect-[16/9] w-full overflow-hidden bg-black">
            <img src={p.img} alt={`${p.title} preview`} className="h-full w-full object-cover" />
          </div>
        </a>
        <div className="flex min-h-[200px] flex-1 flex-col justify-between">
          <p className="max-w-[90%] text-[clamp(1rem,2vw,1.375rem)] font-light leading-normal text-(--muted)">
            {p.desc}
          </p>
          <div className="overflow-hidden pt-4 md:hidden">
            <div style={{ transform: "none" }}>
              <a href="#" className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] hover:opacity-60">
                View Project <span className="inline-block">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Container>
  </article>
)

const Featured = () => (
  <section id="projects" className="mb-24 md:mb-40">
    <div className="sticky top-0 flex min-h-screen flex-col items-center justify-center">
      <h2 className="font-body text-[clamp(2rem,6vw+1rem,6rem)] font-bold uppercase" style={{ lineHeight: 1.2 }}>
        Featured Work
      </h2>
      <p className="mt-3 text-xs font-light uppercase tracking-[0.2em] opacity-50">[Scroll to explore more]</p>
    </div>
    <div className="relative z-10 bg-(--bg)">
      {PROJECTS.map((p, i) => (
        <Project key={p.title} p={p} flip={i % 2 === 1} />
      ))}
    </div>
  </section>
)

const Quote = () => {
  const text =
    "I build across design and development at once. Nothing gets handed off or lost in translation, because I build every layer myself. That is how the work actually holds up once it is live."
  const [ref, seen] = useInView(0.3)
  return (
    <section className="py-24 md:py-40">
      <div className="mx-auto max-w-[1920px] px-[2.23vw]">
        <p
          ref={ref}
          className="mx-auto max-w-[90%] text-center text-[clamp(1.375rem,2.2vw+0.75rem,3rem)] font-medium leading-[1.25] tracking-[-0.015em] md:max-w-[80%]"
          style={{ opacity: seen ? 1 : 0.1, transition: "opacity 0.8s ease 0.3s" }}
        >
          {text}
        </p>
      </div>
    </section>
  )
}

const Services = () => {
  const [open, setOpen] = useState(0)
  return (
    <section className="py-24 md:py-40">
      <Container>
        <Label>(Services)</Label>
        <div className="mt-8 flex flex-col gap-4 md:mt-14 md:gap-6">
          {SERVICES.map(([name, tags], i) => {
            const isOpen = open === i
            return (
              <button
                key={name}
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="cursor-pointer pt-4 pb-3 text-left md:pt-6 md:pb-5"
              >
                <div className="flex items-center gap-4">
                  <span className={`font-body text-[clamp(2rem,8vw,6.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.025em] ${i % 2 ? "md:ml-auto" : ""}`}>
                    {name} <span className="font-normal">(<span className="inline-block text-sm normal-case tracking-normal">{isOpen ? "−" : "+"}</span>)</span>
                  </span>
                </div>
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${i % 2 ? "md:ml-auto md:text-right md:pl-10" : ""}`}
                  style={{ maxHeight: isOpen ? "160px" : "0", opacity: isOpen ? 1 : 0 }}
                >
                  <p className="pt-4 text-xs uppercase tracking-[0.08em] text-(--muted) md:text-base">{tags}</p>
                </div>
              </button>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

const Footer = () => (
  <footer id="contact" className="relative z-10 mt-24 flex min-h-screen flex-col justify-between overflow-hidden bg-black text-white md:mt-40">
    <Container className="flex flex-1 flex-col justify-center py-20 md:py-32">
      <p className="mb-6 text-xs uppercase tracking-[0.2em] text-white/60">
        For enquiries, collaborations, or opportunities — don't hesitate to reach out.
      </p>
      <h2 className="font-display text-[clamp(4.5rem,18vw,17.5rem)] font-bold uppercase leading-[0.85]">
        Get in touch
      </h2>
      <div className="mt-4 h-px w-full origin-left bg-white/30" />
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <a href="mailto:Filmarkbalbuena@gmail.com" className="cursor-pointer text-[clamp(1.25rem,3vw,2.5rem)] font-light text-current hover:opacity-70">
          Filmarkbalbuena@gmail.com
        </a>
        <nav className="flex gap-8 text-sm uppercase tracking-[0.15em]">
          {[
            ["github", "https://github.com/chambacket"],
            ["jobstreet", "https://ph.jobstreet.com/profiles/filmark-balbuena-x59lj6mcqp"],
          ].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="cursor-pointer text-white/60 hover:text-white">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </Container>
  </footer>
)
