import React, { Fragment, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowUpRight, X } from 'lucide-react'
import './project-dialog.css'

import projects from './projects.json'

function ProjectMedia({ media, projectTitle, eager = false, cover = false }) {
  const wide = media.type !== 'image' || media.width / media.height > 1.6
  return (
    <figure className={`project-dialog__figure ${wide ? 'project-dialog__figure--wide' : ''} ${cover ? 'project-dialog__cover' : ''}`}>
      <div className="project-dialog__image-wrap">
        {media.type === 'image' && <img src={`/assets/${media.file}`} alt={media.alt || `${projectTitle} showcase`} width={media.width} height={media.height} loading={eager ? 'eager' : 'lazy'} decoding="async" />}
        {media.type === 'video' && <video controls playsInline preload="metadata" width={media.width} height={media.height} aria-label={media.title}>
          <source src={`/media/${media.file}`} type="video/mp4" />
          <a href={`/media/${media.file}`}>Watch {media.title}</a>
        </video>}
        {media.type === 'embed' && <iframe src={media.src} title={media.title} width={media.width} height={media.height} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen />}
      </div>
      {media.type === 'embed' && <figcaption><a href={media.href} target="_blank" rel="noreferrer">Watch on Facebook</a></figcaption>}
    </figure>
  )
}

function ProjectParagraph({ paragraph }) {
  return <p className="project-dialog__body-copy">{paragraph.runs.map((run, index) => {
    const text = run.italic ? <em>{run.text}</em> : run.text
    return run.bold ? <strong key={index}>{text}</strong> : <Fragment key={index}>{text}</Fragment>
  })}</p>
}

export default function ProjectDialog({ project, onClose }) {
  const dialogRef = useRef(null)
  const titleRef = useRef(null)
  const item = projects.find(item => item.slug === project)

  useEffect(() => {
    if (!item || !dialogRef.current) return undefined

    const dialog = dialogRef.current
    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'
    if (!dialog.open) dialog.showModal()
    dialog.scrollTop = 0
    titleRef.current?.focus({ preventScroll: true })

    return () => {
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [item])

  if (!item) return null

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
          onClose()
        }
      }}
    >
      <div className="project-dialog__bar">
        <button type="button" className="project-dialog__back" onClick={onClose}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to work
        </button>
        <span className="project-dialog__bar-label">CRIS / SELECTED WORK</span>
        <button type="button" className="project-dialog__close" onClick={onClose} aria-label="Close project">
          <X size={23} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <article className="project-dialog__content">
        <header className="project-dialog__intro">
          <div className="project-dialog__eyebrow">
            <span>PROJECT / {item.number}</span>
            <span>{item.discipline}</span>
          </div>
          <h2 id="project-dialog-title" ref={titleRef} tabIndex={-1}>{item.title}</h2>
          <dl className="project-dialog__metadata">
            <div><dt>Industry</dt><dd>{item.industry}</dd></div>
            <div><dt>Experience</dt><dd>{item.discipline}</dd></div>
            <div><dt>Year</dt><dd>{item.year}</dd></div>
          </dl>
        </header>

        <ProjectMedia media={item.cover} projectTitle={item.title} eager cover />

        {item.sections.map((section, index) => <Fragment key={section.heading}>
          <section className="project-dialog__story" aria-labelledby={`project-dialog-section-${index}`}>
            <h3 id={`project-dialog-section-${index}`} className="project-dialog__section-label">{section.heading}</h3>
            <div>{section.paragraphs.map((paragraph, paragraphIndex) => <ProjectParagraph key={paragraphIndex} paragraph={paragraph} />)}</div>
          </section>
          {section.media.length > 0 && <div className={`project-dialog__gallery ${section.media.length === 1 ? 'project-dialog__gallery--single' : ''}`}>
            {section.media.map(media => <ProjectMedia key={media.file || media.src} media={media} projectTitle={item.title} />)}
          </div>}
        </Fragment>)}

        <footer className="project-dialog__footer">
          <p className="project-dialog__section-label">Curious about what we can create together?<br />Let’s bring something extraordinary to life!</p>
          <a href="mailto:flippedcris@gmail.com" className="project-dialog__contact">
            Get in Touch
            <ArrowUpRight aria-hidden="true" />
          </a>
          <button type="button" className="project-dialog__back" onClick={onClose}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to all work
          </button>
        </footer>
      </article>
    </dialog>
  )
}
