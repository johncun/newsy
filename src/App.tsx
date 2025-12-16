import { createResource, ErrorBoundary, createEffect, For, Accessor } from 'solid-js';
import { ArticleRecords, ArticleState, FeedResult } from './schemas/FeedItem';
import Card, { Action } from './Card';
import { getAllByState, killArticle, memData, refreshDbWithFeedItems, updateState } from './db';
import Banner from './Banner';
import { mode, refetch } from './signals';

// --- Data Fetcher Function with Zod Validation ---
const fetchItems = async (): Promise<FeedResult> => {
  const response = await fetch('/api/feeds');

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();

  // Zod Validation: .parse() throws on failure. 
  // If it passes, TypeScript knows the return value is of type HelloData.
  const validatedData = FeedResult.parse(data);

  return validatedData;
};

const App: any = () => {
  // The type of the resource is automatically inferred as Resource<HelloData | undefined>
  const [feed] = createResource(() => refetch(), fetchItems);

  createEffect(() => {
    if (feed.error) {
      console.error("Error loading or validating API data:", feed.error);
    }
    console.log("Fetched items:", feed()?.count);

    refreshDbWithFeedItems(feed()?.items || []);

    const md = memData()

    console.log("total items:", md.length);
    console.log("total LIVE items:", getAllByState('live')(md).length);
    console.log(getAllByState('saved')(md).map(it => it.guid).join(' '))
  });

  return (
    <ErrorBoundary fallback={<div>Failed to load or validate API data.</div>}>
      <Banner />
      <div class="absolute top-0 bottom-0 left-4 right-4 overflow-x-hidden overflow-y-scroll">

        <div class="relative flex flex-col pt-16 pb-8 gap-4 items-center py-4 ">
          <List as={memData} mode={mode} />
          {
            !memData() ?
              <div class="absolute inset-y-0 inset-x-4 flex bg-linear-to-br from-zinc-800 to-slate-800
            items-center justify-center">Loading...</div> : null
          }

        </div>
      </div>

    </ErrorBoundary >
  );
};

type ActionToState = { [key: string]: ArticleState }
const actionToState: ActionToState = {
  'Save': 'saved',
  'Delete': 'deleted',
}
const onSwipeRight = (guid: string, action: Action) => {
  if (action === '') return
  if (action === 'Kill') killArticle(guid);

  updateState(guid, actionToState[action])
}
const onSwipeLeft = (guid: string, action: Action) => {
  if (action === '') return
  if (action === 'Kill') killArticle(guid);

  updateState(guid, actionToState[action])
}


const List = (props: { as: Accessor<ArticleRecords>, mode: Accessor<ArticleState> }) => {

  const as = () => getAllByState(mode())(props.as())

  return <><For each={as()}>{it =>
    <Card data={it} onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />}</For></>


}

export default App;
