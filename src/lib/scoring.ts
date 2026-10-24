import { SCORE } from "./constants";
import type { CargoType } from "./types";

export function pointsFor(type: CargoType): number {
  switch (type) {
    case "cargoBox":
      return SCORE.cargoBox;
    case "shippingContainer":
      return SCORE.shippingContainer;
    case "airFreight":
      return SCORE.airFreight;
    case "damagedCargo":
      return SCORE.damagedCargo;
    case "restrictedCargo":
      return SCORE.restrictedCargo;
  }
}

export function isHazard(type: CargoType): boolean {
  return type === "damagedCargo" || type === "restrictedCargo";
}
