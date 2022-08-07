export const TASK_STATUS = {
   new: 'new',
   inProgress: 'in-progress',
   done: 'done',
}
export const TASK_PRIORITY = {
   low: 1,
   normal: 2,
   high: 3
}
export const PRIORITY_SORT_OPTIONS = {
   lowest: 'lowest',
   highest: 'highest',
}
export const TITLE_SORT_OPTIONS = {
   asc: 'asc',
   desc: 'desc',
}
export const DATE_SORT_OPTIONS = {
   oldest: 'oldest',
   newest: 'newest',
}
export const PRIORITY_OPTIONS_ARRAY = Object.keys(TASK_PRIORITY).map(function(key) {
   return {
      label: key.toUpperCase(),
      value: TASK_PRIORITY[key],
   };
});
export const STATUS_OPTIONS_ARRAY = Object.keys(TASK_STATUS).map(function(key) {
   return { 
      label: key.toUpperCase(), 
      value: TASK_STATUS[key] 
   };
});
export const PRIORITY_SORT_OPTIONS_ARRAY = Object.keys(PRIORITY_SORT_OPTIONS).map(function(key) {
   return { 
      label: key.toUpperCase() + ' FIRST', 
      value: PRIORITY_SORT_OPTIONS[key],
   };
});
export const TITLE_SORT_OPTIONS_ARRAY = Object.keys(TITLE_SORT_OPTIONS).map(function(key) {
   return { 
      label: TITLE_SORT_OPTIONS[key] === TITLE_SORT_OPTIONS.asc ? 'A-Z' : 'Z-A',
      value: TITLE_SORT_OPTIONS[key],
   };
});
export const DATE_SORT_OPTIONS_ARRAY = Object.keys(DATE_SORT_OPTIONS).map(function(key) {
   return { 
      label: key.toUpperCase() + ' FIRST', 
      value: DATE_SORT_OPTIONS[key],
   };
});

export default {
   TASK_STATUS,
   TASK_PRIORITY,
   PRIORITY_SORT_OPTIONS,
   TITLE_SORT_OPTIONS,
   DATE_SORT_OPTIONS,
   PRIORITY_OPTIONS_ARRAY,
   STATUS_OPTIONS_ARRAY,
   PRIORITY_SORT_OPTIONS_ARRAY,
   TITLE_SORT_OPTIONS_ARRAY,
   DATE_SORT_OPTIONS_ARRAY,
}