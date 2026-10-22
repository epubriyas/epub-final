/** Only the established production domain is eligible for indexing. */
function siteCanBeIndexed(origin, environment) {
  if (environment === 'preview' || environment === 'development') return false
  try {
    const url = new URL(origin)
    return (
      url.protocol === 'https:' && ['epubtrans.com', 'www.epubtrans.com'].includes(url.hostname)
    )
  } catch {
    return false
  }
}

module.exports = { siteCanBeIndexed }
