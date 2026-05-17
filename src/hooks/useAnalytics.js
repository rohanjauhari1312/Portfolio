const gtag = (...args) => {
  if (typeof window !== 'undefined' && window.gtag) window.gtag(...args)
}

export const trackEvent = (name, params = {}) => {
  gtag('event', name, params)
}

export const trackClick = (label, category = 'click') => {
  gtag('event', 'click', { event_category: category, event_label: label })
}

export const trackSection = (section) => {
  gtag('event', 'section_view', { section_name: section })
}

export const trackExternalLink = (url, label) => {
  gtag('event', 'click', { event_category: 'external_link', event_label: label || url, link_url: url })
}
