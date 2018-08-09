# For developer

## install dependencies

```bash
$ npm i
````

## install pack dependencies

view package.json,the property name **"_doPackNeedDependencies"**,you can see the their version.

install those if you did n t install -g

```bash
$ npm i webpack@1.13.3 cross-env@3.1.3 babel-core@6.18.2 babel-loader@6.2.7 npm-run-all@3.1.1
````

## pack

```bash
$ npm run pack
````

## main process

![image](/example/img/flow.png)


travel:
根据节点生成二维数组结构。

```js
["├ ROOT", undefined   ]
["│ "    , "│   "      ]
["│ "    , "├─ one"    , undefined   ]
["│ "    , "│   "      , "│   "      ]
["│ "    , "│   "      , "├─ two"    , ": \"2\"" ]
["│ "    , "│   "      , "│   "      , undefined ]
["│ "    , "│   "      , "├─ three"  , undefined ]
["│ "    , "│   "      , "│   "      , "│   "    ]
["│ "    , "│   "      , "│   "      , "├─ four" , undefined ]
["│ "    , "│   "      , "│   "      , "│   "    , "│   "    ]
["│ "    , "│   "      , "│   "      , "│   "    , "├─ five" , ": 5"     ]
["│ "    , "│   "      , "│   "      , "│   "    , "│   "    , undefined ]
["│ "    , "│   "      , "├─ six"    , undefined ]
["│ "    , "│   "      , "│   "      , "│   "    ]
["│ "    , "│   "      , "│   "      , "├─ seven", ": 7"     ]
["│ "    , "│   "      , "│   "      , "│   "    , undefined ]
["│ "    , "│   "      , "├─ eight"  , undefined ]
["│ "    , "│   "      , "│   "      , "│   "    ]
["│ "    , "│   "      , "│   "      , "├─ nine" , ": 9"     ]
["│ "    , "│   "      , "│   "      , "│   "    , undefined ]
["│ "    , "├─ ten"    , undefined   ]
["│ "    , "│   "      , "│   "      ]
["│ "    , "│   "      , "├─ eleven" , ": 11"    ]
["│ "    , "│   "      , "│   "      , undefined ]
["│ "    , "├─ twelve" , ": 12"      ]
["│ "    , "│   "      , undefined   ]

````
fix:
遍历每个节点型元素，二维向下检测其是否属于末尾节点，如果是，替换节点符号，并向下清空竖型连接符

```js
[" ROOT" , undefined   ]
["  "    , "│   "      ]
["  "    , "├─ one"    , undefined   ]
["  "    , "│   "      , "│   "      ]
["  "    , "│   "      , "├─ two"    , ": \"2\"" ]
["  "    , "│   "      , "│   "      , undefined ]
["  "    , "│   "      , "├─ three"  , undefined ]
["  "    , "│   "      , "│   "      , "│   "    ]
["  "    , "│   "      , "│   "      , "└─ four" , undefined ]
["  "    , "│   "      , "│   "      , "    "    , "│   "    ]
["  "    , "│   "      , "│   "      , "    "    , "└─ five" , ": 5"     ]
["  "    , "│   "      , "│   "      , "    "    , "    "    , undefined ]
["  "    , "│   "      , "├─ six"    , undefined ]
["  "    , "│   "      , "│   "      , "│   "    ]
["  "    , "│   "      , "│   "      , "└─ seven", ": 7"     ]
["  "    , "│   "      , "│   "      , "    "    , undefined ]
["  "    , "│   "      , "└─ eight"  , undefined ]
["  "    , "│   "      , "    "      , "│   "    ]
["  "    , "│   "      , "    "      , "└─ nine" , ": 9"     ]
["  "    , "│   "      , "    "      , "    "    , undefined ]
["  "    , "├─ ten"    , undefined   ]
["  "    , "│   "      , "│   "      ]
["  "    , "│   "      , "└─ eleven" , ": 11"]
["  "    , "│   "      , "    "      , undefined]
["  "    , "└─ twelve" , ": 12"      ]
["  "    , "    "      , undefined   ]
````