var RecService = (function() {

  var optlyUtils = {
    'recommender': optimizely.get('recommender'),
    'visitor': optimizely.get('visitor')
  }

  var Recommender = function(serviceKeys, config) {
    var recommenderName = config.name || config.id;

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
      return fetcher.next(config.max || 10).then(function(recs) {
        recs.forEach(function(rec) {
          rec['__optlyMeta__'] = {
            'rec_type': config.type,
            'rec_name': recommenderName
          };
        });
        return {
          'recs': recs,
          'name': recommenderName
        };
      });
    }
  }

  var Fetcher = function(fetcherConfig) {    

    var logger = (function() {
      if(fetcherConfig.log) return console;
      return {log: function() {}, group: function() {}, groupEnd: function() {}, groupCollapsed: function() {}};
    })();

    this.recommenders = [];    

    this.addRecommender = function(config) {
      this.recommenders.push(new Recommender({
        recommenderServiceId: fetcherConfig.serviceId,
        recommenderId: config.id
      }, config));
      return this;
    }    
    this.execAll = function() {
      var fetchPromises = this.recommenders.map(function(r) { return r.run(); });
      return Promise.all(fetchPromises);
    }
    this.run = function() {
      var returnMap = {};
      return this.execAll().then(function(recResultsObjs) {
        logger.groupCollapsed('RECOMMENDATIONS');
        recResultsObjs.forEach(function(recResultsInstance) {
          returnMap[recResultsInstance.name] = recResultsInstance.recs;
        });                
        for (var r in returnMap) {
          logger.groupCollapsed('Recommender "' + r + '" (' + returnMap[r].length + ')');
          logger.dir(returnMap[r]);
          logger.groupEnd();
        }
        logger.log('[Run] ', returnMap);
        logger.groupEnd();
        return returnMap;
      });
    }
    this.merge = function(config) {
      config = config || {};
      var fetchPromises = this.recommenders.map(function(r) {
          return r.run();
        }),
        results = [];
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
      return new Fetcher(config);
    }
  }
})();