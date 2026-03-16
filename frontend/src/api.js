/**
 * Simple API helper: sends requests to our backend with the auth token if we have one.
 */
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

// Auth
export async function register(email, password) {
  return api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
}
export async function login(email, password) {
  return api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function getProfile() {
  return api('/user/me');
}
export async function updateProfile(data) {
  return api('/user/me', { method: 'PATCH', body: JSON.stringify(data) });
}

// Musical (story)
export async function getMusicals() {
  return api('/musicals');
}
export async function getMusical(id) {
  return api(`/musicals/${id}`);
}
export async function createMusical(data) {
  return api('/musicals', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateMusical(id, data) {
  return api(`/musicals/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteMusical(id) {
  return api(`/musicals/${id}`, { method: 'DELETE' });
}

// Characters
export async function getCharacters(musicalId) {
  return api(`/characters/musical/${musicalId}`);
}
export async function createCharacter(data) {
  return api('/characters', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateCharacter(id, data) {
  return api(`/characters/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteCharacter(id) {
  return api(`/characters/${id}`, { method: 'DELETE' });
}

// Songs
export async function getSongs(musicalId) {
  return api(`/songs/musical/${musicalId}`);
}
export async function createSong(data) {
  return api('/songs', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateSong(id, data) {
  return api(`/songs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteSong(id) {
  return api(`/songs/${id}`, { method: 'DELETE' });
}

// Script
export async function getScriptSections(musicalId) {
  return api(`/script/musical/${musicalId}`);
}
export async function createScriptSection(data) {
  return api('/script', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateScriptSection(id, data) {
  return api(`/script/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

// AI
export async function getAISuggestion(context, type, musicalContext = null) {
  const body = { context, type };
  if (musicalContext && typeof musicalContext === 'object') body.musicalContext = musicalContext;
  return api('/ai/suggest', { method: 'POST', body: JSON.stringify(body) });
}
