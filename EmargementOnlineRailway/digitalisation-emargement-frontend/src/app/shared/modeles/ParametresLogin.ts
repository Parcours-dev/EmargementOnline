export interface ParametresLogin {
    email?: string;
  mot_de_passe?: string;
}

export function ParametresLoginFactory(parametresLogin: Partial<ParametresLogin> = {}): ParametresLogin {
    const defaultParametresLogin: ParametresLogin = {
        email: undefined,
      mot_de_passe: undefined,
    };
    return {
        ...defaultParametresLogin,
        ...parametresLogin,
    }
}
