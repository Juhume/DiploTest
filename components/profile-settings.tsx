"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/

type ProfileSettingsProps = {
  initialUsername: string
  initialEmail: string
}

export function ProfileSettings({ initialUsername, initialEmail }: ProfileSettingsProps) {
  const router = useRouter()
  const [savedUsername, setSavedUsername] = useState(initialUsername)
  const [username, setUsername] = useState(initialUsername)
  const [usernameLoading, setUsernameLoading] = useState(false)

  const [savedEmail, setSavedEmail] = useState(initialEmail)
  const [email, setEmail] = useState(initialEmail)
  const [confirmEmail, setConfirmEmail] = useState(initialEmail)
  const [emailPassword, setEmailPassword] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const syncEmail = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      const userEmail = data.user?.email
      if (error || !data.user || !userEmail) {
        return
      }

      if (userEmail !== savedEmail) {
        await supabase.from("profiles").update({ email: userEmail }).eq("id", data.user.id)
        setSavedEmail(userEmail)
        setEmail(userEmail)
        setConfirmEmail(userEmail)
        setPendingEmail(null)
      }
    }

    syncEmail()
  }, [savedEmail])

  const handleUsernameSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = username.trim().toLowerCase()

    if (!USERNAME_REGEX.test(normalized)) {
      toast.error("El nombre de usuario debe tener 3-20 caracteres y solo letras, números, guiones o guión bajo")
      return
    }

    if (normalized === savedUsername) {
      toast.info("El nombre de usuario no ha cambiado")
      return
    }

    setUsernameLoading(true)

    try {
      const response = await fetch("/api/profile/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: normalized }),
      })

      const data = await response.json()
      if (!response.ok) {
        if (response.status === 409 || data?.code === "USERNAME_TAKEN") {
          toast.error("Este nombre de usuario ya está en uso")
          return
        }
        toast.error(data?.error || "No se pudo actualizar el nombre de usuario")
        return
      }

      const supabase = createClient()
      await supabase.auth.updateUser({
        data: {
          display_name: normalized,
          username: normalized,
        },
      })

      setSavedUsername(normalized)
      setUsername(normalized)
      router.refresh()
      toast.success("Nombre de usuario actualizado")
    } catch (error) {
      toast.error("No se pudo actualizar el nombre de usuario")
    } finally {
      setUsernameLoading(false)
    }
  }

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error("Introduce un correo válido")
      return
    }

    if (email.trim() !== confirmEmail.trim()) {
      toast.error("Los correos no coinciden")
      return
    }

    if (email.trim().toLowerCase() === savedEmail.toLowerCase()) {
      toast.info("El correo no ha cambiado")
      return
    }

    if (!emailPassword) {
      toast.error("Introduce tu contraseña actual")
      return
    }

    setEmailLoading(true)

    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()

      if (!data.user?.email) {
        toast.error("No se pudo verificar tu usuario")
        return
      }

      const { error: passwordError } = await supabase.auth.signInWithPassword({
        email: data.user.email,
        password: emailPassword,
      })

      if (passwordError) {
        toast.error("La contraseña actual no es correcta")
        return
      }

      const { data: updated, error } = await supabase.auth.updateUser({
        email: email.trim(),
      })

      if (error) {
        toast.error(error.message || "No se pudo actualizar el correo")
        return
      }

      const updatedUser: any = updated.user
      const currentEmail = updatedUser?.email || data.user.email
      const nextPending = updatedUser?.new_email || null

      await supabase.from("profiles").update({ email: currentEmail }).eq("id", data.user.id)

      setSavedEmail(currentEmail)
      setEmail(currentEmail)
      setConfirmEmail(currentEmail)
      setPendingEmail(nextPending)
      setEmailPassword("")
      router.refresh()

      if (nextPending) {
        toast.success("Te enviamos un correo para confirmar el cambio")
      } else {
        toast.success("Correo actualizado")
      }
    } catch (error) {
      toast.error("No se pudo actualizar el correo")
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentPassword) {
      toast.error("Introduce tu contraseña actual")
      return
    }

    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (currentPassword === newPassword) {
      toast.error("La nueva contraseña debe ser diferente")
      return
    }

    setPasswordLoading(true)

    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()

      if (!data.user?.email) {
        toast.error("No se pudo verificar tu usuario")
        return
      }

      const { error: passwordError } = await supabase.auth.signInWithPassword({
        email: data.user.email,
        password: currentPassword,
      })

      if (passwordError) {
        toast.error("La contraseña actual no es correcta")
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        toast.error(error.message || "No se pudo actualizar la contraseña")
        return
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Contraseña actualizada")
    } catch (error) {
      toast.error("No se pudo actualizar la contraseña")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nombre de usuario</CardTitle>
          <CardDescription>
            Se usa para iniciar sesión y para mostrar tu identidad en la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="tu_usuario"
                autoComplete="username"
                disabled={usernameLoading}
              />
              <p className="text-xs text-muted-foreground">3-20 caracteres, letras, números, guiones o guion bajo.</p>
            </div>
            <Button type="submit" disabled={usernameLoading}>
              {usernameLoading ? "Guardando..." : "Actualizar nombre de usuario"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Correo electrónico</CardTitle>
          <CardDescription>
            Cambia tu correo electrónico con verificación de seguridad. Te enviaremos un enlace de confirmación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingEmail && (
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                Cambio pendiente: confirma el enlace enviado a {pendingEmail}.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Nuevo correo</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nuevo@email.com"
                  autoComplete="email"
                  disabled={emailLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmEmail">Confirmar correo</Label>
                <Input
                  id="confirmEmail"
                  type="email"
                  value={confirmEmail}
                  onChange={(event) => setConfirmEmail(event.target.value)}
                  placeholder="nuevo@email.com"
                  autoComplete="email"
                  disabled={emailLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="emailPassword">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="emailPassword"
                  type={showEmailPassword ? "text" : "password"}
                  value={emailPassword}
                  onChange={(event) => setEmailPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={emailLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={emailLoading}
                >
                  {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={emailLoading}>
              {emailLoading ? "Actualizando..." : "Actualizar correo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contraseña</CardTitle>
          <CardDescription>Actualiza tu contraseña con una validación adicional.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={passwordLoading}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={passwordLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={passwordLoading}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={passwordLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={passwordLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Mínimo 6 caracteres. Usa una contraseña única.</p>
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Guardando..." : "Actualizar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
