import React, { useState } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, Button, Table, Tag, Space } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faUser } from '@fortawesome/free-solid-svg-icons';

const { Header, Content, Sider } = Layout;

const items2 = [
  {
    key: 'profile',
    icon: <UserOutlined />, 
    label: 'Quản lý user',
    children: [{
      key: 'user-list',
      label: 'Danh sách user',
    }],
  },
];

const columns = [
  {
    title: 'FullName',
    dataIndex: 'name',
  },
  {
    title: 'Username',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Password',
    dataIndex: 'address',
  },
  {
    title: 'Email',
    dataIndex: 'tags',
  },
  {
    title: 'Phone',
  },
];


const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <Header className='bg-blue-500 px-4 flex justify-between items-center'>
        <div className='flex items-center'>
          {!collapsed && <img src="./icon/logo.svg" alt="Logo" className="h-10 w-auto mr-20" />}
          <Button 
            type="text" 
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
            onClick={() => setCollapsed(!collapsed)} 
            className='text-white text-2xl ml-4'
          />
        </div>
        <div className="flex items-center space-x-4 text-white">
          <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-lg font-medium">Khánh Dương</span>
              <FontAwesomeIcon icon={faCaretDown} />
            </div>
            <div className="text-sm">khanhduong1140@gmail.com</div>
          </div>
        </div>
      </Header>
      <Layout>
        <Sider collapsed={collapsed} width={200} style={{ background: colorBgContainer, height: '100vh' }}>
          <Menu mode="inline" style={{ height: '100%', borderRight: 0 }} items={items2} defaultOpenKeys={['profile']} defaultSelectedKeys={['user-list']} />
        </Sider>
        <Layout style={{ padding: '0' }}>
          <Breadcrumb items={[{ title: 'Danh sách user' }]} className="bg-white h-16 flex items-center justify-center text-lg font-bold mb-5" />
          <Content style={{background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Table columns={columns}/>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
