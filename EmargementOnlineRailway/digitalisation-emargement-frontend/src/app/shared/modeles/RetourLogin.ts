export interface RetourLogin {
    token?: string;
    role?: string;
    nom?: string,
    prenom?: string,
}

export function RetourLoginFactory(retourLogin: Partial<RetourLogin> = {}): RetourLogin {
    const defaultRetourLogin: RetourLogin = {
        token: undefined,
        role: undefined,
        nom: undefined,
        prenom: undefined,
    };
    return {
        ...defaultRetourLogin,
        ...retourLogin,
    }
}