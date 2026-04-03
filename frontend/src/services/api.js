const LEETCODE_BASE_URL = '/api/leetcode'
const AI_REPORT_URL = '/api/ai/report'

async function request(url, options = {}) {
  let response
  const method = options.method || 'GET'
  const isJsonBody = options.body !== undefined

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    })
  } catch (error) {
    throw new Error('Unable to reach the server. Check that the backend is running on http://localhost:8080.')
  }

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      (isJson && (body.message || body.error || body.details)) ||
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

export function generateAiReport(payload) {
  return request(AI_REPORT_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
