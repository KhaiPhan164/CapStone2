import { Table, Button, Popconfirm, Space } from "antd";
import { useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const initialData = [
  { key: "1", name: "Nguyen Van A", package: "Monthly Package", joined: "2025-04-10" },
  { key: "2", name: "Tran Thi B", package: "Yearly Package", joined: "2025-03-22" },
];

export default function MembershipTable() {
  const [data, setData] = useState(initialData);

  const handleDelete = (key) => {
    setData(data.filter((item) => item.key !== key));
  };

  const columns = [
    { title: "Member Name", dataIndex: "name", key: "name" },
    { title: "Package", dataIndex: "package", key: "package" },
    { title: "Join Date", dataIndex: "joined", key: "joined" },
    {
      title: "Actions",
      width: 130,
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} />
          <Popconfirm
            title="Delete this member?"
            onConfirm={() => handleDelete(record.key)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Member List</h2>
      {/* <Button type="primary" className="mb-4">+ Add Member</Button> */}
      <Table columns={columns} dataSource={data} />
    </div>
  );
}
