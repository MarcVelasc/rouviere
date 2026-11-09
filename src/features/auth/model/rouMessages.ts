/** Lo que dice Rou al crear la cuenta. Centralizado para que diseño pueda ajustar el tono en un solo lugar. */
export const ROU = {
  hello: '¡Hola! Armemos tu cuenta. Son solo unos datos.',
  name: '¿Cómo te llamo cuando estudiemos juntos?',
  email: 'Con este correo vas a entrar a Rouviere.',
  emailBad: 'Ese correo parece incompleto. ¿Le falta algo?',
  password: 'Que sea solo tuya: 8 caracteres o más y un número.',
  passwordOk: '¡Buena contraseña!',
  caps: 'Ojo: tienes las mayúsculas activadas.',
  career: 'Así te muestro los temas que te tocan.',
  yearEarly: 'Perfecto, empezamos por lo esencial.',
  yearLate: '¡Ya vas avanzado! Igual repasar nunca está de más.',
  missing: (count: number) => `Faltan ${count} datos. Te los marqué en rojo.`,
  loading: 'Un momento, estoy preparando tu cuenta…',
  emailTaken: 'Ese correo ya tiene una cuenta. Prueba con otro o entra con Google.',
  network: 'No pude conectarme. Revisa tu internet e intenta otra vez.',
} as const;
