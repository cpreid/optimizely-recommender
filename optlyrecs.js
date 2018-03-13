var RecService = (function() {

  // attach optimizely modules upon `init`, only as needed
  var optlyUtils = {}; 

  var Datasource = function() {
    this.name = 'default';
    this.type = 'default';
    // enrich dataset with additional metadata
    this.normalizeReults = function(recs) {      
      recs.forEach(function(rec) {
        rec['__optlyMeta__'] = {
          'rec_type': this.type,
          'rec_name': this.name
        };
      });
      return {
        'recs': recs,
        'name': this.name
      };
    }.bind(this);
  }

  var CustomDatasource = function(fetcherFnc, idx) {   
    Datasource.call(this);     
    this.name = 'custom_datasource_' + idx;  
    this.type = 'custom_datasource';
    this.run = function() {
      return fetcherFnc().then(this.normalizeReults);
    }
  }  

  var Recommender = function(serviceKeys, config) {    
    Datasource.call(this);
    this.name = config.name || config.id;
    this.type = config.type;
    
    var getTarget = function() {
      switch (config.type) {
        case 'popular':
          return 'popular';
        case 'cobrowse':
          return config.target;
        case 'user':
          return optlyUtils.visitor.visitorId;
      }
    }

    this.run = function() {
      var fetcher = optlyUtils.recommender.getRecommendationsFetcher(serviceKeys, getTarget(), {
        preFilter: config.prefilter,
        canonicalize: config.canonicalize,
        postFilter: config.postfilter
      });
      return fetcher.next(config.max || 10).then(this.normalizeReults);
    }
  }

  var Fetcher = function(fetcherConfig) {    

    var logger = (function() {
      if(fetcherConfig.log) return console;
      return {log: function() {}, group: function() {}, groupEnd: function() {}, groupCollapsed: function() {}, dir: function() {}};
    })();
    
    this.logger       = logger;
    this.recommenders = []; 
    this.datasources  = []; 

    this.addRecommender = function(config) {
      // filters added here will override global filters added via `init`
      config.prefilter    = config.prefilter || fetcherConfig.prefilter;
      config.postfilter   = config.postfilter || fetcherConfig.postfilter;
      config.canonicalize = config.canonicalize || fetcherConfig.canonicalize; 

      this.recommenders.push(new Recommender({
        recommenderServiceId: fetcherConfig.serviceId,
        recommenderId: config.id
      }, config));
      return this;
    }    

    this.addDatasource = function(fetcherFnc) {
      this.datasources.push(new CustomDatasource(fetcherFnc, this.datasources.length + 1));
      return this;
    }

    this.execAll = function() {
      var recommenderPromises = this.recommenders.map(function(r) { return r.run(); }),
          datasourcePromises  = this.datasources.map(function(r) { return r.run(); }),
          allFetchPromises = recommenderPromises.concat(datasourcePromises);
      return Promise.all(allFetchPromises);
    }

    this.run = function() {
      var returnMap = {};
      return this.execAll().then(function(recResultsObjs) {
        logger.groupCollapsed('RECOMMENDATIONS');
        recResultsObjs.forEach(function(recResultsInstance) {
          returnMap[recResultsInstance.name] = recResultsInstance.recs;
        });
        if(fetcherConfig.log) {
           // only loop over results if the logger is on
          for (var r in returnMap) {
            logger.groupCollapsed('Recommender "' + r + '" (' + returnMap[r].length + ')');
            logger.dir(returnMap[r]);
            logger.groupEnd();
          }
        }
        logger.log('[Run] ', returnMap);
        logger.groupEnd();
        return returnMap;
      });
    }

    this.merge = function(config) {
      config = config || {};
      var results = [];
      return this.execAll().then(function(recResultsObjs) {
        logger.groupCollapsed('RECOMMENDATIONS');
        recResultsObjs.forEach(function(recObj) {
          logger.groupCollapsed('Recommender "' + recObj.name + '" (' + recObj.recs.length + ') ');
          logger.dir(recObj.recs);
          logger.groupEnd();
          results = results.concat(recObj.recs.map(function(rec) {
            return rec;
          }));
        });        
        if (config.max) {
          results = results.slice(0, config.max);
        }
        logger.log('[Merged] ', results);
        logger.groupEnd();
        return results;
      });
    }
  }

  return {
    init: function(config) {
      optlyUtils.recommender = optlyUtils.recommender || optimizely.get('recommender');
      optlyUtils.visitor     = optlyUtils.visitor     || optimizely.get('visitor');
      return new Fetcher(config);
    }
  }
})();