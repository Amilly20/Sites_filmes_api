import { z } from 'zod';

class UserValidationSchema {
  static registerSchema = z.object({
    name: z.string({
      required_error: 'Campo nome é obrigatório!',
      invalid_type_error: 'Formato do nome inválido, deve ser string!',
    })
    .min(2, {
      message: "O nome deve possuir no mínimo 2 caracteres!"
    })
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, {
      message: "O nome deve conter apenas letras e espaços, sem números ou símbolos!"
    }),
    
    email: z.string({
      required_error: 'Campo email é obrigatório!',
      invalid_type_error: 'Formato do email inválido, deve ser string!',
    })
    .email({
      message: 'Email inválido!',
    })
    .refine(
      (email) => {
        const validProviders = [
          'gmail.com',
          'hotmail.com',
          'outlook.com',
          'yahoo.com',
          'icloud.com',
          'live.com',
          'msn.com',
          'uol.com.br',
          'bol.com.br',
          'terra.com.br',
          'ig.com.br',
          'globo.com',
          'r7.com'
        ];
        const emailDomain = email.toLowerCase().split('@')[1];
        return validProviders.includes(emailDomain);
      },
      {
        message: "Email deve ser de um provedor válido (Gmail, Hotmail, Outlook, Yahoo, iCloud, Live, UOL, Bol, Terra, IG, Globo, R7)"
      }
    ),
    
    password: z.string({
      required_error: 'Campo senha é obrigatório!',
      invalid_type_error: 'Formato da senha inválido, deve ser string!'
    })
    .min(8, {
      message: "A senha deve possuir no mínimo 8 caracteres!"
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s])\S+$/, {
      message: "A senha deve conter pelo menos: 1 letra minúscula, 1 letra maiúscula, 1 número, 1 caractere especial e não deve conter espaços!"
    })
  });
}

export default UserValidationSchema;