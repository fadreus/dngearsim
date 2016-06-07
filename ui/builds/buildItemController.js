angular.module('dnsim').controller('buildItemCtrl',

['$timeout','statHelper','saveHelper',
function($timeout,statHelper,saveHelper) {
  'use strict';
  
  var vm = this;
    
  this.removeItem = function() {
    vm.item.removeItem = true;
    var newItemList = [];
    angular.forEach(vm.build.items, function(gItem, index) {
      if(gItem && !gItem.removeItem) {
        newItemList.push(gItem);
      }
    });
    
    saveHelper.updatedSavedItems(vm.buildName, newItemList);
    vm.onChange();
  }
  
}])
.directive('dngearsimBuildItem', function() {
  return {
    scope: true,
    bindToController: {
      item: '=item',
      buildName: '=buildName',
      build: '=build',
      onChange: '&onChange'
    },
    controller: 'buildItemCtrl',
    controllerAs: 'ctrl',
    templateUrl: 'ui/builds/build-item.html'
  };
});