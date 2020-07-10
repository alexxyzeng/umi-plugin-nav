// ref:
// - https://umijs.org/plugins/api
const path = require('path');
const fs = require('fs');

const defaultOptions = {
  menuOutputPath: path.resolve('.', './menus.json'),
  breadCrumbOutputPath: path.resolve('.', './breadcrumbs.json'),
  generateBreadcrmbs: true,
  excludes: ['exact', 'component', 'routes'],
  orderOpts: ['path', 'asc']
}


let prevRoutes = null;
let routeHashes = {}
let routeInfoHashes = {}
function recursiveParseRoutes(routeList = [], parent = {}, opts = {}) {
  const { excludes, orderOpts: [orderKey, order] = [] } = opts
  const { path: parentPath } = parent
  let finalMenus = routeList.map(route => {
    const { path, routes } = route;
    if (!path) {
      return null
    }
    if (path === parentPath) {
      return null
    }
    let finalMenu = {
      ...route
    }
    routeHashes[path] = parent.path === path ? '/' : parent.path
    excludes.forEach(exclude => {
      if (finalMenu[exclude] !== undefined) {
        delete finalMenu[exclude]
      }
    })

    routeInfoHashes[path] = { ...finalMenu }
    if (Array.isArray(routes) && routes.length > 0) {
      finalMenu['children'] = recursiveParseRoutes(routes, route, opts)
    }
    return finalMenu
  }).filter(item => item !== null)
  if (orderKey) {
    finalMenus = finalMenus.sort((item1, item2) => {
      const item1OrderValue = item1[orderKey]
      const item2OrderValue = item2[orderKey]
      return item1OrderValue > item2OrderValue ? 1 : -1
    })
    if (order === 'desc') {
      finalMenus = finalMenus.reverse()
    }
  }
  return finalMenus
}

function parseBreadcrumbInfo(routeHashes, routeInfoHashes) {
  let breadcrumbs = {}
  for (let i in routeHashes) {
    let parentRoute = routeHashes[i]
    if (!breadcrumbs[i]) {
      breadcrumbs[i] = []
    }
    if (parentRoute) {
      breadcrumbs[i] = [parentRoute]
      while (routeHashes[parentRoute]) {
        parentRoute = routeHashes[parentRoute]
        breadcrumbs[i].unshift(parentRoute)
      }
    }

  }
  return {
    breadcrumbs,
    routeInfoHashes
  }

}

function generateRoutesAndBreadcrumbs(routes, options, api) {
  const { menuOutputPath, breadCrumbOutputPath, generateBreadcrmbs, ...restOpts } = defaultOptions;
  const opts = { ...restOpts, ...options }
  routeHashes = {}
  routeInfoHashes = {}
  if (prevRoutes && JSON.stringify(prevRoutes) === JSON.stringify(routes)) {
    return routes
  }
  api.log.pending('Parsing routes into menu infos...');
  const menus = recursiveParseRoutes(routes, {}, opts);
  api.log.pending('Successfully parsed menu infos.');
  fs.writeFileSync(menuOutputPath, JSON.stringify(menus, null, 2));
  api.log.success('Success write menu infos.');
  if (generateBreadcrmbs) {
    api.log.pending('Parsing routes info breadcrumb infos...');
    const breadcumbInfo = parseBreadcrumbInfo(
      routeHashes,
      routeInfoHashes
    )
    api.log.pending('Successfully parsed breadcrumb infos...');
    fs.writeFileSync(breadCrumbOutputPath, JSON.stringify(breadcumbInfo, null, 2));
    api.log.success('Successfully write menu breadcrumb infos.');
  }
}

export default function (api, options) {
  api.modifyRoutes(routes => {
    generateRoutesAndBreadcrumbs(routes, options, api);
    return routes
  })

  api.registerCommand('generateRoutes', () => {
    const routes = api.getRoutes();
    generateRoutesAndBreadcrumbs(routes, options, api);
  })
}
