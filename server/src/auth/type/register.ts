export type Register = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
};

export type Login = {
  email: string;
  password: string;
};

export type UpdateProfile = {
  first_name?: string;
  last_name?: string;
  phone?: string;
};

export type ChangePassword = {
  old_password: string;
  new_password: string;
};