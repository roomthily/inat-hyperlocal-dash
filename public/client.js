$(function() {
    $('#search').on('click', function() {
    // set up your query
    
    var taxon = $('.toggle-field input:checked').val();
    
    // calc the two week window data
    var search_date = calc_two_weeks_ago();
    
    var params = {
      // "month": 4, // to get results from a single month (need month and year)
      // "year": 2017,
      "d1": search_date, // search from this date (inclusive) for observation date
      "iconic_taxa": taxon, 
      //"quality_grade": "research", 
      "nelat": 40.216753, //the bounding box coords. this is the flatter parts of boco
      "nelng": -105.118108,
      "swlat": 39.911961,
      "swlng":-105.412674,
      "order": "desc",
      "order_by": "observed_on",
      "photos": true // only return observations with photographs
    }

    $.get({
      url: '/observations',
      data: params,
      success: function(data) {
        /**
          the response is a dict of cards(taxon name: card blob):
            total_observed_for_query: total for query
            total_observed: total for taxon
            common_name: preferred common name for taxon
            observed: date of photo
            photo: url for selected photo
            credit =>
              url: url to observation page
              attribution: attribution for photo
              name: photog's name and/or inat alias
        **/

        var output = card_tmpl(data)

        $('div.results').html(output);
      }
    });
    
    function calc_two_weeks_ago() {
      // in iso 8601 date only
      var d = new Date();
      var day = d.getDate();
      d.setDate(day-14);
      return moment(d).format('YYYY-MM-DD');
    }
    
  });
  
  // load the template to display the card
  // this uses the handlebars engine (loaded on index.html)
  
  // this has a malformed div for total_box but i'm leaving it for now
  var card_tmpl = Handlebars.compile('{{#each cards}}<div class="card"><div class="top left"><img src="{{photo}}" title="{{@key}} aka {{common_name}}" alt="{{credit.attribution}}"/></div><div class="top right"><h2>{{common_name}}<br/>({{@key}}) <a href="{{credit.url}}"><i class="fa fa-paper-plane" aria-hidden="true"></i></a></h2></div><div class="bottom left"><div class="total_box"><div class="found">{{total_observed_for_query}}</div></div><div class="total">{{total_observed}}</div></div><div class="bottom right"><p>Observation by: {{credit.name}}</p><p>Credit: {{credit.attribution}}</p></div></div>{{else}}<div class="error"><p><span>＜(。_。)＞</span> Oh no! We ran into a problem talking to iNaturalist!</p></div>{{/each}}');
});

