import { useState } from 'react'
import toast from 'react-hot-toast'

const useLogin = () => {
  const [loading, setLoading] = useState(false)
  const baseURL = import.meta.env.VITE_BASE_URL
  const role_id = 5

  if (!baseURL) {
    toast.error('baseURL is not defined', {
      className: 'toast-error',
    })
    return
  }

  const login = async (username, password) => {
    try {
      setLoading(true)
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role_id,
        }),
      })

      const data = await response.json()     

      if (!response.ok) {
        toast.error(data?.message || 'Invalid username or password.', {
          className: 'toast-error',
        })
        return
      }

      toast.success(data.message || 'Login successful', {
        className: 'toast-success',
      })

      localStorage.setItem('token', data?.data?.token)
      localStorage.setItem('user', JSON.stringify(data?.data?.user))

      return data.data
    } catch {
      toast.error('Oops! Something went wrong during the login process. Please try again.', {
        className: 'toast-error',
      })
    } finally {
      setLoading(false)
    }
  }

  return { login, loading }
}

export default useLogin
