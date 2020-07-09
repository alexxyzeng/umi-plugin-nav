import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';

import Link from 'umi/link';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _find from 'lodash/find';
import _toString from 'lodash/toString';
import _isArray from 'lodash/isArray';
import _isEmpty from 'lodash/isEmpty';

import routes from '../../menu.json';

const { Content, Sider } = Layout;

const menus = routes[0].children || []

/**
 * 递归生成菜单
 * @param {array} menus
 * @param {object} [parent]
 * @param {number} [parent.key]
 * @param {array} menuList
 * @returns {Array}
 */
function recursiveMenus(menus, menuList = []) {
  const { key: parentKey = '' } = parent;
  return menus.map(menu => {
    const { title, path, children } = menu;
    menuList.push({ key: path, ...menu })
    if (Array.isArray(children) && children.length > 0) {
      return (
        <Menu.SubMenu key={path} title={title}>
          {recursiveMenus(children, menuList)}
        </Menu.SubMenu>
      )
    }
    return (
      <Menu.Item key={path}>
        <Link to={path}>{title}</Link>
      </Menu.Item>
    )
  })
}

function BasicLayout(props) {

  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuItemsComponent, setMenuItemsComponent] = useState();

  useEffect(() => {
    const menuList = [];
    const menuItemsComponent = recursiveMenus(menus, menuList);
    setMenuItems(menuList);
    setMenuItemsComponent(menuItemsComponent);
  }, []);

  useEffect(() => {
    setSelectedKeys([props.location.pathname]);
  }, [props.location.pathname]);

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider>
        <Menu theme={'dark'} selectedKeys={selectedKeys} mode={'inline'}>
          {menuItemsComponent}
        </Menu>
      </Sider>
      <Layout>
        <Content>
          <div style={{ width: '100vw', height: '100vh' }}>
            {props.children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default BasicLayout;
