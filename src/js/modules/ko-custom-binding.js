export const OPEN_SIDE_NAV = {
   init: function(element = document.createElement(null), valueAccessor) {
      var openSideNav = valueAccessor();

      element.addEventListener('click', function(event) {
         event.stopPropagation();
         openSideNav();
      });
   }
}

export const CONTROL_SIDE_NAV_VISIBILITY = {
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

export const TOGGLE_SEARCH_MOBILE = {
   init: function(element = document.createElement(null), valueAccessor) {
      var animating = valueAccessor().animating;
      var visible = valueAccessor().visible;
      var searchBarEl = document.querySelector(valueAccessor().searchBarSelector);

      searchBarEl.addEventListener('transitionend', function() {
         animating(false);
      });

      element.addEventListener('click', function() {
         if (animating()) {
            return;
         }
         animating(true);
         toggleSearchBar();
      });

      function toggleSearchBar() {
         if (visible()) {
            visible(false);
         } else {
            visible(true);
         }
      }
   }
}