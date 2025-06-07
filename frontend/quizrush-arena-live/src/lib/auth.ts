import api from './api'

export interface LoginRequest {
    username : string
    password : string
}

export interface SignUpRequest {
    username : string
    password : string
}

export interface LoginResponse {
    token : string
}

export const authService = {
    
    login : async (credentials : LoginRequest) : Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/host/login',credentials);
        return response.data;
    },

    signUp : async (userData : SignUpRequest) : Promise<void> => {
        await api.post('/host/signup',userData)
    },

    logout : () : void => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
    },

    isAuthenticated : () : boolean => {
        return !!localStorage.getItem('token');
    },

    getUserId: () : string | null => {
        return localStorage.getItem('userId');
    }
}
