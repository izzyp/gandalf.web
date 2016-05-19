angular.module('app').config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider.state('main', {

    abstract: true,
    template: '<ui-view />',
    ncyBreadcrumb: {
      skip: true
    }
  });

  $stateProvider.state('private', {
    parent: 'auth',
    abstract: true,
    auth: true,
    templateUrl: 'templates/layouts/private.html',
    ncyBreadcrumb: {
      skip: true
    },
    resolve: {
      user: ['UserService', function (UserService) {
        return UserService.current();
      }],
      projects: ['ProjectsService', '$log', function (ProjectsService, $log) {
        return ProjectsService.all();
      }]
    },
    controller: 'AppController'
  });
  $stateProvider.state('public', {
    parent: 'auth',
    abstract: true,
    auth: false,
    templateUrl: 'templates/layouts/public.html',
    ncyBreadcrumb: {
      skip: true
    }
  });

  $stateProvider.state('sign-in', {
    parent: 'public',
    url: '/sign-in?username',
    controller: 'SignInController',
    templateUrl: 'templates/sign-in.html',
    ncyBreadcrumb: {
      label: 'Sign in to Gandalf'
    }
  }).state('sign-up', {
    parent: 'public',
    url: '/sign-up?username?email',
    controller: 'SignUpController',
    templateUrl: 'templates/sign-up.html',
    ncyBreadcrumb: {
      label: 'Sign up to Gandalf'
    }
  });

  $stateProvider.state('tables-list', {
    parent: 'private',
    url: '/tables?size?page',
    params: {
      size: '25'
    },
    controller: 'TablesListController',
    templateUrl: 'templates/tables-list.html',
    ncyBreadcrumb: {
      label: 'Tables'
    }
  }).state('tables-create', {
    parent: 'private',
    url: '/tables/create',
    controller: 'TablesCreateController',
    templateUrl: 'templates/tables-create.html',
    ncyBreadcrumb: {
      label: 'Create new table',
      parent: 'tables-list'
    }
  });

  $stateProvider.state('tables-details', {
    parent: 'private',
    abstract: true,
    url: '/tables/:id',
    templateUrl: 'templates/tables-details.html',
    controller: 'TablesDetailsController',
    resolve: {
      table: ['DecisionTable', '$stateParams', function (DecisionTable, $stateParams) {
        return DecisionTable.byId($stateParams.id);
      }]
    },
    ncyBreadcrumb: {
      label: "{{table.title}}",
      parent: 'tables-list',
      skip: false
    }
  }).state('tables-details.edit', {
    url: '/edit',
    controller: 'TablesEditController',
    templateUrl: 'templates/tables-edit.html',
    ncyBreadcrumb: {
      label: 'Edit'
    }
  }).state('tables-details.analytics', {
    url: '/analytics',
    controller: 'TablesAnalyticsController',
    templateUrl: 'templates/tables-analytics.html',
    resolve: {
      analytics: ['AnalyticsTable', '$stateParams', function (AnalyticsTable, $stateParams) {
        return AnalyticsTable.byId($stateParams.id);
      }]
    },
    ncyBreadcrumb: {
      label: 'Analytics'
    }
  }).state('tables-details.revisions', {
      url: '/revisions',
      controller: 'TablesRevisionsController',
      templateUrl: 'templates/tables-revisions.html',
      ncyBreadcrumb: {
        label: 'Revisions'
      }
  }).state('tables-details.debugger', {
    url: '/debug',
    controller: 'DebuggerDetailsController',
    templateUrl: 'templates/tables-debugger.html',
    ncyBreadcrumb: {
      label: 'Debugger'
    },
    params: {
      id: null,
      decision: null
    }
  });

  $stateProvider.state('tables-diff', {
    parent: 'private',
    url: '/tables/:id/diff/:revisionId',
    controller: 'TablesDiffController',
    templateUrl: 'templates/tables-diff.html',
    resolve: {
      compare: ['$gandalf', '$stateParams', 'DecisionDiffTable', function ($gandalf, $stateParams, DecisionDiffTable) {
        return $gandalf.admin.getTableChangelogsDiff($stateParams.id, $stateParams.revisionId).then(function (resp) {
          return {
            original: new DecisionDiffTable(null, resp.data.original.model.attributes),
            revision: new DecisionDiffTable(null, resp.data.compare_with.model.attributes)
          }
        })
      }]
    },
    ncyBreadcrumb: {
      label: 'Diff: {{revision.id}}',
      parent: 'tables-details.edit'
    }
  });


  $stateProvider.state('history-list', {
    parent: 'private',
    url: '/history?tableId?size?page',
    params: {
      size: '25'
    },
    controller: 'HistoryListController',
    templateUrl: 'templates/history-list.html',
    ncyBreadcrumb: {
      label: 'History'
    },
    resolve: {
      selectedTable: ['DecisionTable', '$stateParams', function (DecisionTable, $stateParams) {
        return $stateParams.tableId ? DecisionTable.byId($stateParams.tableId) : null;
      }]
    }
  }).state('history-details', {
    parent: 'private',
    url: '/history/:id',
    controller: 'HistoryDetailsController',
    templateUrl: 'templates/history-details.html',
    ncyBreadcrumb: {
      label: 'Decision: {{table.id}}',
      parent: 'history-list'
    },
    resolve: {
      historyResult: ['DecisionHistoryTable', '$stateParams', function (DecisionHistoryTable, $stateParams) {
        var res = new DecisionHistoryTable($stateParams.id);
        return res.fetch();
      }]
    }
  });

  $urlRouterProvider.otherwise('/tables');
});
