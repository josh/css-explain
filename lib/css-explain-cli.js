(function() {
  "use strict";
  
  var fs = require('fs');
  var parserlib = require("parserlib");
  var cssExplain = require('./css-explain').cssExplain;

  //
  // Fills a string containing special templating syntax with the data provided.
  //
  // Ex:
  //    tmpl = "${name} got a ${grade} in ${course}.";
  //    data = { name: "John", grade: "B", course: "Plant Pathology" };
  //    tmpl.template(data); // outputs "John got a B in Plant Pathology."
  //
  String.prototype.template = function(data) {
    var regex = null,
      completed = this.toString(),
      el = null;
    for (el in data) {
      regex = new RegExp('\\${' + el + '}', 'g');
      completed = completed.replace(regex, data[el]);
    }
    return completed.toString();
  };

  var currentStyleSheet = null, outputType = null, results = [];
  var parser = new parserlib.css.Parser();
  var cssExplainCLI = {
    outputStrings: {
      "csv-header": "Selector,Parts,Category,Key,Specificity,Score,Messages",
      "startstylesheet-header": "Results for ${currentStyleSheet}:",
      "result": {
        "human": "    Results with score of ${score}:\n        ${humanReadableSelectors}\n        ",
        "csv": "${selector},${parts},${category},${key},${specificity},${score},${messages}"
      }
    },
    compareSelectorScores: function(explainA, explainB) {
      return explainA.score - explainB.score;
    },
    // Many thanks to http://james.padolsey.com/javascript/wordwrap-for-javascript/
    wordwrap: function(str, width, brk, cut) {
        brk = brk || '\n';
        width = width || 75;
        cut = cut || false;
        if (!str) { return str; }
        var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
        return str.match( RegExp(regex, 'g') ).join( brk );
    },
    setupParser: function(){
      // Setup parser and listeners
      parser.addListener("startrule", function(event){
        for(var i=0,len=event.selectors.length; i < len; i++){
          var selector = event.selectors[i];
          var explained = cssExplain(selector.text);
          results.push(explained);
        }
      });
      parser.addListener("startstylesheet", function(){
        if(outputType == "human"){
          console.log(cssExplainCLI.outputStrings["startstylesheet-header"].template({
            currentStyleSheet: currentStyleSheet
          }));
        }
      });
      parser.addListener("endstylesheet", function(){
        var len = results.length, currentScore = 10, resultsWithCurrentScore = [];
        results.sort(cssExplainCLI.compareSelectorScores);
        for(var s = len-1; s >= 0; s--){
          if(results[s].score >= currentScore){
            resultsWithCurrentScore.push(results[s].selector.replace(/\s+/g, " "));
          }else{
            if(resultsWithCurrentScore.length > 0){
              results[s].humanReadableSelectors = cssExplainCLI.wordwrap(resultsWithCurrentScore.join(', '), 72, "\n        ")
              console.log(cssExplainCLI.outputStrings["result"][outputType].template(results[s]));
            }
            currentScore -= 1;
            resultsWithCurrentScore = [];
          }
        }
      });
    },
    parseDocuments: function(files, userOutputType){
      outputType = userOutputType;
      
      // If CSV, output the header
      if(outputType == "csv"){
        console.log(cssExplainCLI.outputStrings["csv-header"]);
      }
      
      files.forEach(function(val, index, array){
        fs.readFile(val, 'utf8', function (err, data) {
          if (err) {
            return console.log(err);
          }
          currentStyleSheet = val;
          parser.parseStyleSheet(data);
        });
      });
    }
  }

  cssExplainCLI.setupParser();

  if (typeof exports !== 'undefined') {
    exports.cssExplainCLI = cssExplainCLI;
  } else {
    window.cssExplainCLI = cssExplainCLI;
  }
})();
