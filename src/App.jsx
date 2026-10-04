import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, ArrowUp, Asterisk, Check, Copy, Menu, X, Plus } from 'lucide-react';
import ProjectDialog from './ProjectDialog.jsx';
import usePortfolioMotion from './usePortfolioMotion.js';
import projects from './projects.json';

const EMAIL = 'flippedcris@gmail.com';
const capabilities = [
  { title: 'Brand & visual identity', description: 'Distinctive identities and flexible visual systems, from the first idea to the details that hold it all together.' },
  { title: 'Motion & storytelling', description: 'Bringing ideas to life through moving images, illustration, and visual stories that make a connection.' },
  { title: 'Presentations & content', description: 'Turning complex ideas into clear, engaging presentations and digital content, built to communicate.' },
  { title: 'Digital experiences', description: 'Thoughtful interfaces and interactive experiences that invite people to explore, learn, and participate.' },
];
const getProject = () => {
  const path = window.location.pathname.replace(/\/$/, '');
  return projects.find(p => path === `/works/${p.slug}` || p.aliases.includes(path))?.slug ?? null;
};

function CopyEmail({ className = '' }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true); setFailed(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2400);
    } catch { setFailed(true); }
  }
  return <span className={`email-control ${className}`}><a href={`mailto:${EMAIL}`}>{EMAIL}</a><button type="button" onClick={copy} aria-label={copied ? 'Email copied' : 'Copy email address'} title="Copy email address">{copied ? <Check size={16} /> : <Copy size={16} />}</button><span className="copy-status" role="status">{copied ? 'Copied!' : failed ? 'Select the address to copy it.' : ''}</span></span>;
}

export function App() {
  usePortfolioMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [project, setProject] = useState(getProject);
  const [activeSection, setActiveSection] = useState('');
  const menuButton = useRef(null);
  const mobileNav = useRef(null);
  const openedFromPage = useRef(false);
  useEffect(() => {
    const onHistory = () => setProject(getProject());
    window.addEventListener('popstate', onHistory);
    const id = { '/works': 'work', '/about': 'about', '/contact': 'contact' }[window.location.pathname] || window.location.hash.slice(1);
    if (id) requestAnimationFrame(() => {
      if (id === 'home') window.scrollTo({ top: 0, behavior: 'instant' });
      else document.getElementById(id)?.scrollIntoView();
    });
    const sections = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); }), { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main > section, footer').forEach(el => sections.observe(el));
    return () => { window.removeEventListener('popstate', onHistory); sections.disconnect(); };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    mobileNav.current?.querySelector('a')?.focus();
    function keyDown(event) {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
      if (event.key === 'Tab') {
        const links = [...mobileNav.current.querySelectorAll('a')];
        const first = menuButton.current, last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    function resize() { if (window.innerWidth > 760) setMenuOpen(false); }
    window.addEventListener('keydown', keyDown); window.addEventListener('resize', resize);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', keyDown); window.removeEventListener('resize', resize); };
  }, [menuOpen]);
  function navigate(event, id) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); setMenuOpen(false);
    window.history.pushState({}, '', `/#${id}`);
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
      if (id === 'home') window.scrollTo({ top: 0, behavior });
      else target?.scrollIntoView({ behavior });
      target?.focus({ preventScroll: true });
    });
  }
  function openProject(event, slug) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); openedFromPage.current = true;
    window.history.pushState({}, '', `/works/${slug}`); setProject(slug);
  }
  function closeProject() {
    setProject(null);
    if (openedFromPage.current) { window.history.back(); openedFromPage.current = false; }
    else {
      window.history.replaceState({}, '', '/#work');
      requestAnimationFrame(() => {
        const target = document.getElementById('work');
        target?.scrollIntoView({ behavior: 'instant' });
        target?.focus({ preventScroll: true });
      });
    }
  }
  return <>
    <div className="reading-progress" aria-hidden="true" />
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="header-space">
    <header className={`site-header ${menuOpen ? 'menu-is-open' : ''}`}>
      <a className="wordmark" href="/#home" onClick={e => navigate(e, 'home')} aria-label="Cris home">CRIS<span>©</span></a>
      <span className="header-note">Independent mind.<br />Multidisciplinary designer.</span>
      <nav className="desktop-nav" aria-label="Main navigation"><a className={activeSection === 'work' ? 'active' : ''} href="/#work" onClick={e => navigate(e, 'work')}>Work <sup>{String(projects.length).padStart(2, '0')}</sup></a><a className={activeSection === 'about' ? 'active' : ''} href="/#about" onClick={e => navigate(e, 'about')}>About</a><a className="contact-nav" data-magnetic href="/#contact" onClick={e => navigate(e, 'contact')}>Let’s talk <ArrowUpRight size={17} /></a></nav>
      <button ref={menuButton} className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X /> : <Menu />}</button>
      {menuOpen && <nav ref={mobileNav} id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation"><span className="eyebrow">Good things start with a hello.</span>{['work', 'about', 'contact'].map((id, i) => <a key={id} href={`/#${id}`} onClick={e => navigate(e, id)}><span><small>0{i + 1}</small>{id === 'contact' ? 'Let’s talk' : id}</span><ArrowUpRight /></a>)}<a className="mobile-email" href={`mailto:${EMAIL}`}>{EMAIL}</a></nav>}
    </header>
    </div>
    <main id="main" inert={menuOpen ? true : undefined}>
      <section id="home" className="hero page-width" tabIndex={-1}>
        <div className="hero-eyebrow eyebrow"><span>Creative visual designer</span><span>Based in Ireland · Working everywhere</span></div>
        <h1 className="hero-name" aria-label="Cristopher PX" data-parallax="0.05" data-parallax-max="22">
          {[...'CRISTOPHER'].map((letter, index) => <span className="hero-letter" aria-hidden="true" style={{ '--letter-index': index }} key={index}>{letter}</span>)}
        </h1>
        <div className="hero-composition">
          <div className="hero-identity"><div className="hero-initials" aria-hidden="true"><span className="initial-letters">PX</span></div><CopyEmail className="hero-email" /></div>
          <figure className="hero-portrait" data-parallax="0.16" data-parallax-max="55"><div className="portrait-print" data-tilt><img src="/assets/avatar.jpeg" alt="Cristopher smiling, wearing glasses and a cap" width="345" height="407" fetchPriority="high" /></div><figcaption className="eyebrow">A face behind the pixels.</figcaption></figure>
          <div className="hero-intro" data-parallax="-0.04" data-parallax-max="18"><span className="eyebrow">Ideas in. Impact out.</span><p>I turn rough ideas<br />into <em>remarkable</em><br />visual experiences.</p><a className="text-link" data-magnetic href="/#work" onClick={e => navigate(e, 'work')}>Explore my work <ArrowDown size={18} /></a></div>
        </div>
      </section>
      <section id="work" className="work-section page-width" tabIndex={-1}>
        <div className="section-topline eyebrow"><span>01 / Selected work</span><span>2024 — 2026</span></div>
        <div className="work-heading" data-reveal><h2>Good ideas.<br /><span>Made real.</span></h2><p>A selection of identities, stories,<br />and experiences brought to life.</p></div>
        <div className="project-grid">{projects.map((p, i) => <article key={p.slug} className={`project project-${i + 1}`} data-reveal>
          <a className="project-link" href={`/works/${p.slug}`} onClick={e => openProject(e, p.slug)} aria-label={`View ${p.title} project`}>
            <div className="project-image" data-pointer data-parallax-anchor>
              <div className="project-image-inner" data-parallax="0.12" data-parallax-max="32"><img src={`/assets/${p.cover.file}`} alt={p.cover.alt || `${p.title} project cover`} width={p.cover.width} height={p.cover.height} loading="lazy" /></div>
              <span className="project-open"><ArrowUpRight size={26} /></span><span className="project-image-label eyebrow">View project</span>
              <span className="project-cursor" aria-hidden="true"><span>View<br />project</span><ArrowUpRight size={20} /></span>
            </div>
            <div className="project-title"><h3>{p.title}</h3><span className="eyebrow">{p.year}</span></div><p className="project-category">{p.discipline}</p>
          </a>
          {i === projects.length - 1 && <div className="work-note"><Asterisk size={40} strokeWidth={1.3} data-spin /><p>Different mediums.<br />The same curiosity.</p></div>}
        </article>)}</div>
      </section>
      <div className="motion-ticker" aria-hidden="true">
        <div className="motion-ticker-track" data-drift>{[0, 1, 2].map(index => <span className="motion-ticker-group" key={index}><span className="ticker-outline">Ideas in.</span><Asterisk strokeWidth={1} /><span>Impact out.</span><Asterisk strokeWidth={1} /></span>)}</div>
      </div>
      <section id="about" className="about-section page-width" tabIndex={-1}>
        <div className="section-topline eyebrow"><span>02 / A little about me</span><span>Always curious</span></div>
        <div className="about-heading" data-reveal><span className="about-hello eyebrow">Hi, I’m Cris.</span><h2>It starts with a thought.<br /><span>Then we make it</span><br /><span className="about-indent">something.</span></h2></div>
        <div className="about-grid"><figure className="about-portrait" data-reveal><div className="about-image-window" data-parallax-anchor><img data-parallax="0.12" data-parallax-max="30" src="/assets/portrait.jpeg" alt="Cristopher in an Ireland cap, smiling and holding his shirt collar" width="1600" height="1600" loading="lazy" /></div><figcaption className="eyebrow"><span>A little personality goes a long way.</span><ArrowUpRight size={14} /></figcaption></figure><div className="about-copy" data-reveal><div className="experience"><span>7<span className="experience-plus">+</span></span><p>years of making<br />ideas happen.</p></div><p className="about-lead">Good creative work starts with understanding the idea behind it.</p><p>My experience spans branding, motion, presentations and digital content. Different mediums, always with a focus on finding the right way to communicate the story.</p><p>I bring a curious mind, a considered approach, and a love for the details that make a difference.</p><a className="text-link" href="/#contact" onClick={e => navigate(e, 'contact')}>A project in mind? Let’s talk <ArrowUpRight size={19} /></a></div></div>
        <div className="capabilities" data-reveal><div className="capabilities-label"><span className="eyebrow">What I bring to the table</span><p>One curious mind.<br />Many ways to create.</p></div><div className="capability-list">{capabilities.map((item, i) => <details key={item.title}><summary><span className="eyebrow">0{i + 1}</span><span>{item.title}</span><Plus size={23} strokeWidth={1.5} /></summary><p>{item.description}</p></details>)}</div></div>
      </section>
    </main>
    <footer id="contact" className="contact-section" tabIndex={-1} inert={menuOpen ? true : undefined}><div className="page-width"><div className="section-topline eyebrow"><span>03 / The next good idea</span><span className="availability"><span className="status-dot" />Available for work</span></div><div className="contact-intro" data-reveal><p>Got a thought, a challenge,<br />or a beautifully rough idea?</p><span className="eyebrow">Let’s make something<br />worth looking at.</span></div><a className="contact-heading" data-reveal href={`mailto:${EMAIL}`}><span>LET’S TALK<span className="contact-period">.</span></span><ArrowUpRight strokeWidth={1} /></a><div className="contact-details"><CopyEmail /><a href="tel:+353858114939">+353 85 811 4939 <ArrowUpRight size={16} /></a><span className="eyebrow">Based in Ireland.<br />Open to possibilities.</span></div><div className="footer-bottom"><a className="wordmark" href="/#home" onClick={e => navigate(e, 'home')}>CRIS<span>©</span></a><span className="eyebrow">© {new Date().getFullYear()} Cristopher PX</span><a className="back-top eyebrow" href="/#home" onClick={e => navigate(e, 'home')}>Back to top <ArrowUp size={16} /></a></div></div></footer>
    <ProjectDialog project={project} onClose={closeProject} />
  </>;
}
