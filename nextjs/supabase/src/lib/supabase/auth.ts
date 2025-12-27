import { createClient } from "./client"

export const SupabaseAuth = {
  async sendOTP(email: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })
    if (error) throw error
    return { success: true }
  },

  async verifyOTP(email: string, token: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
}
