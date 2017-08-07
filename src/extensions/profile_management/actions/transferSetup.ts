import { createAction } from 'redux-act';

export const setSource = createAction('SET_PROFILE_CONNECTION_SOURCE',
  (id: string, pos: { x: number, y: number }) => ({ id, pos }));

export const setTarget = createAction('SET_PROFILE_CONNECTION_TARGET',
  (id: string, pos: { x: number, y: number }) => ({ id, pos }));

export const setCreateTransfer = createAction('SET_PROFILE_TRANSFER',
  (gameId: string, profileId: string, reference: string, defaultType: string) =>
    ({ gameId, profileId, reference, type: defaultType }));

export const closeDialog = createAction('CLOSE_PROFILE_TRANSFER_DIALOG');