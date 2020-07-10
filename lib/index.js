"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
};
let prevRoutes = null;
let routeHashes = {};
let routeInfoHashes = {};

function recursiveParseRoutes(routeList = [], parent = {}, opts = {}) {
  const excludes = opts.excludes,
        _opts$orderOpts = opts.orderOpts,
        _opts$orderOpts2 = _opts$orderOpts === void 0 ? [] : _opts$orderOpts,
        _opts$orderOpts3 = _slicedToArray(_opts$orderOpts2, 2),
        orderKey = _opts$orderOpts3[0],
        order = _opts$orderOpts3[1];

  const parentPath = parent.path;
  let finalMenus = routeList.map(route => {
    const path = route.path,
          routes = route.routes;

    if (!path) {
      return null;
    }

    if (path === parentPath) {
      return null;
    }

    let finalMenu = _objectSpread({}, route);

    routeHashes[path] = parent.path === path ? '/' : parent.path;
    excludes.forEach(exclude => {
      if (finalMenu[exclude] !== undefined) {
        delete finalMenu[exclude];
      }
    });
    routeInfoHashes[path] = _objectSpread({}, finalMenu);

    if (Array.isArray(routes) && routes.length > 0) {
      finalMenu['children'] = recursiveParseRoutes(routes, route, opts);
    }

    return finalMenu;
  }).filter(item => item !== null);

  if (orderKey) {
    finalMenus = finalMenus.sort((item1, item2) => {
      const item1OrderValue = item1[orderKey];
      const item2OrderValue = item2[orderKey];
      return item1OrderValue > item2OrderValue ? 1 : -1;
    });

    if (order === 'desc') {
      finalMenus = finalMenus.reverse();
    }
  }

  return finalMenus;
}

function parseBreadcrumbInfo(routeHashes, routeInfoHashes) {
  let breadcrumbs = {};

  for (let i in routeHashes) {
    let parentRoute = routeHashes[i];

    if (!breadcrumbs[i]) {
      breadcrumbs[i] = [];
    }

    if (parentRoute) {
      breadcrumbs[i] = [parentRoute];

      while (routeHashes[parentRoute]) {
        parentRoute = routeHashes[parentRoute];
        breadcrumbs[i].unshift(parentRoute);
      }
    }
  }

  return {
    breadcrumbs,
    routeInfoHashes
  };
}

function generateRoutesAndBreadcrumbs(routes, options, api) {
  const menuOutputPath = defaultOptions.menuOutputPath,
        breadCrumbOutputPath = defaultOptions.breadCrumbOutputPath,
        generateBreadcrmbs = defaultOptions.generateBreadcrmbs,
        restOpts = _objectWithoutProperties(defaultOptions, ["menuOutputPath", "breadCrumbOutputPath", "generateBreadcrmbs"]);

  const opts = _objectSpread(_objectSpread({}, restOpts), options);

  routeHashes = {};
  routeInfoHashes = {};

  if (prevRoutes && JSON.stringify(prevRoutes) === JSON.stringify(routes)) {
    return routes;
  }

  api.log.pending('Parsing routes into menu infos...');
  const menus = recursiveParseRoutes(routes, {}, opts);
  api.log.pending('Successfully parsed menu infos.');
  fs.writeFileSync(menuOutputPath, JSON.stringify(menus, null, 2));
  api.log.success('Success write menu infos.');

  if (generateBreadcrmbs) {
    api.log.pending('Parsing routes info breadcrumb infos...');
    const breadcumbInfo = parseBreadcrumbInfo(routeHashes, routeInfoHashes);
    api.log.pending('Successfully parsed breadcrumb infos...');
    fs.writeFileSync(breadCrumbOutputPath, JSON.stringify(breadcumbInfo, null, 2));
    api.log.success('Successfully write menu breadcrumb infos.');
  }
}

function _default(api, options) {
  api.modifyRoutes(routes => {
    generateRoutesAndBreadcrumbs(routes, options, api);
    return routes;
  });
  api.registerCommand('generateRoutes', () => {
    const routes = api.getRoutes();
    generateRoutesAndBreadcrumbs(routes, options, api);
  });
}