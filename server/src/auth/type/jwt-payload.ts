export interface JwtPayload {
  sub: number;      // member_id
  email: string;
  role: 'admin' | 'member';
}

export interface LoginResponse {
  access_token: string;
  user: {
    member_id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: string;
    status: string;
    created_at: string;
  };
}
