export function dateEpochCompareOfTasks(a, b) {
   return Date.parse(b.createdAt()) - Date.parse(a.createdAt());
}

export function generateRandomId() {
   return Math.random().toString(36).substring(2);
}

export default {
   dateEpochCompareOfTasks,
   generateRandomId
}