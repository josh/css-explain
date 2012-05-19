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

* **selector** - Selector input
* **parts** - Parsed selector components
* **specificity** - Computed specificy values as an Array (See [W3C calcuating selector specificity](http://www.w3.org/TR/CSS21/cascade.html#specificity))
* **category** - Category key selector falls under (`id`/`class`/`tag`/`universal`)
* **key** - Hash key used for indexing
* **score** - 1-10 rating. 1 being the most efficient and 10 being the least.
* **messages** - Array of infomational reasons for why the score was computed.


## Contributing


    $ git clone https://github.com/josh/css-explain.git
    $ cd css-explain/

Run tests

    $ make test
