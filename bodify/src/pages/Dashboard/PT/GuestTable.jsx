// components/UserTable.jsx
import React from 'react';
import { Table } from 'antd';

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

const GuestTable = () => {
  // Dữ liệu mẫu (bạn có thể thay bằng dữ liệu thực từ props hoặc API)
  const data = [
    {
      key: '1',
      name: 'Nguyen Van A',
      age: 'nguyenvana',
      address: '123456',
      tags: 'a@gmail.com',
    },
    {
      key: '2',
      name: 'Tran Thi B',
      age: 'tranthib',
      address: 'abcdef',
      tags: 'b@gmail.com',
    },
  ];

  return <Table columns={columns} dataSource={data} />;
};

export default GuestTable;
