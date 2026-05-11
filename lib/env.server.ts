if (typeof window !== 'undefined') {
  throw new Error('lib/env.server.ts must not be imported from client-side code')
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`)
  }
  return value
}

export const serverEnv = {
  OPENAI_API_KEY: requireEnv('OPENAI_API_KEY'),
} as const
