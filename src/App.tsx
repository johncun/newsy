import { createResource, ErrorBoundary, createEffect, For, Accessor } from 'solid-js';
import { ArticleRecords, FeedResult } from './schemas/FeedItem';
import Card from './Card';
import { getAllByState, memData, refreshDbWithFeedItems, updateState } from './db';

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
  const [feed] = createResource(fetchItems);

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
      <div class="absolute top-0 bottom-0 left-4 right-4 overflow-x-hidden overflow-y-scroll">
        <div class="relative flex flex-col pt-4 pb-8 gap-4 items-center py-4 ">
          <List as={memData} />
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

const onSwipeRight = (guid: string) => {
  updateState(guid, 'saved')
}
const onSwipeLeft = (guid: string) => {
  updateState(guid, 'deleted')
}


const List = (props: { as: Accessor<ArticleRecords> }) => {
  if (!props.as() || !props.as().length) return null

  const as = () => getAllByState('live')(props.as())

  return <><For each={as()}>{it =>
    <Card data={it} onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />}</For></>


}

export default App;
