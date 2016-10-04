'use strict';

angular.module('openshiftConsole')
  .factory('logLinks', function($anchorScroll, $document, $location, $window) {
      // TODO (bpeterse): a lot of these functions are generic and could be moved/renamed to
      // a navigation oriented service.


      var scrollTop = function(node) {
        if(!node) {
          window.scrollTo(null, 0);
        } else {
          node.scrollTop = 0;
        }
      };


      var scrollBottom = function(node) {
        if(!node) {
          window.scrollTo(0, document.body.scrollHeight - document.body.clientHeight);
        } else {
          node.scrollTop = node.scrollHeight;
        }
      };


      var scrollTo = function(anchor, event) {
        // sad face. stop reloading the page!!!!
        event.preventDefault();
        event.stopPropagation();
        $location.hash(anchor);
        $anchorScroll(anchor);
      };


      // new tab: path/to/current?view=chromeless
      var chromelessLink = function(options, fullLogURL) {
        if (fullLogURL) {
          $window.open(fullLogURL, '_blank');
          return;
        }
        var params = {
          view: 'chromeless'
        };
        if (options && options.container) {
          params.container = options.container;
        }
        params = _.flatten([params]);
        var uri = new URI();
        _.each(params, function(param) {
          uri.addSearch(param);
        });
        $window.open(uri.toString(), '_blank');
      };

      // broken up for readability:
      var template = _.template([
        "/#/discover?",
        "_g=(",
          "time:(",
            "from:now-1w,",
            "mode:relative,",
            "to:now",
          ")",
        ")",
        "&_a=(",
          //"columns:!(_source),",
          "columns:!(kubernetes<%= use_cdm ? '.' : '_' %>container_name,message),",
          "index:'<%= project_prefix %><%= namespace %>.<%= namespaceUid %>.*',",
          "query:(",
            "query_string:(",
              "analyze_wildcard:!t,",
              "query:'kubernetes<%= use_cdm ? '.' : '_' %>pod_name:\"<%= podname %>\" AND kubernetes<%= use_cdm ? '.' : '_' %>namespace_name:\"<%= namespace %>\"'",
            ")",
          "),",
          "sort:!(<%= time_field %>,desc)",
        ")",
        // NOTE: slightly older versions of kibana require openshift_ prefix, not console_
        "#console_container_name=<%= containername %>",
        // backlink should be encoded.  passing URI.encode(backlink) should be sufficient
        "&console_back_url=<%= backlink %>"
      ].join(''));


      var archiveUri = function(opts) {
        return template(opts);
      };

      return {
        scrollTop: scrollTop,
        scrollBottom: scrollBottom,
        scrollTo: scrollTo,
        chromelessLink: chromelessLink,
        archiveUri: archiveUri
      };
    }
  );
