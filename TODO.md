# TODO List

## Feature Baseline
------

### Done

| Item                                     | Priority |
| ---------------------------------------- | -------- |
| Show basic variable types, class, function, reference in tree view | High     |
| Node format: [symbol name] : [symbol type/value/class] | High     |
| Auto scroll to source                    | High     |
| Auto refresh tree view                   | High     |
| Universal parser for popular language    | High     |
| Professional suppor for HTML             | High     |
| Professional suppor for CSS              | High     |
| Professional suppor for Javascript       | High     |
| Warning when no symbol or no editor opened | High     |
| New icon for tree node                   | High     |
| Auto detect and toggle view when pane changed | High     |
| Auto scroll from source                  | Medium   |
| Support for inline JS                    | High     |
| Expand all                               | Medium   |
| Collapse all                             | Medium   |

### Planned

| Item                                     | Priority |
| ---------------------------------------- | -------- |
| Support for inline CSS                   | High     |
| Professional support for Python          | High     |
| Professional support for C/C++           | High     |
| Professional support for TypeScript      | High     |
| Filter for symbol quick search           | Medium   |
| Professional suppor for Less / Sass / Stylus | Medium   |
| Professional suppor for JSX / Jade       | Medium   |
| Sorting tree node by a to z              | Low      |
| Sorting tree node by symbol type         | Low      |



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
