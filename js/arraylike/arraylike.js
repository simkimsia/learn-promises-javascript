"use strict";

  var ArrayLike = (function(){
    /// create a static reference to our constructor so that we can
    /// add methods to ArrayLike... if we like.
    var _static = function(){
      /// store some "private" values, and arrayify our arguments
      var _args = Array.prototype.slice.call( arguments ),
          _private = { byKey:{}, byIndex: new Array()}, 
          _public = this;
      /// make sure the user used the 'new' keyword.
      if ( _public instanceof _static ) {
        /// if we have arguments then push them onto ourselves
        if ( _args.length ) {
          _public.splice.apply(_public,[0,0].concat(_args));
        }
        /// Now that a new instance has been created, switch in an array 
        /// prototype ready for the next instance.
        _static.prototype = new Array();
        /// start adding our methods, bare in mind if you wish to
        /// stop any of the native array methods from working you'll 
        /// have to override them here.
        _public.add = function( key, value ){
          /// check if key already exists
          var valueExists = _private.byKey[key];
          if (valueExists != null) {
            return false;
          }
          /// store the keys and indexes as references to themselves.
          _private.byKey[key] = _public.length;
          _private.byIndex[_public.length] = key;
          /// use the inherited push function from the array.
          _public.push( value );
        }
        /// an example function to show how get by key would work.
        _public.getByKey = function(key){
          /// get index based on key
          var index = _private.byKey[key];
          return _public[index] ? _public[index] : null;
        }
        /// an example function to show how get by key would work.
        _public.getByIndex = function(index){
          return _public[index] ? _public[index] : null;
        }
        /// swapping the index order based on keys
        _public.swapIndexByKey = function(key1, key2){
          /// get value based on key
          var value1 = _public.getByKey(key1);
          var value2 = _public.getByKey(key2);

          if (value1 != null && value2 != null) {
            var index1 = _private.byKey[key1];
            var index2 = _private.byKey[key2];

            // swap the values inside _public
            _public[index1] = value2;
            _public[index2] = value1;

            // swap the indices
            _private.byIndex[index1] = key2;
            _private.byIndex[index2] = key1;

            // swap the keys
            _private.byKey[key1] = index2;
            _private.byKey[key2] = index1;
            return true;
          }

          return false;
        }
        /// swapping the order based on keys
        _public.replaceByKey = function(key, newvalue){
          /// get value based on key
          var value = _public.getByKey(key);
          

          if (value == null) {
            // this should be append not replace
            _public.add(key, newvalue);
          } else {
            var index = _private.byKey[key];  
            // replace the value inside _public
            _public[index] = newvalue;
          }
          
        }
        /// swapping the keys while maintaining index-value pair
        _public.swapKeyByIndex = function(index1, index2) {
            /// get value based on index
            var value1 = _public.getByIndex(index1);
            var value2 = _public.getByIndex(index2);

            if (value1 != null && value2 != null) {
              var key1 = _private.byIndex[index1];
              var key2 = _private.byIndex[index2];

              // swap the indices
              _private.byIndex[index1] = key2;
              _private.byIndex[index2] = key1;

              // swap the keys
              _private.byKey[key1] = index2;
              _private.byKey[key2] = index1;

              return true;
            }

            return false;
        }
        /// swapping the values while maintaining index-key matching
        _public.swapValueByKey = function(key1, key2) {
            /// get value based on index
            var value1 = _public.getByKey(key1);
            var value2 = _public.getByKey(key2);

            if (value1 != null && value2 != null) {
              _public.replaceByKey(key1, value2);
              _public.replaceByKey(key2, value1);

              return true;
            }

            return false;
        }
        /// replace existing key-value pair with a new pair while maintaining index order
        _public.insert = function(index, newkey, newvalue){
          /// get value based on key
          var value = _public.getByIndex(index);
          var key = _private.byIndex[index];

          if (value == null) {
            /// this should be append not replace
            _public.add(key, newvalue);
          } else {
            var index = _private.byKey[key];  
            /// replace the value inside _public
            _public[index] = newvalue;

            // replace the indices
            _private.byIndex[index] = newkey;
            

            // replace the keys
            delete _private.byKey[key];
            _private.byKey[newkey] = index;
          }
          
        }
        _public.reverseOrder = function() {
          _public.reverse();
          _private.byIndex.reverse();
          _private.reIndex();
        }
        // convert from html5 files property
        _public.convertFrom = function(files){
          // wipe slate clean
          _public.removeAll();
          // traverse through all files and add them in 1 by 1
          for (var i=0, l=files.length; i<l; i++) {
            var file = files[i];
            if (_public.keyExists(file.name) == false) {
              _public.add(file.name, file);  
            }
          }
        }
        // appendwith html5 files property
        _public.appendWith = function(files){
          // traverse through all files and add them in 1 by 1
          for (var i=0, l=files.length; i<l; i++) {
            var file = files[i];
            if (_public.keyExists(file.name) == false) {
              _public.add(file.name, file);  
            }
          }
        }
        /// returns true if key exists
        _public.keyExists = function(key) {
          return key in _private.byKey;
        }
        /// easy removeAll thanks to the array prototype.
        _public.removeAll = function(){
          _public.length = 0;
          _private.byKey = {};
          _private.byIndex = new Array();
        }
        /// here I leave you to flesh out the methods that you 'want'.
        _public.removeByKey = function(key) {

          /// get index based on key
          var index = _private.byKey[key];
         
          /// get the value based on the key
          var value = _public.getByKey(key);

          if (value != null) {
            console.log('remove an existing key');
            _public.removeByIndex(index);

            return value;  
          }
          return false;
        }
        /// return all keys
        _public.getAllKeys = function() {
          //console.log(_private.byIndex);
          return _private.byIndex;
        }
        _public.getKeyByIndex = function(index) {
          return _private.byIndex[index];
        }
        _public.removeByIndex = function(index) {
          /// get the value based on the key
          var value = _public.getByIndex(index);

          // this will update the _private.byIndex
          _private.byIndex.splice(index, 1);
          _public.splice(index, 1);
          // reindex the _private.byKey
          _private.reIndex();

          return value;
        }
        /// I'll give you a clue that keeping your array index in order
        /// is going to be a manual process, so whenever you delete you
        /// will have to reindex.
        _private.reIndex = function(){
          
          /// clear the _private.byKey 
          _private.byKey = {};
          
          for (var i=0; i < _private.byIndex.length; i++) {
            var key = _private.byIndex[i];
            /// re insert the keys and corresponding indices 1 by 1
            _private.byKey[key] = i;
          }
          
        }
      }
    }
    /// set-up the prototype as an array ready for creation
    _static.prototype = new Array();
    /// return the function that will be our constructor
    return _static;
  })();