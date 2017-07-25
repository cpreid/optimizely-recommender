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

