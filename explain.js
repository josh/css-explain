(function() {
  var i, report, reports = cssExplain(document.styleSheets);
  for (i = 0; i < reports.length; i++) {
    var report = reports[i];
    console.log(report.selector, report.score, report.messages)
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
    } else if (value <= low) {
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

    $$('#categories .category-active')[0].className = 'block category';
    $(results.category+'-category').className = 'block category category-active';

    $('a-specificity').textContent = results.specificity[0];
    $('b-specificity').textContent = results.specificity[1];
    $('c-specificity').textContent = results.specificity[2];

    $('messages').innerHTML = "";

    var i;
    for (i = 0; i < results.messages.length; i++) {
      var li = document.createElement('li');
      li.textContent = results.messages[i];
      li.className = 'message';
      $('messages').appendChild(li);
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
    var selector = decodeURIComponent(location.hash.slice(1));
    $('selector').value = selector;
    renderResults(cssExplain(selector));
  }
})();
