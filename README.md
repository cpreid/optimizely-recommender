# Optimizely Recommender Wrapper

> Wrapper for Optimizely recommendation API

E.g. - Attempt to display 15 total recommendations // Load 10 Co-browse recommendations as primary // Backfill with popular recommendations
```
 RecService.init({serviceId: 12345678910, log: true})
  .addRecommender({max: 10, id: 12345612345, type: 'cobrowse', target:'PID_2345345'})    
  .addRecommender({max: 15, id: 12345654321, type: 'popular'})    
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
