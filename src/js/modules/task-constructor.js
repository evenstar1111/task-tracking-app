import { TASK_STATUS, TASK_PRIORITY, PRIORITY_OPTIONS_ARRAY } from './constants.js';
import { generateRandomId } from './helpers.js';

function Task(data) {
   var self = this;
   self._id = data._id || generateRandomId();
   self.title = ko.observable(data.title || '');
   self.description = ko.observable(data.description || '');
   self.status = ko.observable(data.status || TASK_STATUS.new);
   self.priority = ko.observable(data.priority || TASK_PRIORITY.normal);
   self.hasDeadline = ko.observable(data.hasDeadline || false);
   self.deadline = ko.observable(data.deadline || null);
   self.createdAt = ko.observable(data.createdAt || new Date().toISOString());
   self.modifiedAt = ko.observable(data.modifiedAt || null);
   self.isInTrash = ko.observable(data.isInTrash || false);
   
   self.isTaskActionMenuOpen = ko.observable(false);
   
   /* computed observable properties */
   self.briefDescription = ko.computed(function() {
      return self.description().length < 30 ? self.description() : self.description().slice(0, 34).concat('...');
   });

   self.priorityText = ko.computed(function() {
      let matchedItem = PRIORITY_OPTIONS_ARRAY.find(item => item.value === self.priority());
      return matchedItem ? matchedItem.label : '';
   });
   
   self.deadlineAsText = ko.computed(function() {
      if (self.deadline() == null) {
         return '';
      }
      return new Date(self.deadline()).toDateString();
   });
   
   self.createdAtAsText = ko.computed(function() {
      return new Date(self.createdAt()).toDateString();
   });
   
   self.modifiedAtAsText = ko.computed(function() {
      if (self.modifiedAt() == null) {
         return '';
      }
      return new Date(self.modifiedAt()).toDateString();
   });
   
   self.isTaskPriorityHigh = ko.pureComputed(function() {
      return self.priority() === TASK_PRIORITY.high;
   });
   
   self.isTaskPriorityLow = ko.pureComputed(function() {
      return self.priority() === TASK_PRIORITY.low;
   });
   
   self.isTaskNew = ko.pureComputed(function() {
      return self.status() === TASK_STATUS.new;
   });
   
   self.isTaskInProgress = ko.pureComputed(function() {
      return self.status() === TASK_STATUS.inProgress;
   });

   self.isDone = ko.pureComputed(function() {
      return self.status() === TASK_STATUS.done;
   });
}

export default Task;