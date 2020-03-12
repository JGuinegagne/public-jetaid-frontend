import { TravelerGender } from './backend-enums';

export enum BaseImage {
  LOGO = 'assets/img/logo.png',
  MAN1 = 'assets/img/man1.png',
  MAN2 = 'assets/img/man2.png',
  MAN3 = 'assets/img/man3.png',
  MAN4 = 'assets/img/man4.png',
  MAN4_INV = 'assets/img/man4_inv.png',
  WOMAN1 = 'assets/img/woman1.png',
  WOMAN1_INV ='assets/img/woman1_inv.png',
  WOMAN2 = 'assets/img/woman2.png',
  WOMAN3 = 'assets/img/woman3.png',
  WOMAN4 = 'assets/img/woman4.png',
}


export const dftAlt = (imgSrc: BaseImage): string => {
  if(!imgSrc) return 'image';
  const key = Object.keys(BaseImage).find(key => BaseImage[key] === imgSrc);
  return key 
    ? `${key.substr(0,1).toUpperCase()}${key.substr(1).toLowerCase}`
    : 'image';
}


export const travelerImg = (gender: TravelerGender, imgCode?: number): BaseImage => {
  if(!gender) gender = TravelerGender.MALE;

  switch(gender){
    case TravelerGender.FEMALE: return BaseImage.WOMAN1;
    default: return BaseImage.MAN1;
  }
}