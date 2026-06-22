import { ApiProperty } from '@nestjs/swagger';

export class PublicNannyDto {
  @ApiProperty({ example: '6a32978e650712937ded460b' })
  id: string;

  @ApiProperty({ example: 'Anna Shevchenko' })
  name: string;

  @ApiProperty({ example: 'https://ftp.goit.study/img/avatars/23.jpg' })
  avatar_url: string;

  @ApiProperty({ example: 'Kyiv, Ukraine' })
  location: string;

  @ApiProperty({ example: 4.5 })
  rating: number;

  @ApiProperty({ example: 15 })
  price_per_hour: number;

  @ApiProperty({ example: '1996-04-10T22:25:57.010Z' })
  birthday: string;

  @ApiProperty({ example: '5 years' })
  experience: string;

  @ApiProperty({ example: '1 to 6 years old' })
  kids_age: string;

  @ApiProperty({ example: ['patient', 'energetic', 'creative', 'punctual'] })
  characters: string[];

  @ApiProperty({
    example: "Bachelor's in Early Childhood Education, First Aid Certified",
  })
  education: string;

  @ApiProperty({
    example:
      'I love children and have been working with them for over 5 years.',
  })
  about: string;
}
