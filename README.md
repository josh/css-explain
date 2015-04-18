CSS `EXPLAIN`
=============

Think of it like SQL `EXPLAIN`, but for CSS selectors.


## Usage

``` javascript
cssExplain("li .item")
{
  "selector": "li .item",
  "parts": ["li", ".item"],
  "specificity": [0, 1, 1],
  "category": "class",
  "key": "item",
  "score": 6
}
```

### Results

#### selector

The String selector input.

#### parts

Parsed Array of selector components.

#### specificity

Computed Array of specificy values.

See [W3C calcuating selector specificity](http://www.w3.org/TR/CSS21/cascade.html#specificity).

#### category

Category index key selector falls under. Either `'id'`, `'class'`, `'tag'` or `'universal'`.

Modeled after WebKit's rule set grouping optimizations. CSS rules in WebKit are indexed and grouped in a hash table to avoid having to do a full test on the element being matched. So its better to have selectors fall under unique id or class indexes rather than under more broad indexes like tags. Selectors in the universal category will always have to be tested against every element.

``` json
{
  "id": {
    "about": ["#about"]
  },
  "class": {
    "item": ["li .item"],
    "menu": ["ul.menu"],
    "minibutton": [".minibutton"]
  },
  "tag": {
    "a": ["ul.menu a", ".message a"],
    "span": [".nav > span"]
  },
  "universal": ["*", "[input=text]"]
}
```

To match against `<a class="minibutton">`, the rule set would include `class -> minibutton`, `tag -> a` and `universal` which is `[".minibutton", "ul.menu a", ".message a", "*", "[input=text]"]`.

See [`RuleSet::addRule`](https://github.com/WebKit/webkit/blob/d674eba907a703e8b840d9941d19888de6cf7438/Source/WebCore/css/StyleResolver.cpp#L2589-L2627) for reference.

#### key

Hash used for indexing under the category.

#### score

1-10 rating. 1 being the most efficient and 10 being the least.

*NOTE: Don't take this value so seriously*

#### messages

Array of infomational reasons for why the score was computed.


## Contributing


    $ git clone https://github.com/josh/css-explain.git
    $ cd css-explain/

Run tests

    $ make test
