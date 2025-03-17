import * as log4js from 'log4js'
import { Point } from "./types";

const geohashChars = '0123456789bcdefghjkmnpqrstuvwxyz'

/**
 * Obtiene la lista de geohashes de un nivel menor al nivel dado.
 * @param parent 
 * @returns 
 */
export function getChildrenGeohashes(parent: string): string[] {
  return geohashChars.split("").map(char => parent + char);
}

export function parsePoint(point: string): Point {
  const match = point.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
  if (!match) {
    throw new Error(`Invalid point format: ${point}`);
  }
  const [, lng, lat] = match;
  return { lat: parseFloat(lat), lng: parseFloat(lng) };
}

export function configureLogging(){
  log4js.configure({
    appenders: {
      out: { type: "stdout" },
      file: {
        type: "file",
        filename: "data/logs.log",
        maxLogSize: 10485760,
        backups: 3,
        compress: true,
      },
    },
    categories: {
      default: { appenders: ["file", "out"], level: "debug" },
    },
  })
}



