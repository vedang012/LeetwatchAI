const LEETCODE_BASE_URL = '/api/leetcode'

async function request(url, options = {}) {
  let response
  const method = options.method || 'GET'
  const hasBody = options.body !== undefined
  const accept = options.accept || 'application/json'

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Accept: accept,
        ...(hasBody ? { 'Content-Type': options.contentType || 'application/json' } : {}),
        ...(options.headers || {}),
      },
    })
  } catch (error) {
    throw new Error('Unable to reach the server. Check that the backend is running on http://localhost:8080.')
  }

  const contentType = response.headers.get('content-type') || ''
  const shouldReadText = options.responseType === 'text' || contentType.startsWith('text/') || contentType.includes('markdown')
  const body = shouldReadText ? await response.text() : await response.json()

  if (!response.ok) {
    const message =
      (!shouldReadText && (body.message || body.error || body.details)) ||
      (typeof body === 'string' && body) ||
      `Request failed with status ${response.status}`

    throw new Error(message)
  }

  return body
}

export function getProfile(username) {
  return request(`${LEETCODE_BASE_URL}/users/${encodeURIComponent(username)}/profile`)
}

export function getSubmissionCalendar(username) {
  return request(`${LEETCODE_BASE_URL}/users/${encodeURIComponent(username)}/submission-calendar`)
}

export function getTagStats(username) {
  return request(`${LEETCODE_BASE_URL}/users/${encodeURIComponent(username)}/tag-stats`)
}

export function getRecentSubmissions(username) {
  return request(`${LEETCODE_BASE_URL}/users/${encodeURIComponent(username)}/recent-submissions`)
}

export function generateAiReport(username) {
  return request(`${LEETCODE_BASE_URL}/ai?username=${encodeURIComponent(username)}`, {
    accept: 'text/markdown, text/plain;q=0.9, */*;q=0.8',
    responseType: 'text',
  })
}
