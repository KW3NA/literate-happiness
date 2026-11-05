// export const API_BASE_URL = "http://0.0.0.0:8000/api"; // replace with your Laravel machine's IP


import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PORT = 8000;

//const DEFAULT_BASE = 'http://192.168.8.104:8000';

const DEFAULT_BASE =
    Platform.OS === 'android'
        ? `http://172.16.5.128:${PORT}`
        : `http://172.16.5.128:${PORT}`; //localhost - previously

// During physical device testing, temporarily hardcode your PC's LAN IP:
// const DEFAULT_BASE = 'http://192.168.0.42:8000';

export const API_BASE = DEFAULT_BASE + '/api';

async function parseBody(res: Response) {
    const text = await res.text();
    try { return text ? JSON.parse(text) : null; } catch { return text || null; }
}

// export async function apiPost(path: string, body: any, token?: string) {
//     const res = await fetch(`${API_BASE}${path}`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify(body),
//     });

//     const payload = await parseBody(res);

//     if (!res.ok) {
//         const msg = (payload && (payload.message || payload.error)) || `HTTP ${res.status}`;
//         throw new Error(msg);
//     }

//     return payload;

//     // const json = await res.json().catch(() => null);
//     // if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
//     // return json;
// }

//New apiPost
export async function apiPost<T = any>(path: string, body?: any, token?: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body ?? {}),
    });
    const payload = await parseBody(res);
    if (!res.ok) throw new Error((payload as any)?.message || `HTTP ${res.status}`);
    return payload as T; // may be null if 204
}

// export async function apiGet(path: string, token?: string) {
//     const res = await fetch(`${API_BASE}${path}`, {
//         headers: {
//             'Accept': 'application/json',
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//     });
//     const payload = await parseBody(res);
//     if (!res.ok) {
//         const msg = (payload && (payload.message || payload.error)) || `HTTP ${res.status}`;
//         throw new Error(msg);
//     }
//     return payload;
// }

//New apiGet

export async function apiGet<T = any>(path: string, token?: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const payload = await parseBody(res);
    if (!res.ok) throw new Error((payload as any)?.message || `HTTP ${res.status}`);
    return payload as T;
}

// export async function authGet(path: string) {
//     const token = await AsyncStorage.getItem('token');
//     return apiGet(path, token ?? undefined);
// }

// export async function authGet<T = any>(path: string) {
//     const token = await AsyncStorage.getItem('token');
//     const res = await fetch(`${API_BASE}${path}`, {
//         headers: {
//             Accept: 'application/json',
//             Authorization: token ? `Bearer ${token}` : '',
//         },
//     });
//     const json = await res.json().catch(() => null);
//     if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
//     return json as T;
// }

//New authGet

export async function authGet<T = any>(path: string): Promise<T> {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('unauthorized');
    return apiGet<T>(path, token);
}

// export async function authPost(path: string, body: any) {
//     const token = await AsyncStorage.getItem('token');
//     return apiPost(path, body, token ?? undefined);
// }

// export async function authPost(path: string, body?: any) {
//     const token = await AsyncStorage.getItem('token');
//     const res = await fetch(`${API_BASE}${path}`, {
//         method: 'POST',
//         headers: {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token ?? ''}`,
//         },
//         body: body ? JSON.stringify(body) : undefined,
//     });
//     const json = await res.json().catch(() => null);
//     if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
//     return json;
// }

//New authPost

export async function authPost<T = any>(path: string, body?: any): Promise<T> {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('unauthorized');
    return apiPost<T>(path, body ?? {}, token);
}



// export async function authUpload(path: string, form: FormData) {
//     const token = await AsyncStorage.getItem('token');
//     const res = await fetch(`${API_BASE}${path}`, {
//         method: 'POST',
//         headers: {
//             Accept: 'application/json',
//             Authorization: `Bearer ${token ?? ''}`,
//             // DO NOT set Content-Type for FormData; RN sets boundary automatically
//         },
//         body: form,
//     });
//     const json = await res.json().catch(() => null);
//     if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
//     return json;
// }

//New authUpload

export async function authUpload<T = any>(path: string, form: FormData): Promise<T> {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('unauthorized');
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      // DON'T set Content-Type for FormData; RN will add boundary.
    },
    body: form,
  });
  const payload = await parseBody(res);
  if (!res.ok) throw new Error((payload as any)?.message || `HTTP ${res.status}`);
  return payload as T;
}

// Email Verification API Functions
export interface EmailVerificationResponse {
  message: string;
  status: 'success' | 'error';
  data?: {
    email: string;
    verified: boolean;
    otp_sent_at?: string;
  };
}

export interface SendOtpResponse {
  message: string;
  status: 'success' | 'error';
  data?: {
    email: string;
    otp_sent_at: string;
    expires_at: string;
  };
}

export interface VerifyOtpResponse {
  message: string;
  status: 'success' | 'error';
  data?: {
    email: string;
    verified: boolean;
    verified_at: string;
  };
}

// Send OTP for email verification
export async function sendEmailOtp(): Promise<SendOtpResponse> {
  return authPost<SendOtpResponse>('/mobile/email/send-otp');
}

// Verify OTP for email verification
export async function verifyEmailOtp(otp: string): Promise<VerifyOtpResponse> {
  return authPost<VerifyOtpResponse>('/mobile/email/verify-otp', { otp });
}

// 2FA API Functions
export interface TwoFactorResponse {
  message: string;
  status: 'success' | 'error';
  two_factor_required?: boolean;
  two_factor_verified?: boolean;
  email?: string;
  user?: any;
  token?: string;
  token_type?: string;
}

// Send 2FA OTP
export async function send2FAOtp(email: string): Promise<TwoFactorResponse> {
  return apiPost<TwoFactorResponse>('/mobile/2fa/send-otp', { email });
}

// Verify 2FA OTP
export async function verify2FAOtp(email: string, otp: string): Promise<TwoFactorResponse> {
  return apiPost<TwoFactorResponse>('/mobile/2fa/verify-otp', { email, otp });
}

// Logout function
export async function logout(): Promise<void> {
  return authPost<void>('/mobile/logout');
}

// Password Reset API Functions
export interface PasswordResetResponse {
  message: string;
  status: 'success' | 'error';
  data?: {
    email: string;
    otp_sent_at?: string;
    expires_at?: string;
    verified?: boolean;
    verified_at?: string;
    password_reset_at?: string;
    retry_after?: number;
  };
  errors?: any;
}

// Send password reset OTP
export async function sendPasswordResetOtp(email: string): Promise<PasswordResetResponse> {
  return apiPost<PasswordResetResponse>('/mobile/password/send-reset-otp', { email });
}

// Verify password reset OTP
export async function verifyPasswordResetOtp(email: string, otp: string): Promise<PasswordResetResponse> {
  return apiPost<PasswordResetResponse>('/mobile/password/verify-reset-otp', { email, otp });
}

// Reset password with OTP
export async function resetPassword(email: string, otp: string, password: string, passwordConfirmation: string): Promise<PasswordResetResponse> {
  return apiPost<PasswordResetResponse>('/mobile/password/reset', { 
    email, 
    otp, 
    password, 
    password_confirmation: passwordConfirmation 
  });
}

// Profile Update API Functions
export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  location?: string;
}

export interface ProfileUpdateResponse {
  user: any;
  message: string;
}

// Update user profile
export async function updateProfile(data: ProfileUpdateRequest): Promise<ProfileUpdateResponse> {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('unauthorized');
  
  const res = await fetch(`${API_BASE}/mobile/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  const payload = await parseBody(res);
  if (!res.ok) throw new Error((payload as any)?.message || `HTTP ${res.status}`);
  return payload as ProfileUpdateResponse;
}

// Phone Authentication API Functions
export interface PhoneAuthResponse {
  message: string;
  status: 'success' | 'error';
  data?: {
    phone_number: string;
    country_code: string;
    expires_at?: string;
  };
  user?: any;
  token?: string;
  token_type?: string;
}

// Send OTP for phone registration
export async function sendPhoneRegistrationOtp(phoneNumber: string, countryCode: string = '+27'): Promise<PhoneAuthResponse> {
  return apiPost<PhoneAuthResponse>('/mobile/phone/register/send-otp', { 
    phone_number: phoneNumber,
    country_code: countryCode 
  });
}

// Verify OTP and complete phone registration
export async function verifyPhoneRegistrationOtp(
  phoneNumber: string,
  otp: string,
  name: string,
  password: string,
  countryCode: string = '+27'
): Promise<PhoneAuthResponse> {
  return apiPost<PhoneAuthResponse>('/mobile/phone/register/verify-otp', { 
    phone_number: phoneNumber,
    country_code: countryCode,
    otp,
    name,
    password 
  });
}

// Send OTP for phone login
export async function sendPhoneLoginOtp(phoneNumber: string, countryCode: string = '+27'): Promise<PhoneAuthResponse> {
  return apiPost<PhoneAuthResponse>('/mobile/phone/login/send-otp', { 
    phone_number: phoneNumber,
    country_code: countryCode 
  });
}

// Verify OTP and complete phone login
export async function verifyPhoneLoginOtp(
  phoneNumber: string,
  otp: string,
  countryCode: string = '+27'
): Promise<PhoneAuthResponse> {
  return apiPost<PhoneAuthResponse>('/mobile/phone/login/verify-otp', { 
    phone_number: phoneNumber,
    country_code: countryCode,
    otp 
  });
}

// Resend phone OTP
export async function resendPhoneOtp(
  phoneNumber: string,
  type: 'registration' | 'login',
  countryCode: string = '+27'
): Promise<PhoneAuthResponse> {
  return apiPost<PhoneAuthResponse>('/mobile/phone/resend-otp', { 
    phone_number: phoneNumber,
    country_code: countryCode,
    type 
  });
}