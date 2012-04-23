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
     $$ = function(selector) { return document.querySelectorAll(selector) };

  function renderResults(results) {
    $('results').className = "";

    $('score').value = results.score;
    $('score').textContent = ""+results.score+"/10";

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
  window.addEventListener('load', function() {
    if (location.hash) {
      var selector = location.hash.slice(1)
      $('selector').value = selector;
      renderResults(cssExplain(selector));
    }
  });
})();
