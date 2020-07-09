import React from 'react';
import {
  Router as DefaultRouter,
  Route,
  Switch,
  StaticRouter,
} from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/lib/renderRoutes';
import history from '@@/history';

const Router = DefaultRouter;

const routes = [
  {
    path: '/',
    component: require('../../layouts/index.js').default,
    routes: [
      {
        path: '/first',
        exact: true,
        component: require('../first/index.js').default,
        title: 'first',
      },
      {
        path: '/',
        exact: true,
        component: require('../index.js').default,
        title: 1111,
      },
      {
        path: '/third',
        exact: false,
        component: require('../third/_layout.js').default,
        routes: [
          {
            path: '/third/first',
            exact: true,
            component: require('../third/first/index.js').default,
            title: '3-1',
          },
          {
            path: '/third',
            exact: true,
            component: require('../third/index.js').default,
            title: 'third',
          },
          {
            path: '/third/second',
            exact: false,
            component: require('../third/second/_layout.js').default,
            routes: [
              {
                path: '/third/second/first',
                exact: true,
                component: require('../third/second/first/index.js').default,
                title: '3-2-11',
              },
              {
                path: '/third/second',
                exact: true,
                component: require('../third/second/index.js').default,
                title: '3-2',
              },
              {
                component: () =>
                  React.createElement(
                    require('/Users/alex/Documents/GitHub/umi-plugin-nav/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
                      .default,
                    { pagesPath: 'src/pages', hasRoutesInConfig: false },
                  ),
              },
            ],
            title: '3-2-layout',
          },
          {
            component: () =>
              React.createElement(
                require('/Users/alex/Documents/GitHub/umi-plugin-nav/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
                  .default,
                { pagesPath: 'src/pages', hasRoutesInConfig: false },
              ),
          },
        ],
        title: '3-layout',
      },
      {
        path: '/ttt',
        exact: false,
        component: require('../ttt/_layout.js').default,
        routes: [
          {
            path: '/ttt/first',
            exact: true,
            component: require('../ttt/first/index.js').default,
            title: '3-1',
          },
          {
            path: '/ttt',
            exact: true,
            component: require('../ttt/index.js').default,
            title: 3,
          },
          {
            path: '/ttt/second',
            exact: false,
            component: require('../ttt/second/_layout.js').default,
            routes: [
              {
                path: '/ttt/second/first',
                exact: true,
                component: require('../ttt/second/first/index.js').default,
                title: '3-2-1',
              },
              {
                path: '/ttt/second',
                exact: true,
                component: require('../ttt/second/index.js').default,
                title: '3-2',
              },
              {
                component: () =>
                  React.createElement(
                    require('/Users/alex/Documents/GitHub/umi-plugin-nav/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
                      .default,
                    { pagesPath: 'src/pages', hasRoutesInConfig: false },
                  ),
              },
            ],
            title: '3-2-layout',
          },
          {
            component: () =>
              React.createElement(
                require('/Users/alex/Documents/GitHub/umi-plugin-nav/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
                  .default,
                { pagesPath: 'src/pages', hasRoutesInConfig: false },
              ),
          },
        ],
        title: '3-layout',
      },
      {
        component: () =>
          React.createElement(
            require('/Users/alex/Documents/GitHub/umi-plugin-nav/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
              .default,
            { pagesPath: 'src/pages', hasRoutesInConfig: false },
          ),
      },
    ],
  },
  {
    component: () =>
      React.createElement(
        require('/Users/alex/Documents/GitHub/umi-plugin-nav/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
          .default,
        { pagesPath: 'src/pages', hasRoutesInConfig: false },
      ),
  },
];
window.g_routes = routes;
const plugins = require('umi/_runtimePlugin');
plugins.applyForEach('patchRoutes', { initialValue: routes });

export { routes };

export default class RouterWrapper extends React.Component {
  unListen() {}

  constructor(props) {
    super(props);

    // route change handler
    function routeChangeHandler(location, action) {
      plugins.applyForEach('onRouteChange', {
        initialValue: {
          routes,
          location,
          action,
        },
      });
    }
    this.unListen = history.listen(routeChangeHandler);
    // dva 中 history.listen 会初始执行一次
    // 这里排除掉 dva 的场景，可以避免 onRouteChange 在启用 dva 后的初始加载时被多执行一次
    const isDva =
      history.listen
        .toString()
        .indexOf('callback(history.location, history.action)') > -1;
    if (!isDva) {
      routeChangeHandler(history.location);
    }
  }

  componentWillUnmount() {
    this.unListen();
  }

  render() {
    const props = this.props || {};
    return <Router history={history}>{renderRoutes(routes, props)}</Router>;
  }
}
