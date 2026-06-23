import { Types } from 'mongoose';
import { FullNannyDto } from '../dto/full-nanny.dto';
import { PublicNannyDto } from '../dto/public-nanny.dto';

type PublicNannyLean = {
  _id: Types.ObjectId;
  name: string;
  avatar_url: string;
  location: string;
  rating: number;
  price_per_hour: number;
  birthday: Date | string;
  experience: string;
  kids_age: string;
  characters?: string[];
  education: string;
  about: string;
};

type FullNannyLean = PublicNannyLean & {
  reviews?: {
    reviewer: string;
    rating: number;
    comment: string;
  }[];
};

const toIsoBirthday = (birthday: Date | string): string => {
  if (birthday instanceof Date) {
    return birthday.toISOString();
  }

  return new Date(birthday).toISOString();
};

export const toPublicNannyDto = (doc: PublicNannyLean): PublicNannyDto => {
  return {
    id: doc._id.toString(),
    name: doc.name,
    avatar_url: doc.avatar_url,
    location: doc.location,
    rating: doc.rating,
    price_per_hour: doc.price_per_hour,
    birthday: toIsoBirthday(doc.birthday),
    experience: doc.experience,
    kids_age: doc.kids_age,
    characters: doc.characters ?? [],
    education: doc.education,
    about: doc.about,
  };
};

export const toFullNannyDto = (doc: FullNannyLean): FullNannyDto => {
  return {
    ...toPublicNannyDto(doc),
    reviews: doc.reviews ?? [],
  };
};
