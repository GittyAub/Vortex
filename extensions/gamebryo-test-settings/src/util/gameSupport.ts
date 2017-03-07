import { app as appIn, remote } from 'electron';
import * as path from 'path';

const app = appIn || remote.app;

const gameSupport = {
  skyrim: {
    mygamesPath: 'skyrim',
    iniName: 'Skyrim.ini',
  },
  skyrimse: {
    mygamesPath: 'Skyrim Special Edition',
    iniName: 'Skyrim.ini',
  },
  fallout4: {
    mygamesPath: 'Fallout4',
    iniName: 'Fallout4.ini',
  },
  falloutnv: {
    mygamesPath: 'FalloutNV',
    iniName: 'Fallout.ini',
  },
  oblivion: {
    mygamesPath: 'Oblivion',
    iniName: 'Oblivion.ini',
  },
};

export function gameSupported(gameMode: string): boolean {
  return gameSupport[gameMode] !== undefined;
}

export function mygamesPath(gameMode: string): string {
  return path.join(app.getPath('documents'), 'My Games',
                   gameSupport[gameMode].mygamesPath);
}

export function iniPath(gameMode: string): string {
  const { iniName } = gameSupport[gameMode];
  return path.join(mygamesPath(gameMode), iniName);
}