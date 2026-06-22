import { PublicNannyDto } from "./public-nanny.dto";
import { ReviewDto } from "./review-nanny.dto";

export class FullNannyDto extends PublicNannyDto {
  reviews: ReviewDto[];
}