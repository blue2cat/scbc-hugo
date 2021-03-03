$(document).ready(function(){

  var AppView = Backbone.View.extend({

    el: $("#sermon-content"),
    audio_data: [],
    
    events: {
      "submit": "getFormFields",
      "reset": "resetFormFields"
    },

    template: _.template([
      '<div class="pr-0 pl-0" id="sermon-item">',
        '<div class="card bg-light text-center audio-box">',
          '<div class="card-header"><%= sermon_title %></div>',
          '<div class="card-body pr-2 pl-2">',
	        '<p><%= sermon_text %> <%= sermon_text_divider %> ',
	        '<%= sermon_speaker %> <span class="text-primary p-0">//</span>',
	        '<%=sermon_date %> <span class="text-primary p-0">//</span> ',
	        '<%=sermon_type %> </p>',
	        '<audio controls class="audio-width" style="min-width: 80%;">',
	          '<source src="<%= sermon_audio_location %>" type="audio/mpeg" />',
	          '<a href="<%= sermon_audio_location %>">Audio</a>',
	        '</audio>',
          '</div>',
        '</div>',
      '</div>'
    ].join("\n")),
    
    renderSermons: function(audio_data) {
      var sorted_sermons = _l.sortBy(audio_data, 'sort_date').reverse();
      if (!_l.isUndefined(this.paginator)) {
        this.paginator.pagination("destroy")
      }
      this.paginator = $('#sermon-audio').pagination({
          dataSource: sorted_sermons,
          position: 'top',
          callback: function(data, pagination) {
            var data_container = this.$el.find("#sermon-audio-content");
            data_container.html("");
            _l.forEach(data, function(value, key) {
             value["sermon_text_divider"] = (value["sermon_text"]=="") ? '' : '<span class="text-primary p-0">//</span>'
              data_container.append(this.template(value));
            }.bind(this));
          }.bind(this)
      })
      this.$el.find("#sermon-total").html(_l.toString(sorted_sermons.length) + " Results")
    },

    render: function(data) {
      this.audio_data = data;
      this.audio_data = _l.forEach(this.audio_data, function(value, key) {
        var print_date = _l.toString(value["sermon_date"]);
        value["sort_date"] = print_date.substr(6, 9) + "/" + print_date.substr(0, 5);
        this.audio_data[key] = value;
      }.bind(this));
      this.renderSermons(this.audio_data);
    },

    filterSermons: function(filter) {
      var filtered_data = _l.filter(this.audio_data, function(o) {
        return _l.every(filter, function(value, key) {
          if (key == "sermon_text") {
            return _l.startsWith(_l.lowerCase(o[key]), _l.lowerCase(value))
          }
          else if (key == "sermon_title" || key == "sermon_speaker" || key == "sermon_series") {
            return _l.includes(_l.lowerCase(o[key]), _l.lowerCase(value))
          }
          else {
            return o[key] == value;
          }
        })
      })
      this.renderSermons(filtered_data);
    },

    resetFormFields: function(e) {
      this.filterSermons({});
    },

    getFormFields: function(e) {
      var filters = {}
      var active_filters = {}
      filters["sermon_title"] = this.$el.find("input#title").val() || "";
      filters["sermon_speaker"] = this.$el.find("input#speaker").val() || "";
      filters["sermon_text"] = this.$el.find("input#text").val() || "";
      filters["sermon_series"] = this.$el.find("input#series").val() || "";
      filters["sermon_year"] = this.$el.find("select#year").val() || "";
      filters["sermon_type"] = this.$el.find("select#catagory").val() || "";
      _l.forEach(filters, function(value, key) {
        if (!_l.isEqual(value, "")) {
          active_filters[key] = value
        };
      }.bind(this));
      this.filterSermons(active_filters); 
      e.preventDefault();
    }
  });

  $.getJSON( "data/sermon_data.json", function( data ) {
  	var App = new AppView;
  	App.render(data);
  });
});
