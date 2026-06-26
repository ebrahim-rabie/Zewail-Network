import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { decorate } from '../lib/profile'

// Pulls the public, privacy-masked directory rows. The `directory_profiles`
// view (see supabase/schema.sql) only ever returns approved members and nulls
// out fields the owner marked private — so guests never receive hidden data.
export function useGraduates() {
  const [graduates, setGraduates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('directory_profiles')
        .select('*')
        .order('full_name', { ascending: true })
      if (!active) return
      if (error) {
        setError(error)
        setGraduates([])
      } else {
        setError(null)
        setGraduates((data || []).map(decorate))
      }
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [])

  return { graduates, loading, error }
}

// A single public profile by id (also from the masked view).
export function useGraduate(id) {
  const [graduate, setGraduate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let active = true
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('directory_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (!active) return
      if (error) {
        setError(error)
        setGraduate(null)
      } else {
        setError(null)
        setGraduate(data ? decorate(data) : null)
      }
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [id])

  return { graduate, loading, error }
}
