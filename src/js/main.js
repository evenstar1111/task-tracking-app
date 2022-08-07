'use strict';

import helpers from './modules/helpers.js';
import constants from './modules/constants.js';
import Task from './modules/task-constructor.js';
import { 
   CONTROL_SIDE_NAV_VISIBILITY, 
   OPEN_SIDE_NAV, 
   TOGGLE_SEARCH_MOBILE 
} from './modules/ko-custom-binding.js';


/* =======================
* Custom binding handlers
========================== */
ko.bindingHandlers.openSideNav = OPEN_SIDE_NAV;

ko.bindingHandlers.controlSideNavVisibility = CONTROL_SIDE_NAV_VISIBILITY;

ko.bindingHandlers.toggleSearchMobile =  TOGGLE_SEARCH_MOBILE;

/* TODO: need to think about behavior of message showing */

/* ===============
* ViewModel
================ */
function TasksViewModel() {
   var self = this;
   
   self.views = {
      task: 'TASKS',
      trash: 'TRASH'
   }
   self.activeView = ko.observable(self.views.task);

   self.prioritySelectOptions = constants.PRIORITY_OPTIONS_ARRAY.slice();
   self.statusSelectOptions = constants.STATUS_OPTIONS_ARRAY.slice();
   self.prioritySortSelectOptions = constants.PRIORITY_SORT_OPTIONS_ARRAY.slice();
   self.titleSortSelectOptions = constants.TITLE_SORT_OPTIONS_ARRAY.slice();
   self.dateSortSelectOptions = constants.DATE_SORT_OPTIONS_ARRAY.slice();

   self.tasks = ko.observableArray([]);
   self.newTask = ko.observable(new Task({}));
   self.taskToEdit = ko.observable(null);
   self.taskToView = ko.observable(null);
   self.priorityFilter = ko.observable();
   self.statusFilter = ko.observable();
   self.searchFilter = ko.observable('');
   self.prioritySort = ko.observable();
   self.titleSort = ko.observable();
   self.dateSort = ko.observable(constants.DATE_SORT_OPTIONS.newest);
   self.isSideNavVisible = ko.observable(false);
   self.editModalVisible = ko.observable(false);
   self.addTaskModalVisible = ko.observable(false);
   self.viewTaskModalVisible = ko.observable(false);
   self.confirmationModalVisible = ko.observable(false);
   self.isMobileSearchBarVisible = ko.observable(false);
   self.isMobileSearchBarAnimating = ko.observable(false);

   self.goToTasksView = function() {
      self.activeView(self.views.task);
   }

   self.goToTrashView = function() {
      self.activeView(self.views.trash);
   }

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
         if (self.prioritySort() === constants.PRIORITY_SORT_OPTIONS.lowest) {
            tasks.sort(function(a, b) {
               return a.priority() - b.priority();
            });
         }
         if (self.prioritySort() === constants.PRIORITY_SORT_OPTIONS.highest) {
            tasks.sort(function(a, b) {
               return b.priority() - a.priority();
            });
         }
      }

      if (self.titleSort()) {
         if (self.titleSort() === constants.TITLE_SORT_OPTIONS.asc) {
            tasks.sort(function(a, b) {
               return a.title().toLowerCase().localeCompare(b.title().toLowerCase());
            });
         }
         if (self.titleSort() === constants.TITLE_SORT_OPTIONS.desc) {
            tasks.sort(function(a, b) {
               return b.title().toLowerCase().localeCompare(a.title().toLowerCase());
            });
         }
      }

      if (self.dateSort()) {
         if (self.dateSort() === constants.DATE_SORT_OPTIONS.oldest) {
            tasks.sort(helpers.dateEpochCompareOfTasks).reverse();
         }
         if (self.dateSort() === constants.DATE_SORT_OPTIONS.newest) {
            tasks.sort(helpers.dateEpochCompareOfTasks);
         }
      }

      return tasks;
   });

   self.tasksInTrash = ko.pureComputed(function() {
      return self.tasks().filter(function(task) {
         return task.isInTrash();
      });
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

   self.viewTaskDetails = function(task) {
      self.taskToView( task );
      self.viewTaskModalVisible(true);
   }

   self.closeTaskDetails = function() {
      self.viewTaskModalVisible(false);
      self.taskToView(null);
   }

   self.moveTaskToTrash = function(task) {
      task.isInTrash(true);
      self.saveTasksToStorage();
   }

   self.restoreTaskFromTrash = function(task) {
      task.isInTrash(false);
      self.saveTasksToStorage();
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
      targetTask.modifiedAt( new Date().toISOString() );

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

   self.onAdditionOfTask = function(domNode=document.querySelector('div')) {
      if (!domNode.classList) {
         return;
      }
      /* domNode.style.transitionDuration = '800ms';
      domNode.style.transitionProperty = 'background-color'; */
      domNode.style.transition = 'background-color 2800ms ease';
      domNode.style.backgroundColor = '#fec';

      requestAnimationFrame(function() {
         requestAnimationFrame(function() {
            domNode.style.backgroundColor = '#fff';
         });
      })
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
         self.tasks(observableTasks.sort(helpers.dateEpochCompareOfTasks));
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