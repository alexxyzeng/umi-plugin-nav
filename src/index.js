// ref:
// - https://umijs.org/plugins/api
const path = require('path');
const fs = require('fs');

const defaultOptions = {
  menuOutputPath: path.resolve('.', './menu.json'),
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

    routeInfoHashes[path] = {...finalMenu}
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

export default function (api, options) {
  const { menuOutputPath, breadCrumbOutputPath, generateBreadcrmbs, ...restOpts } = defaultOptions;
  const opts = { ...restOpts, ...options }
  api.modifyRoutes(routes => {
    routeHashes = {}
    if (prevRoutes && JSON.stringify(prevRoutes) === JSON.stringify(routes)) {
      return
    }
    const menus = recursiveParseRoutes(routes, {}, opts)
    fs.writeFileSync(menuOutputPath, JSON.stringify(menus, null, 2));
    if (generateBreadcrmbs) {
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
      const breadcumbInfo = {
        breadcrumbs,
        routeInfoHashes
      }
      fs.writeFileSync(breadCrumbOutputPath, JSON.stringify(breadcumbInfo, null, 2));
    }
    return routes
  })
}
