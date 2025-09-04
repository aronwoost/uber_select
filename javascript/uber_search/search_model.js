(function($) {
  UberSearch.SearchModel = function(options){
    var data, results
    var processedQuery = ''
    var context = this
    options = $.extend({minQueryLength: 0}, options)

    this.setQuery = function(value){
      value = context.queryPreprocessor(value)

      if (processedQuery == value) { return }
      processedQuery = value || ''
      this.updateResults()
      $(this).trigger('queryChanged')
    }

    this.getQuery = function(){
      return processedQuery || ''
    }

    this.setData = function(value){
      data = value || []
      this.updateResults()
    }

    this.getResults = function(){
      return results
    }

    this.updateResults = function(){
      if (options.minQueryLength > processedQuery.length) {
        results = []
      } else if (this.isBlankQuery()){
        results = $.each(this.dataForMatching(processedQuery, data), function(){ return this })
      } else {
        results = []
        var pattern = this.patternForMatching(processedQuery)
        $.each(this.dataForMatching(processedQuery, data), function(index, datum){
          if (context.match(pattern, context.datumPreprocessor(datum), processedQuery)){
            results.push(datum)
          }
        })
      }
      $(this).trigger('resultsUpdated')
    }

    this.isBlankQuery = function(){
      return processedQuery === ''
    }

    // Can be overridden to select a subset of data for matching
    // Defaults to the identity function
    this.dataForMatching = function(processedQuery, data){
      return data
    }

    // Provides a regexp for matching the processedDatum from the processedQuery
    // Can be overridden to provide more sophisticated matching behaviour
    this.patternForMatching = function(processedQuery){
      return new RegExp(escapeForRegExp(processedQuery), 'i')
    }

    // Can be overridden to provide more sophisticated matching behaviour
    this.match = function(pattern, processedDatum, processedQuery){
      return pattern.test(processedDatum)
    }

    // Can be overridden to mutate the query being used to match before matching
    // Defaults to whitespace trim
    this.queryPreprocessor = function(query){
      return $.trim(query)
    }

    // Can be overridden to mutate the data the moment before it is matched
    // Useful extract string from JSON datum
    // Defaults to the identity function
    this.datumPreprocessor = function(datum){
      return datum
    }

    // INITIALIZATION
    $.extend(this, options) // Allow overriding of functions
    delete this.data // Data isn't an attribute we want to expose
    this.setData(options.data)
  }

  // HELPER FUNCTIONS

  // Escape a string before it is used in a RegExp
  function escapeForRegExp(string){
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
})(jQuery)
