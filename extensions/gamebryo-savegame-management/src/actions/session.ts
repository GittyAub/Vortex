import { createAction } from 'redux-act';

import { ISavegame, SavegameState } from '../types/ISavegame';

export const addSavegame: any = createAction('ADD_SAVEGAME',
  (save: ISavegame) => save);

export const setSavegameState: any = createAction('SET_SAVEGAME_STATE',
  (id: string, savegameState: SavegameState) => ({ id, savegameState }));

export const setSavegameAttribute: any = createAction('SET_SAVEGAME_ATTRIBUTE',
  (id: string, attribute: string, value: any) => ({ id, attribute, value }));

export const clearSavegames: any = createAction('CLEAR_SAVEGAMES');

export const removeSavegame: any = createAction('REMOVE_SAVEGAME');