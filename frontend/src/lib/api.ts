const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    // Dynamic IP detection for seamless local mobile testing (fallback)
    return `http://${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};

const API_URL = getApiUrl();

/**
 * Send chat messages to the backend AI agent.
 */
export async function sendChatMessage(
  messages: { role: string; content: string }[],
  lang: string,
  conversationId?: string
) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, lang, conversationId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Network error' } }));
    throw new Error(error.error?.message || `Server error: ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch all doctors, optionally filtered.
 */
export async function fetchDoctors(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_URL}/api/doctors${query}`);
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
}

/**
 * Fetch all hospitals, optionally filtered.
 */
export async function fetchHospitals(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_URL}/api/hospitals${query}`);
  if (!res.ok) throw new Error('Failed to fetch hospitals');
  return res.json();
}
