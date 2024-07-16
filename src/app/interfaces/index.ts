export interface ILoginResponse {
  accessToken: string;
  expiresIn: number
}

export interface IResponse<T> {
  data: T;
}

export interface IUser {
  id?: number;
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  authorities?: IAuthority[];
}

export interface IAuthority {
  authority: string;
}

export interface IFeedBackMessage {
  type?: IFeedbackStatus;
  message?: string;
}

export enum IFeedbackStatus {
  success = "SUCCESS",
  error = "ERROR",
  default = ''
}

export enum IRole {
  admin = "ROLE_ADMIN",
  user = "ROLE_USER",
  superAdmin = 'ROLE_SUPER_ADMIN'
}

export interface IGenre {
  id?: number;
  name?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMovie {
  id?: number;
  name?: string;
  description?: string;
  imageCover?: string;
  video?: string;
  realesedYear?: number;
  duration?: number; //CAMBIAR A STRING
  status?: string;
}