# TODO List

## Feature Baseline
------

| Item                                     | Priority | Status  |
| ---------------------------------------- | -------- | ------- |
| Show basic variable types, class, function, reference in tree view | High     | Done    |
| Node format: [symbol name] : [symbol type/value/class] | High     | Done    |
| Auto scroll to source                    | High     | Done    |
| Auto refresh tree view                   | High     | Done    |
| Universal parser for popular language    | High     | Done    |
| Professional suppor for HTML             | High     | Done    |
| Professional suppor for CSS              | High     | Done    |
| Professional suppor for Javascript       | High     | Done    |
| Warning when no symbol or no editor opened | High     | Done    |
| New icon for tree node                   | High     | Done    |
| Auto detect and toggle view when pane changed | High     | Done    |
| Auto scroll from source                  | Medium   | Done    |
| Filter for symbol quick search           | Medium   | Planned |
| Expand all                               | Medium   | Planned |
| Collapse all                             | Medium   | Planned |
| Professional suppor for Less / Sass / Stylus | Medium   | Planned |
| Professional suppor for JSX / Jade       | Medium   | Planned |
| Sorting tree node by a to z              | Low      | Planned |
| Sorting tree node by symbol type         | Low      | Planned |



## Settings

------

| Item                    | Priority | Status  |
| ----------------------- | -------- | ------- |
| Auto scroll from source | Low      | Done    |
| Auto scroll to source   | Low      | Planned |
| View width              | Low      | Planned |
| Auto toggle             | Low      | Planned |
| Auto hide               | Low      | Planned |
| Filter to hide symbol   | Low      | Planned |



## MISC & Details

------

- Unit test and coverage:
  - Test/Spec script using [Mocha](https://mochajs.org/) , refer to [symbols-view-spec](https://github.com/atom/symbols-view/blob/master/spec/symbols-view-spec.js) .
  - Coverage using [Istanbul](https://github.com/gotwarlost/istanbul) .
- Auto expand all nodes of a path when `AutoscrollFromSource` is enabled.
- Technical doc about how to contribute, including introduce architecture of this plugin, API, and other rules like coding style, main focus...
