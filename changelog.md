## 2.0.1 (2019-8-9)

- Change args in travelJson callback, shorten it into option
    - travelJson(json, `cb`, rootAlias, safeMode),  
        - `function cb(key, val, ...args)` --> `function cb(key, val, options)`


## 2.0.0 (2019-8-9)

- Optimize code & pack. 
- Format filename. 
    - Rename `/dist/typeOf.js` to `/dist/type-of.js`
        - Rename `/dist/typeOf.min.js` to `/dist/type-of.min.js`
    - Rename `/dist/json-toTreeString.js` to `/dist/json-treeify.js`
        - Rename `/dist/json-toTreeString.min.js` to `/dist/json-treeify.min.js`
    - Rename `/dist/jsonToy.js` to `/dist/index.js`
        - Rename `/dist/jsonToy.min.js` to `/dist/index.min.js`
        
- Add changelog.md.
- Add more test cases. 


## 1.0.21 (2018-9-6)

- Provide some basic features like treeify