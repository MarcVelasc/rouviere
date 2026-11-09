import {
  EMPTY_SIGN_UP,
  firstName,
  passwordRules,
  validateField,
  validateSignUp,
  type SignUpValues,
} from './signUp';

const valid: SignUpValues = {
  name: 'Ana Flores',
  email: 'ana.flores@gmail.com',
  password: 'rouviere1',
  career: 'Medicina',
  year: '2',
  terms: true,
};

describe('formulario de crear cuenta', () => {
  it('con todo vacío marca los seis datos', () => {
    expect(Object.keys(validateSignUp(EMPTY_SIGN_UP))).toEqual([
      'name',
      'email',
      'password',
      'career',
      'year',
      'terms',
    ]);
  });

  it('no devuelve errores con datos válidos', () => {
    expect(validateSignUp(valid)).toEqual({});
  });

  it.each(['ana', 'ana@', 'ana@gmail', 'a b@gmail.com'])('rechaza el correo "%s"', (email) => {
    expect(validateField('email', { ...valid, email })).toBe(
      'Revisa tu correo, parece incompleto.',
    );
  });

  it('acepta el correo con espacios alrededor', () => {
    expect(validateField('email', { ...valid, email: '  ana@ucb.edu.bo ' })).toBeUndefined();
  });

  it.each([
    ['corta1', { length: false, number: true }],
    ['sinnumeros', { length: true, number: false }],
    ['rouviere1', { length: true, number: true }],
  ])('reglas de la contraseña "%s"', (password, expected) => {
    expect(passwordRules(password)).toEqual(expected);
  });

  it('un nombre de una sola letra no alcanza', () => {
    expect(validateField('name', { ...valid, name: ' A ' })).toBe('Escribe tu nombre.');
  });

  it('saluda por el primer nombre', () => {
    expect(firstName('  Ana María Flores ')).toBe('Ana');
  });
});
