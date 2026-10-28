import axios from 'axios'

import { env } from '@/shared/config'

export const fetcher = axios.create({
  baseURL: env.apiBaseUrl,
})
