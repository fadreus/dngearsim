(function () {
'use strict';

angular.module('dnsim').factory('itemCategory',
['itemFactory','items','dntData',itemCategory]);
function itemCategory(itemFactory,items,dntData) {

  return {
    categories: [
      {path: 'search/titles', name:'titles', sourceType: 'titles', hideRank: true, hideJob: true, hideLevel: true, numItemText: '1', maxCat: 1},
      {path: 'search/weapons', name:'weapons', sourceType: 'equipment', numItemText: '2', maxExchange: 1, maxCat: 2, limitExchange: [1,2]},
      {path: 'search/armour', name:'armour', sourceType: 'equipment', numItemText: '5', maxExchange: 1, maxCat: 5, limitExchange: [3,4,5,6,7]},
      {path: 'search/accessories', name:'accessories', sourceType: 'equipment', hideJob: true, maxCat: 4, maxExchange: 2, limitExchange: [8,9,10]},
      {path: 'search/techs', name:'techs', sourceType: 'techs', maxCat: 4, maxExchange: 2, limitExchange: [8,9,10]},
      {path: 'search/offensive-gems', name:'offensive jades', sourceType: 'gems', hideJob: true, maxCat: 4, maxExchange: 4, limitExchange: [54]},
      {path: 'search/increasing-gems', name:'increasing jades', sourceType: 'gems', hideJob: true, maxCat: 14, maxExchange: 14, limitExchange: [54]},
      {path: 'search/enhancement-plates', name:'enhancement plates', sourceType: 'plates', hideJob: true, numItemText: '8+3', maxCat: 11, maxExchange: 15, limitExchange: [33]},
      {path: 'search/expedition-plates', name:'unique plates', sourceType: 'plates', hideRank: true, hideJob: true, numItemText: '4', maxCat: 4, maxExchange: 15, limitExchange: [33]},
      {path: 'search/talisman', name:'talisman', sourceType: 'talisman', hideJob: true, numItemText: '8+4', maxCat: 12, maxExchange: 12, limitExchange: [52,53]},
      {path: 'search/costume', name:'costume', sourceType: 'cash', numItemText: '7', maxCat: 7, maxExchange: 1, limitExchange: [16,17,18,19,20,21,22]},
      {path: 'search/cash', name:'cash', sourceType: 'cash', numItemText: '8', maxCat: 8, maxExchange: 2, hideJob: true, limitExchange: [23,24,25,26,27,28,29]},
      {path: 'search/extras', name:'extras', sourceType: 'xtras', limitExchange: [47], hideJob: true,},
      {path: 'search/skills', name:'skills', searchType: 'skills'},
      {path: 'search/custom', name:'custom', searchType: 'custom'},
      ],
      
    byName: function(name) {
      var retVal = null;
      angular.forEach(this.categories, function(category, index) {
        if(category.name == name) {
          retVal = category;
        }
      });
      
      return retVal;
    },
      
    byPath: function(name) {
      var retVal = null;
      angular.forEach(this.categories, function(category, index) {
        if(category.path == name) {
          retVal = category;
        }
      });
      
      return retVal;
    },
    
    getItems: function(name) {
      var cat = this.byName(name);
      if(cat && 'sourceType' in cat) {
        var retVal = [];
        angular.forEach(items, function(source, sourceName) {
          if(source.type == cat.sourceType && retVal != null) {
            if(source.items == null && !source.loading) {
              itemFactory.loadItems(source);
            }
            
            if(source.items != null) {
              retVal = retVal.concat(source.items);
            }
            else {
              retVal = null; // if any are null just return null
            }
          }
        });
        
        var catItems = [];
        if(retVal) {
          var vm = this;
          angular.forEach(retVal, function(item, index) {
            if(item.typeName == cat.name ||
              vm.isItemForCat(cat, item, item.data)) {

              item.typeName = name;
              catItems.push(item);
            }
          });
        }
        
        return catItems;
      }
      else {
        return null;
      }
    },
    
    isItemForCat: function(cat, item, rawData) {
      
      if(item.itemSource in items && items[item.itemSource].type != cat.sourceType) {
        return false;
      }
      else if(item.itemType == cat.name) {
        return true;
      }
      else if(cat.limitExchange) {
        
        for(var i=0;i<cat.limitExchange.length;++i) {
          if(cat.limitExchange[i] == item.exchangeType || (rawData && cat.limitExchange[i] == rawData.ExchangeType)) {
            
            if(item.itemSource == 'plate') {
              if((item.rawData && rawData.Rank == 4) || (item.rank && item.rank.id == 4)) {
                return cat.name == 'unique plates';
              }
              else {
                return cat.name == 'enhancement plates';
              }
            }
            else if(item.itemSource == 'gem') {
              var gemTypes = dntData.find(items.gem.gemDnt, 'id', item.id);
              if(gemTypes.length > 0) {
                
                if(gemTypes[0].Type == 1) {
                  return cat.name == 'offensive jades';
                }
                else if(gemTypes[0].Type == 2) {
                  return cat.name == 'increasing jades';
                }
                else {
                  return false;
                }
              }
            }
            
            return true;
          }
        }
        
        return false;
      }
      else if(item.itemSource in items) {
        return items[item.itemSource].type == cat.sourceType;
      }
      else {
        return false;
      }
    },
    
    init: function(name, complete) {
      var cat = this.byName(name);
      if(cat && 'sourceType' in cat) {
        angular.forEach(items, function(source, sourceName) {
          if(source.type == cat.sourceType) {
            source.init(function() {}, complete);
          }
        });
      }
    },
    
    setItemCategory: function (item, rawData) {
      var vm = this;
      
      angular.forEach(this.categories, function(cat, index) {
        if(vm.isItemForCat(cat, item, rawData)) {
          item.typeName = cat.name;
        }
      });
    },
    
    getItemsByCategory: function(items) {
      var itemMap = {};
      if(items != null) {
        var types = {};
        angular.forEach(items, function(item, index) {
          if(item != null) {
            if(!(item.typeName in types)) {
              types[item.typeName] = [];
            }
            types[item.typeName].push(item);
          }
        });
        
        angular.forEach(this.categories, function(category, index) {

          if(category.name in types) {
            
            var sorted = types[category.name].sort(function(item1, item2) {
              if(category.name == 'talisman') {
                
                var enh1 = item1.enchantmentNum;
                if(!enh1) enh1 = 0;
                var enh2 = item2.enchantmentNum;
                if(!enh2) enh1 = 0;
                
                if(enh1 != enh2) {
                  return enh2 - enh1;
                }
              }
              else if(item1.itemSource == 'gem' || item1.itemSource == 'plate') {
                return item2.levelLimit - item1.levelLimit;
              }
              else if('exchangeType' in item1 && 'exchangeType' in item2) {
                return item1.exchangeType - item2.exchangeType;
              }
              
              return item1.name.localeCompare(item2.name);
            });
            itemMap[category.name] = sorted;
          }
          else {
            itemMap[category.name] = [];
          }
        });
        
        angular.forEach(items, function(item, index) {
          if(item != null && !(item.typeName in itemMap)) {
            console.log('we dont know ' + item.typeName + ' anymore')
            itemMap.typeError = true;
          }
        });
      }
      return itemMap;
    },
  }
}

})();