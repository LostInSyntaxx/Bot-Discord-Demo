const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: () => window.location.href = `${API_URL}/auth/discord`,
  
  // User
  getUser: () => fetchAPI('/auth/me'),
  
  // Guilds
  getGuilds: () => fetchAPI('/guilds'),
  getGuild: (guildId: string) => fetchAPI(`/guilds/${guildId}`),
  
  // Stats
  getBotStats: () => fetchAPI('/stats/bot'),
  getGuildStats: (guildId: string) => fetchAPI(`/stats/guild/${guildId}`),
  
  // Music
  getMusicStatus: (guildId: string) => fetchAPI(`/music/${guildId}`),
  controlMusic: (guildId: string, action: string, data?: any) => 
    fetchAPI(`/music/${guildId}/${action}`, { 
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Moderation
  getModerationConfig: (guildId: string) => fetchAPI(`/moderation/${guildId}`),
  updateModerationConfig: (guildId: string, config: any) => 
    fetchAPI(`/moderation/${guildId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
  
  // Welcome
  getWelcomeConfig: (guildId: string) => fetchAPI(`/welcome/${guildId}`),
  updateWelcomeConfig: (guildId: string, config: any) => 
    fetchAPI(`/welcome/${guildId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
  
  // Auto Role
  getAutoRoleConfig: (guildId: string) => fetchAPI(`/autorole/${guildId}`),
  updateAutoRoleConfig: (guildId: string, config: any) => 
    fetchAPI(`/autorole/${guildId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
  
  // Logs
  getLogsConfig: (guildId: string) => fetchAPI(`/logs/${guildId}`),
  updateLogsConfig: (guildId: string, config: any) => 
    fetchAPI(`/logs/${guildId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
  getLogs: (guildId: string, limit: number = 50) => 
    fetchAPI(`/logs/${guildId}/entries?limit=${limit}`),
};
