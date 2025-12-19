import {
  ArticleState,
  SourceRecord,
  SourceRecordSchema,
} from '@shared/feed-types';
import { createStore, reconcile } from 'solid-js/store';
import { DEFAULT_FEED_URLS } from '@shared/constants';
import { createEffect, createSignal } from 'solid-js';

export const [mode, setMode] = createSignal<ArticleState>('live');
export const [isFetching, setIsFetching] = createSignal(false);
export const [selectedGuid, setSelectedGuid] = createSignal('');

export const [showOptions, setShowOptions] = createSignal(false);
export const [menuGuid, setMenuGuid] = createSignal<string>('');

export const [userSources, setUserSources] =
  createStore<SourceRecord[]>(DEFAULT_FEED_URLS);

export const loadSourcesFromStorage = () => {
  const fromLocal = localStorage.getItem('newsy:sources');
  if (!fromLocal) return;

  try {
    SourceRecordSchema.parse(JSON.parse(fromLocal));
  } catch (e) {
    console.error(e);
  }
};

export const saveSourcesToStorage = () => {
  console.log({ userSources });
  const data = reconcile(userSources);
  console.log({ data: data(userSources) });

  localStorage.setItem('newsy:sources', JSON.stringify(data(userSources)));
};
