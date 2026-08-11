/**
 * @deprecated Use apiClient directly: import apiClient from './apiClient'
 *
 * This file exists only for backwards compatibility.
 * All three named exports now point to the single gateway-routed client.
 */
import apiClient from './apiClient'

export const userApi = apiClient
export const bookApi = apiClient
export const aiApi   = apiClient
