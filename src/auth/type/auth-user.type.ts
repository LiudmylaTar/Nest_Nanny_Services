import { Types } from 'mongoose';
export type AuthUser = {
  id: Types.ObjectId;
  name: string;
  email: string;
};