export type UserDTO = {
    id: number;
    name: string;
    email: string;
    role?: 'admin' | 'practitioner' | 'citizen';
    profile_picture: string | null;
    profile_picture_url: string | null; // from $appends in User.php
    created_at?: string;
    updated_at?: string;
    email_verified_at?: string | null;
};

export type AuthMeResponse = { user: UserDTO };
