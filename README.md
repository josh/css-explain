CSS `EXPLAIN`
=============

Think of it like SQL `EXPLAIN`, but for CSS selectors.


## Usage

``` javascript
cssExplain("li .item")
{
  "parts": ["li", ".item"],
  "specificity": [0, 1, 1],
  "category": "class",
  "score": 6
}
```

## Contributing


    $ git clone https://github.com/josh/css-explain.git
    $ cd css-explain/

Run tests

    $ make test
