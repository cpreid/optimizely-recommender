# Optimizely Recommender Wrapper

> Wrapper for Optimizely recommendation API

E.g. - Attempt to display 15 total recommendations // Load 10 Co-browse recommendations as primary // Backfill with popular recommendations
```
 RecService.init({serviceId: 12345678910, log: true})
  .addRecommender({max: 10, id: 12345612345, type: 'cobrowse', target:'PID_2345345'})    
  .addRecommender({max: 15, id: 12345654321, type: 'popular'})    
  .addDatasource(fetchFromAPI)
  .run({max: 15})
  .then(function(recs) {
    console.log(recs);
    // render the recs in the extension/webpage
  });
```

---

> Create a new Recommender Service

``` RecService.init({serviceId: 123456789, log: true})```

### init
Returns a ```RecService``` instance
```
RecService.init({Object} config)
```

##### config parameters:

| parameter | type   | details                                            | required | default |
|-----------|--------|----------------------------------------------------|----------|---------|
| serviceId       | integer | The recommender service ID configured in Optimizely | yes      |     undefined    |
| log      | boolean  | Will log debug messages to the console                      | no      |    false    |
| prefilter      | function  | Filter out recommendations, must return a boolean                      | no      |    undefined    |
| postfilter      | boolean  | Filter out recommendations, must return a boolean                      | no      |    undefined    |
| canonicalize      | boolean  | Format the metadata associated each recommendation                      | no      |    undefined    |

* *The prefilter, postfiler and canonicalize functions will be applied globally across all recommenders added via ```addRecommender```*

---

> Add a recommender that will be queried

``` RecService.addRecommender({serviceId: 123456789, log: true})```

### addRecommender
Returns a ```RecService``` instance
```
RecService.addRecommender({Object} config)
```

##### config parameters:

| parameter | type   | details                                            | required | default |
|-----------|--------|----------------------------------------------------|----------|---------|
| id       | integer | The recommender ID configured in Optimizely | yes      |     undefined    |
| type       | string | The type of fetcher that will be used [cobrowse, popular, user, recent, cobuy] | yes      |     undefined    |
| max       | integer | The maximum number of rec items to be fetched | no      |     20    |
| name       | string | The name of the recommender used for. Useful when using `run`. See below | no      |     config.id    |
| target       | string | An ID that provide context for algorithms require id [cobrowse, cobuy]  | conditional, see below   |     undefined    |
| prefilter      | function  | Filter out recommendations, must return a boolean                      | no      |    undefined    |
| postfilter      | boolean  | Filter out recommendations, must return a boolean                      | no      |    undefined    |
| canonicalize      | boolean  | Format the metadata associated each recommendation                      | no      |    undefined    |

* *cobuy and recent are not yet supported*
* target is only required for cobrowse and cobuy. The target should be equal to the record ID that you want to use as context, e.g., show co-browsed recommendations where users that browsed a specific item (target) also browsed other items
* *The prefilter, postfiler and canonicalize functions will override any functions added via ```init```*

---

> Add an external datasource (typically, a rest api)

``` RecService.addDatasource(functionThatReturnsAPromise)```

### addDatasource
Returns a ```RecService``` instance
```
RecService.addDatasource({Function} customFetchFcn)
```

| parameter | type   | details                                            | required | default |
|-----------|--------|----------------------------------------------------|----------|---------|
| customFetchFcn       | function | Function that returns a `Promise`. This would typically be a Promise that wraps an XHR request that fetches JSON data from some REST endpoint. | yes      |     undefined    |

*example*
```
 RecService.init({serviceId: 12345678910, log: true})
  .addRecommender({max: 15, id: 12345654321, type: 'popular'})    
  .addDatasource(function() {
      var xhr = new XMLHttpRequest;
      xhr.open('GET', 'https://some-rest-endpoint.com/?q=keyword');
      xhr.send();
      return new Promise(function(resolve, reject) {
        xhr.onload = function() {
          resolve(JSON.parse(this.responseText).data || []);
        };
        xhr.onerror = function() {
          reject('XHR failed');
        };
      });     
   })
  .run({max: 15})
  .then(function(recs) {
    console.log(recs);
    // render the recs in the extension/webpage
  });
```

---

### run
> Fetch the recommendations for each recommender
Returns a ```Promise``` that resolves to an Object literal mapping recommender.name (or IDs) to their resultset
```
instance.run()
```

##### config parameters:

None

---

### merge
> Fetch the recommendations for each recommender, merge into a single array

Returns a ```Promise``` that resolves to a single array of recommendation objects
```
instance.merge({Object} config)
```

##### config parameters:

| parameter | type   | details                                            | required | default |
|-----------|--------|----------------------------------------------------|----------|---------|
| max       | integer | The maximum number of rec items in the result array. The result array will be a coalescence of each recommender's results, prioritized by the order in which ```addRecommender``` was called | no      |     undefined    |
