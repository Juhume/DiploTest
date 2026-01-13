import { describe, it, expect } from 'vitest'

/**
 * Tests para la lógica de validación de autenticación.
 * Estos tests verifican las reglas de validación sin depender de Supabase.
 */

// Regex de validación de username (extraído de la API)
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/

// Funciones de validación puras para testing
function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'El nombre de usuario es obligatorio' }
  }
  if (!USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      error: 'El nombre de usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números, guiones y guiones bajos',
    }
  }
  return { valid: true }
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'La contraseña es obligatoria' }
  }
  if (password.length < 6) {
    return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' }
  }
  return { valid: true }
}

function validatePasswordsMatch(password: string, repeatPassword: string): { valid: boolean; error?: string } {
  if (password !== repeatPassword) {
    return { valid: false, error: 'Las contraseñas no coinciden' }
  }
  return { valid: true }
}

function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'El email es obligatorio' }
  }
  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'El email no es válido' }
  }
  return { valid: true }
}

function isEmail(input: string): boolean {
  return input.includes('@')
}

function normalizeUsername(username: string): string {
  return username.toLowerCase()
}

describe('Validación de Username', () => {
  describe('Usernames válidos', () => {
    it('debería aceptar username de 3 caracteres', () => {
      expect(validateUsername('abc').valid).toBe(true)
    })

    it('debería aceptar username de 20 caracteres', () => {
      expect(validateUsername('a'.repeat(20)).valid).toBe(true)
    })

    it('debería aceptar username con letras minúsculas', () => {
      expect(validateUsername('usuario').valid).toBe(true)
    })

    it('debería aceptar username con letras mayúsculas', () => {
      expect(validateUsername('Usuario').valid).toBe(true)
    })

    it('debería aceptar username con números', () => {
      expect(validateUsername('usuario123').valid).toBe(true)
    })

    it('debería aceptar username con guiones', () => {
      expect(validateUsername('usuario-test').valid).toBe(true)
    })

    it('debería aceptar username con guiones bajos', () => {
      expect(validateUsername('usuario_test').valid).toBe(true)
    })

    it('debería aceptar username combinando todos los caracteres permitidos', () => {
      expect(validateUsername('User_name-123').valid).toBe(true)
    })
  })

  describe('Usernames inválidos', () => {
    it('debería rechazar username vacío', () => {
      const result = validateUsername('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('El nombre de usuario es obligatorio')
    })

    it('debería rechazar username de 2 caracteres (muy corto)', () => {
      const result = validateUsername('ab')
      expect(result.valid).toBe(false)
    })

    it('debería rechazar username de 21 caracteres (muy largo)', () => {
      const result = validateUsername('a'.repeat(21))
      expect(result.valid).toBe(false)
    })

    it('debería rechazar username con espacios', () => {
      expect(validateUsername('usuario test').valid).toBe(false)
    })

    it('debería rechazar username con caracteres especiales', () => {
      expect(validateUsername('usuario@test').valid).toBe(false)
      expect(validateUsername('usuario.test').valid).toBe(false)
      expect(validateUsername('usuario#test').valid).toBe(false)
      expect(validateUsername('usuario$test').valid).toBe(false)
    })

    it('debería rechazar username con acentos', () => {
      expect(validateUsername('usuário').valid).toBe(false)
      expect(validateUsername('niño').valid).toBe(false)
    })
  })
})

describe('Validación de Contraseña', () => {
  describe('Contraseñas válidas', () => {
    it('debería aceptar contraseña de exactamente 6 caracteres', () => {
      expect(validatePassword('123456').valid).toBe(true)
    })

    it('debería aceptar contraseñas largas', () => {
      expect(validatePassword('contraseña_muy_segura_123!').valid).toBe(true)
    })

    it('debería aceptar contraseñas con caracteres especiales', () => {
      expect(validatePassword('p@ssw0rd!').valid).toBe(true)
    })
  })

  describe('Contraseñas inválidas', () => {
    it('debería rechazar contraseña vacía', () => {
      const result = validatePassword('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('La contraseña es obligatoria')
    })

    it('debería rechazar contraseña de 5 caracteres', () => {
      const result = validatePassword('12345')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('La contraseña debe tener al menos 6 caracteres')
    })

    it('debería rechazar contraseña de 1 caracter', () => {
      expect(validatePassword('a').valid).toBe(false)
    })
  })
})

describe('Validación de coincidencia de contraseñas', () => {
  it('debería pasar cuando las contraseñas coinciden', () => {
    expect(validatePasswordsMatch('password123', 'password123').valid).toBe(true)
  })

  it('debería fallar cuando las contraseñas no coinciden', () => {
    const result = validatePasswordsMatch('password123', 'password456')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Las contraseñas no coinciden')
  })

  it('debería ser case-sensitive', () => {
    expect(validatePasswordsMatch('Password', 'password').valid).toBe(false)
  })

  it('debería fallar con contraseñas vacías diferentes', () => {
    expect(validatePasswordsMatch('', 'something').valid).toBe(false)
  })
})

describe('Validación de Email', () => {
  describe('Emails válidos', () => {
    it('debería aceptar email estándar', () => {
      expect(validateEmail('usuario@example.com').valid).toBe(true)
    })

    it('debería aceptar email con subdominio', () => {
      expect(validateEmail('usuario@mail.example.com').valid).toBe(true)
    })

    it('debería aceptar email con puntos en el nombre', () => {
      expect(validateEmail('nombre.apellido@example.com').valid).toBe(true)
    })

    it('debería aceptar email con números', () => {
      expect(validateEmail('usuario123@example.com').valid).toBe(true)
    })

    it('debería aceptar email con guiones', () => {
      expect(validateEmail('user-name@example.com').valid).toBe(true)
    })
  })

  describe('Emails inválidos', () => {
    it('debería rechazar email vacío', () => {
      const result = validateEmail('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('El email es obligatorio')
    })

    it('debería rechazar email sin @', () => {
      expect(validateEmail('usuarioexample.com').valid).toBe(false)
    })

    it('debería rechazar email sin dominio', () => {
      expect(validateEmail('usuario@').valid).toBe(false)
    })

    it('debería rechazar email sin nombre', () => {
      expect(validateEmail('@example.com').valid).toBe(false)
    })

    it('debería rechazar email con espacios', () => {
      expect(validateEmail('usuario @example.com').valid).toBe(false)
    })
  })
})

describe('Detección de email vs username', () => {
  it('debería detectar email cuando contiene @', () => {
    expect(isEmail('usuario@example.com')).toBe(true)
  })

  it('debería detectar username cuando no contiene @', () => {
    expect(isEmail('usuario123')).toBe(false)
  })

  it('debería manejar casos edge', () => {
    expect(isEmail('@')).toBe(true) // Contiene @, aunque es inválido
    expect(isEmail('')).toBe(false)
  })
})

describe('Normalización de username', () => {
  it('debería convertir a minúsculas', () => {
    expect(normalizeUsername('Usuario')).toBe('usuario')
    expect(normalizeUsername('USUARIO')).toBe('usuario')
    expect(normalizeUsername('UsUaRiO')).toBe('usuario')
  })

  it('debería mantener números y caracteres especiales', () => {
    expect(normalizeUsername('Usuario_123')).toBe('usuario_123')
    expect(normalizeUsername('User-Name')).toBe('user-name')
  })
})

describe('Flujo completo de validación de signup', () => {
  function validateSignupInput(data: {
    username: string
    email: string
    password: string
    repeatPassword: string
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    const usernameResult = validateUsername(data.username)
    if (!usernameResult.valid && usernameResult.error) {
      errors.push(usernameResult.error)
    }

    const emailResult = validateEmail(data.email)
    if (!emailResult.valid && emailResult.error) {
      errors.push(emailResult.error)
    }

    const passwordResult = validatePassword(data.password)
    if (!passwordResult.valid && passwordResult.error) {
      errors.push(passwordResult.error)
    }

    const matchResult = validatePasswordsMatch(data.password, data.repeatPassword)
    if (!matchResult.valid && matchResult.error) {
      errors.push(matchResult.error)
    }

    return { valid: errors.length === 0, errors }
  }

  it('debería validar un registro completo válido', () => {
    const result = validateSignupInput({
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      repeatPassword: 'password123',
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('debería rechazar registro con todos los campos vacíos', () => {
    const result = validateSignupInput({
      username: '',
      email: '',
      password: '',
      repeatPassword: '',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('debería acumular múltiples errores', () => {
    const result = validateSignupInput({
      username: 'ab', // muy corto
      email: 'invalid-email', // sin @
      password: '12345', // muy corta
      repeatPassword: '54321', // no coincide
    })

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBe(4)
  })
})

describe('Flujo completo de validación de login', () => {
  function validateLoginInput(data: {
    email: string
    password: string
  }): { valid: boolean; error?: string; isEmailLogin: boolean } {
    if (!data.email) {
      return { valid: false, error: 'Email/Usuario es obligatorio', isEmailLogin: false }
    }

    if (!data.password) {
      return { valid: false, error: 'Contraseña es obligatoria', isEmailLogin: false }
    }

    return { valid: true, isEmailLogin: isEmail(data.email) }
  }

  it('debería validar login con email', () => {
    const result = validateLoginInput({
      email: 'usuario@example.com',
      password: 'password123',
    })

    expect(result.valid).toBe(true)
    expect(result.isEmailLogin).toBe(true)
  })

  it('debería validar login con username', () => {
    const result = validateLoginInput({
      email: 'username123',
      password: 'password123',
    })

    expect(result.valid).toBe(true)
    expect(result.isEmailLogin).toBe(false)
  })

  it('debería rechazar login sin email/username', () => {
    const result = validateLoginInput({
      email: '',
      password: 'password123',
    })

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Email/Usuario es obligatorio')
  })

  it('debería rechazar login sin contraseña', () => {
    const result = validateLoginInput({
      email: 'usuario@example.com',
      password: '',
    })

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Contraseña es obligatoria')
  })
})
