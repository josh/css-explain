(function() {
  var rules, selector, report, i, len;
  rules = document.styleSheets[0].cssRules;
  if (!rules) return;
  for (i = 0, len = rules.length; i < len; i++) {
    selector = rules[i].selectorText;
    report = cssExplain(selector);
    console.log(selector, report.score, report.messages)
  }
})();

(function() {
  var $ = function(id) { return document.getElementById(id) },
     $$ = function() { return document.querySelectorAll.apply(document, arguments); };

  function renderMeter(el) {
    var frame = $$('.meter-frame', el)[0],
        bar   = $$('.meter-bar', el)[0],
        value = el.value,
        low   = parseInt(el.getAttribute('low')),
        high  = parseInt(el.getAttribute('high'));

    if (value > high) {
      bar.className = "meter-bar meter-high";
    } else if (value < low) {
      bar.className = "meter-bar meter-low";
    } else {
      bar.className = "meter-bar";
    }

    bar.style.width = (value*10) + "%";
  }

  function renderResults(results) {
    $('results').className = "";

    var score = $('score');
    score.value = results.score;
    renderMeter(score);

    $('category').textContent = results.category;

    $('specificity').textContent = results.specificity.join(',');

    $('messages').innerHTML = "";

    var i;
    for (i = 0; i < results.messages.length; i++) {
      var p = document.createElement('p');
      p.textContent = results.messages[i];
      $('messages').appendChild(p);
    }
  }

  var form = document.forms[0];
  form.addEventListener('submit', function(event) {
    event.preventDefault();
  });
  form.addEventListener('input', function() {
    renderResults(cssExplain($('selector').value));
  });

  if (location.hash) {
    var selector = location.hash.slice(1)
    $('selector').value = selector;
    renderResults(cssExplain(selector));
  }
})();
