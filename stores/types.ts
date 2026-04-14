// Runtime constants for ProductType
export const ProductType = {
  Homme: "homme",
  Femme: "femme",
  Accessoires: "accessoires",
} as const;

export type ProductType = (typeof ProductType)[keyof typeof ProductType];

// Runtime constants for Size
export const Size = {
  XXS: "XXS",
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
  XXXL: "XXXL",
} as const;

export type Size = (typeof Size)[keyof typeof Size];

// Runtime constants for Color
export const Color = {
  Black: "Black",
  Navy: "Navy",
  Olive: "Olive",
  Sage: "Sage",
  Camel: "Camel",
  Marron: "Marron",
  Beige: "Beige",
  Tartan: "Tartan",
} as const;

export type Color = (typeof Color)[keyof typeof Color];
