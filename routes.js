var jq = require('json-query'),
    Client = require('node-rest-client').Client,
    entries = require('object.entries');

var routes = function(app) {
  
  app.get("/", function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
  });

//
// our inat access & processing
//
  app.get("/observations", function(req, res) {
    //
    // search inaturalist and return an example of each species
    // found in the results
    //
    var client = new Client();

    var args = {
      parameters: req.query
    };

    var req = client.get('http://api.inaturalist.org/v1/observations', args,
              function(data, response) {
      
      // get the taxon names
      var query = jq('results.taxon.name', {data: data});
      
      // bin the species counts as {species: count}
      var freqs = _accumulate(query.value);
      
      var cards = {};
      
      for (var [key, value] of entries(freqs)) {
        // query for blobs that have that taxon name
        var qs = 'results[*:taxonName('+key+')]';
        console.log('QUERY STRING: ', qs);
        var query = jq(qs, {
          data: data,
          locals: {
            taxonName: function(item, text) {
              return item.taxon.name === text;
            }
          }
        });
        
        // get the blobs from the query object
        var items = query.value;
        
        // get a random one from the set
        var selected = items[Math.floor(Math.random() * items.length)];
        
        // trim down the object to what we need for bandwidth
        cards[key] = {
          "total_observed_for_query": freqs[key], // the count for this query
          "common_name": selected.taxon.preferred_common_name,
          "total_observed": selected.taxon.observations_count, // the count provided by the api for *all* observed
          "observed": selected.time_observed_at,
          "photo": selected.observation_photos[0].photo.url,
          "credit": {
            "url": selected.uri,
            "attribution": selected.observation_photos[0].photo.attribution,
            "name": selected.user.name !== null ? selected.user.name + ' (' + selected.user.login + ')' : selected.user.login
          }
        }; 
      }
      
      // return our subset data
      res.json({"cards": cards});
    }).on('error', function(error) {
      console.log(error);
      res.json({"error": error});
    });
  
  });
};
 
function _accumulate(d) {
  return d.reduce(function(acc, curr) {
        if (typeof acc[curr] == 'undefined') {
            acc[curr] = 1;
        } else {
            acc[curr]++;
        }
        return acc
      }, {}); 
}

 
module.exports = routes; 