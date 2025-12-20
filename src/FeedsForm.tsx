{/* import {ResolvedChildren For, Show, onMount } from 'solid-js' */ }
{/* import { createStore, reconcile } from 'solid-js/store' */ }
{/* import { SourceRecord } from '@shared/feed-types' */ }
{/**/ }
{/* import { saveSourcesToStorage, setUserSources, userSources } from './signals' */ }
{/**/ }
{/* export const [__userSources, __setUserSources] = createStore<SourceRecord[]>([]) */ }
{/**/ }
{/* const FeedsForm = (props: { onSaved: () => void }) => { */ }
{/*   const addItem = () => { */ }
{/*     __setUserSources((items: SourceRecord[]) => [ */ }
{/*       ...items, */ }
{/*       { name: '', url: '', priority: 1, status: 'idle' }, */ }
{/*     ]) */ }
{/*   } */ }
{/**/ }
{/*   const removeItem = (index: number) => { */ }
{/*     __setUserSources((items: SourceRecord[]) => */ }
{/*       items.filter((_, i) => i !== index), */ }
{/*     ) */ }
{/*   } */ }
{/**/ }
{/*   const updateField = ( */ }
{/*     index: number, */ }
{/*     field: keyof SourceRecord, */ }
{/*     value: string | number, */ }
{/*   ) => { */ }
{/*     __setUserSources(index, field, value) */ }
{/*   } */ }
{/**/ }
{/*   onMount(() => { */ }
{/*     __setUserSources(reconcile(userSources)) */ }
{/*   }) */ }
{/**/ }
{/*   const save = () => { */ }
{/*     setUserSources(reconcile(__userSources)) */ }
{/*     saveSourcesToStorage() */ }
{/*     props.onSaved() */ }
{/*   } */ }
{/**/ }
{/*   return ( */ }
{/*     <div class="flex flex-col gap-4 w-full max-w-md mx-auto p-2"> */ }
{/*       <div class="flex justify-between items-center mb-2"> */ }
{/*         <h2 class="text-lg font-bold text-slate-400">Sources</h2> */ }
{/*         <button */ }
{/*           onClick={addItem} */ }
{/*           class="bg-slate-800 text-white px-4 py-2 rounded-lg font-normal active:scale-95 transition-transform"> */ }
{/*           + Add New */ }
{/*         </button> */ }
{/*       </div> */ }
{/**/ }
{/*       <div class="space-y-4"> */ }
{/*         <For each={__userSources}> */ }
{/*           {(item, index) => ( */ }
{/*             <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative animate-in fade-in slide-in-from-right-4"> */ }
{/*               <button */ }
{/*                 onClick={() => removeItem(index())} */ }
{/*                 class="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2"> */ }
{/*                 ✕ */ }
{/*               </button> */ }
{/**/ }
{/*               <div class="flex flex-col gap-3"> */ }
{/*                 <div class="flex flex-col"> */ }
{/*                   <label class="text-xs font-semibold text-gray-500 uppercase ml-1"> */ }
{/*                     Name */ }
{/*                   </label> */ }
{/*                   <input */ }
{/*                     type="text" */ }
{/*                     value={item.name} */ }
{/*                     onInput={e => */ }
{/*                       updateField(index(), 'name', e.currentTarget.value) */ }
{/*                     } */ }
{/*                     placeholder="e.g. BBC News" */ }
{/*                     class="border-b-2 border-gray-100 focus:border-indigo-500 outline-none p-1 text-lg" */ }
{/*                   /> */ }
{/*                 </div> */ }
{/**/ }
{/*                 <div class="flex flex-col"> */ }
{/*                   <label class="text-xs font-semibold text-gray-500 uppercase ml-1"> */ }
{/*                     URL */ }
{/*                   </label> */ }
{/*                   <input */ }
{/*                     type="url" */ }
{/*                     value={item.url} */ }
{/*                     onInput={e => */ }
{/*                       updateField(index(), 'url', e.currentTarget.value) */ }
{/*                     } */ }
{/*                     placeholder="https://..." */ }
{/*                     class="border-b-2 border-gray-100 focus:border-indigo-500 outline-none p-1 text-sm text-blue-600" */ }
{/*                   /> */ }
{/*                 </div> */ }
{/**/ }
{/*                 <div class="flex items-center gap-4 mt-2"> */ }
{/*                   <div class="flex flex-col grow"> */ }
{/*                     <label class="text-xs font-semibold text-gray-500 uppercase ml-1"> */ }
{/*                       Weight / Votes */ }
{/*                     </label> */ }
{/*                     <div class="flex items-center gap-2"> */ }
{/*                       <button */ }
{/*                         onClick={() => */ }
{/*                           updateField( */ }
{/*                             index(), */ }
{/*                             'votes', */ }
{/*                             Math.max(0, item.votes - 1), */ }
{/*                           ) */ }
{/*                         } */ }
{/*                         class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full active:bg-gray-200 text-xl"> */ }
{/*                         - */ }
{/*                       </button> */ }
{/*                       <input */ }
{/*                         type="number" */ }
{/*                         value={item.votes} */ }
{/*                         onInput={e => */ }
{/*                           updateField( */ }
{/*                             index(), */ }
{/*                             'votes', */ }
{/*                             parseInt(e.currentTarget.value) || 0, */ }
{/*                           ) */ }
{/*                         } */ }
{/*                         class="w-16 text-center text-lg font-bold outline-none" */ }
{/*                       /> */ }
{/*                       <button */ }
{/*                         onClick={() => */ }
{/*                           updateField(index(), 'votes', item.votes + 1) */ }
{/*                         } */ }
{/*                         class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full active:bg-gray-200 text-xl"> */ }
{/*                         + */ }
{/*                       </button> */ }
{/*                     </div> */ }
{/*                   </div> */ }
{/*                 </div> */ }
{/*               </div> */ }
{/*             </div> */ }
{/*           )} */ }
{/*         </For> */ }
{/*       </div> */ }
{/**/ }
{/*       <Show when={__userSources.length === 0}> */ }
{/*         <div class="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400"> */ }
{/*           No sources added yet. */ }
{/*         </div> */ }
{/*       </Show> */ }
{/*       <div class="flex justify-center  items-center mb-2"> */ }
{/*         <button */ }
{/*           onClick={save} */ }
{/*           class="bg-green-800 text-white px-4 py-2 rounded-lg font-normal active:scale-95 transition-transform"> */ }
{/*           Save */ }
{/*         </button> */ }
{/*       </div> */ }
{/*     </div> */ }
{/*   ) */ }
{/* } */ }
{/**/ }
{/* export default FeedsForm */ }
