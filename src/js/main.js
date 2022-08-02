'use strict';

const TASK_STATUS = {
   new: 'new',
   inProgress: 'in-progress',
   done: 'done',
}
const TASK_PRIORITY = {
   low: 1,
   normal: 2,
   high: 3
}
const PRIORITY_SORT_OPTIONS = {
   lowest: 'lowest',
   highest: 'highest',
}
const TITLE_SORT_OPTIONS = {
   asc: 'asc',
   desc: 'desc',
}
const DATE_SORT_OPTIONS = {
   oldest: 'oldest',
   newest: 'newest',
}
const priorityOptionsArray = Object.keys(TASK_PRIORITY).map(function(key) {
   return {
      label: key.toUpperCase(),
      value: TASK_PRIORITY[key],
   };
});
const statusOptionsArray = Object.keys(TASK_STATUS).map(function(key) {
   return { 
      label: key.toUpperCase(), 
      value: TASK_STATUS[key] 
   };
});
const prioritySortOptionsArray = Object.keys(PRIORITY_SORT_OPTIONS).map(function(key) {
   return { 
      label: key.toUpperCase() + ' FIRST', 
      value: PRIORITY_SORT_OPTIONS[key],
   };
});
const titleSortOptionsArray = Object.keys(TITLE_SORT_OPTIONS).map(function(key) {
   return { 
      label: TITLE_SORT_OPTIONS[key] === TITLE_SORT_OPTIONS.asc ? 'A-Z' : 'Z-A',
      value: TITLE_SORT_OPTIONS[key],
   };
});
const dateSortOptionsArray = Object.keys(DATE_SORT_OPTIONS).map(function(key) {
   return { 
      label: key.toUpperCase() + ' FIRST', 
      value: DATE_SORT_OPTIONS[key],
   };
});

/* =======================
* Custom binding handlers
========================== */
ko.bindingHandlers.openSideNav = {
   init: function(element = document.createElement(null), valueAccessor) {
      var openSideNav = valueAccessor();

      element.addEventListener('click', function(event) {
         event.stopPropagation();
         openSideNav();
      });
   }
}

ko.bindingHandlers.controlSideNavVisibility = {
   init: function(element = document.createElement(null), valueAccessor) {
      var isNavVisible = valueAccessor();
      isNavVisible() ? element.classList.add('active') : element.classList.remove('active');
      
      window.addEventListener('click', function(event) {
         if (!isNavVisible() || event.target.closest('#' + element.id)) {
            return;
         }
         isNavVisible(false);
      });
   },
   update: function(element = document.createElement(null), valueAccessor) {
      var isNavVisible = valueAccessor();
      isNavVisible() ? element.classList.add('active') : element.classList.remove('active');
   }
}

ko.bindingHandlers.toggleSearchMobile =  {
   init: function(element = document.createElement(null), valueAccessor) {
      var tel = document.querySelector('.mobile-search-js');
      console.log(parseFloat(getComputedStyle(tel).animationDuration)*100);
   }
}

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
   self.priorityText = ko.computed(function() {
      let matchedItem = priorityOptionsArray.find(item => item.value === self.priority());
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
/* TODO: need to think about behavior of message showing */

/* ===============
* helper functions
================ */
function dateEpochCompareOfTasks(a, b) {
   return Date.parse(b.createdAt()) - Date.parse(a.createdAt());
}

function generateRandomId() {
   return Math.random().toString(36).substring(2);
}

/* ===============
* ViewModel
================ */
function TasksViewModel() {
   var self = this;

   self.prioritySelectOptions = priorityOptionsArray.slice();
   self.statusSelectOptions = statusOptionsArray.slice();
   self.prioritySortSelectOptions = prioritySortOptionsArray.slice();
   self.titleSortSelectOptions = titleSortOptionsArray.slice();
   self.dateSortSelectOptions = dateSortOptionsArray.slice();

   self.tasks = ko.observableArray([]);
   self.newTask = ko.observable(new Task({}));
   self.taskToEdit = ko.observable(null);
   self.priorityFilter = ko.observable();
   self.statusFilter = ko.observable();
   self.searchFilter = ko.observable('');
   self.prioritySort = ko.observable();
   self.titleSort = ko.observable();
   self.dateSort = ko.observable(DATE_SORT_OPTIONS.newest);
   self.isSideNavVisible = ko.observable(false);
   self.editModalVisible = ko.observable(false);
   self.addTaskModalVisible = ko.observable(false);
   self.confirmationModalVisible = ko.observable(false);

   self.applyTitleSort = function() {
      self.prioritySort(null);
      self.dateSort(null);
   }

   self.applyPrioritySort = function() {
      self.dateSort(null);
      self.titleSort(null);
   }

   self.applyDateSort = function() {
      self.prioritySort(null);
      self.titleSort(null);
   }

   self.modifiedTasksList = ko.pureComputed(function() {
      var tasks = self.tasks().filter(function(task) {
         return !task.isInTrash();
      });

      /* ===========
      * FILTERING
      ============ */
      if (self.priorityFilter()) {
         tasks = tasks.slice().filter(function(task) {
            return task.priority() == self.priorityFilter();
         });
      }

      if (self.statusFilter()) {
         tasks = tasks.slice().filter(function(task) {
            return task.status().toLowerCase() == self.statusFilter().toLowerCase();
         });
      }

      if (self.searchFilter() && self.searchFilter() !== '') {
         tasks = tasks.slice().filter(function(task) {
            return task.title().toLowerCase().indexOf(self.searchFilter().toLowerCase()) > -1;
         });
      }

      /* ===========
      * SORTING
      ============ */
      if (self.prioritySort()) {
         if (self.prioritySort() === PRIORITY_SORT_OPTIONS.lowest) {
            tasks.sort(function(a, b) {
               return a.priority() - b.priority();
            });
         }
         if (self.prioritySort() === PRIORITY_SORT_OPTIONS.highest) {
            tasks.sort(function(a, b) {
               return b.priority() - a.priority();
            });
         }
      }

      if (self.titleSort()) {
         if (self.titleSort() === TITLE_SORT_OPTIONS.asc) {
            tasks.sort(function(a, b) {
               return a.title().toLowerCase().localeCompare(b.title().toLowerCase());
            });
         }
         if (self.titleSort() === TITLE_SORT_OPTIONS.desc) {
            tasks.sort(function(a, b) {
               return b.title().toLowerCase().localeCompare(a.title().toLowerCase());
            });
         }
      }

      if (self.dateSort()) {
         if (self.dateSort() === DATE_SORT_OPTIONS.oldest) {
            tasks.sort(dateEpochCompareOfTasks).reverse();
         }
         if (self.dateSort() === DATE_SORT_OPTIONS.newest) {
            tasks.sort(dateEpochCompareOfTasks);
         }
      }

      return tasks;
   });

   self.addTask = function() {
      if ( self.newTask().title() === '' ) {
         console.log('Task title is empty');
         return;
      }

      if ( self.tasks().find(task => task.title() === self.newTask().title()) ) {
         console.log('Duplicate task names not allowed');
         return;
      }

      if ( self.newTask().hasDeadline() ) {
         if (self.newTask().deadline() === null) {            
            console.log('Please provide a deadline');
            return;
         }
         if (new Date(self.newTask().deadline().toString()) < new Date()) {
            console.log('Deadline should be in the future');
            return;
         }
      }

      self.tasks.unshift(self.newTask());
      self.addTaskModalVisible(false);
      self.newTask(new Task({}));
   }

   self.moveTaskToTrash = function(task) {
      task.isInTrash(true);
      self.saveTasksToStorage();
   }

   self.restoreTaskFromTrash = function(task) {
      task.isInTrash(false);
   }

   self.restoreAllTasksFromTrash = function() {
      while(self.tasks().find(task => task.isInTrash())) {
         self.tasks().find(task => task.isInTrash()).isInTrash(false);
      }
   }

   self.removeTask = function(task) {
      self.tasks.remove(task);
   }

   self.editTask = function(task) {
      let taskToEdit = ko.mapping.toJS(task);
      self.taskToEdit( new Task( taskToEdit ) );
      self.editModalVisible(true);
   }

   self.closeEditModal = function() {
      self.editModalVisible(false);
      self.taskToEdit(null);
   }

   self.onEditFormSubmit = function() {
      var targetTask = self.tasks().find(function(taskItem) {
         return taskItem._id === self.taskToEdit()._id;
      });

      if (self.taskToEdit().title() === '') {
         console.log('Task title is empty');
         return;
      }

      targetTask.title( self.taskToEdit().title() );
      targetTask.description( self.taskToEdit().description() );
      targetTask.priority( self.taskToEdit().priority() );
      targetTask.status( self.taskToEdit().status() );

      self.saveTasksToStorage();

      self.editModalVisible( false );
   }

   self.openSideNav = function() {
      self.isSideNavVisible(true);
   }

   self.openAddTaskModal = function() {
      self.addTaskModalVisible(true);
   }

   self.closeAddTaskModal = function() {
      self.addTaskModalVisible(false);
   }

   self.openConfirmationModal = function() {
      self.confirmationModalVisible(true);
   }

   self.closeConfirmationModal = function() {
      self.confirmationModalVisible(false);
   }

   self.toggleTaskActionMenu = function(task) {
      task.isTaskActionMenuOpen(!task.isTaskActionMenuOpen());
   }

   /*=============================================
   * Saving and loading tasks using local storage.
   ==============================================*/
   self.saveTasksToStorage = function(tasks = null) {
      localStorage.setItem( 'tasks', ko.toJSON(tasks || self.tasks) );
   }

   self.loadTasksFromStorage = function() {
      var tasks = JSON.parse(localStorage.getItem('tasks'));
      var observableTasks;
      if (tasks && tasks.length) {
         observableTasks = tasks.map(task => new Task(task));
         self.tasks(observableTasks.sort(dateEpochCompareOfTasks));
      }
   }
   
   self.addListenerToSaveTasksOnValueChange = function() {
      self.tasks.subscribe(function(newValue) {
         self.saveTasksToStorage(newValue);
      });
   }

   self.loadTasksFromStorage();
   self.addListenerToSaveTasksOnValueChange();
}

// apply bindings
ko.applyBindings(new TasksViewModel());