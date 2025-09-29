'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function SupabaseExample() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      alert(error.message)
    } else {
      alert('Проверьте вашу почту для подтверждения регистрации!')
    }
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert(error.message)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert(error.message)
    }
  }

  if (loading) {
    return <div>Загрузка...</div>
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Supabase Аутентификация</h2>
      
      {user ? (
        <div>
          <p className="mb-4">Добро пожаловать, {user.email}!</p>
          <button
            onClick={signOut}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Выйти
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <div className="flex space-x-2">
            <button
              onClick={signIn}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Войти
            </button>
            <button
              onClick={signUp}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Регистрация
            </button>
          </div>
        </div>
      )}
    </div>
  )
}