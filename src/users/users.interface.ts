export interface IUser {
  _id: string;
  name: string;
  avatar?: string;
  email: string;
  age?: number;
  gender?: string;
  address?: string;
  company?: {
    _id: string;
    name: string;
  };
  role: {
    _id: string;
    name: string;
  };
  permissions?: {
    _id: string;
    name: string;
    apiPath: string;
    module: string;
  }[];
}
