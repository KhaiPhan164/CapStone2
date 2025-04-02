import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  message,
  Card,
  Typography,
  Space,
  Spin
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const { Title } = Typography;
const { Option } = Select;

const RegisterPT = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [gyms, setGyms] = useState([]);
  const [fileList, setFileList] = useState([]);

  // Fetch gyms only once when component mounts
  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const data = await AuthService.getGyms();
        if (Array.isArray(data)) {
          setGyms(data);
        }
      } catch (error) {
        console.error('Error fetching gyms:', error);
        message.error('Failed to load gym list');
      }
    };

    fetchGyms();
  }, []); // Empty dependency array means it runs only once

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Create FormData object
      const formData = new FormData();
      
      // Log values for debugging
      console.log('Form values:', values);
      
      // Append all text fields
      Object.keys(values).forEach(key => {
        if (key !== 'certificates') {
          // Nếu là trường gym và không có giá trị, bỏ qua
          if (key === 'gym' && !values[key]) {
            return;
          }
          console.log(`Appending ${key}:`, values[key]);
          formData.append(key, values[key] || '');
        }
      });
      
      // Append certificate files
      if (fileList && fileList.length > 0) {
        console.log('Files to upload:', fileList);
        fileList.forEach(file => {
          if (file.originFileObj) {
            console.log('Appending file:', file.name);
            formData.append('certificates', file.originFileObj);
          }
        });
      }

      // Log final FormData content
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Đăng ký PT
      await AuthService.registerPT(formData);
      
      // Hiển thị thông báo thành công
      message.success('Đăng ký thành công! Vui lòng kiểm tra email của bạn để biết thêm thông tin.');
      
      // Chuyển về trang chủ
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      message.error(
        error.response?.data?.message || 
        'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin và thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const beforeUpload = (file) => {
    const isValidFormat = file.type === 'application/pdf' || 
                         file.type === 'image/jpeg' || 
                         file.type === 'image/png' ||
                         file.type === 'image/jpg';
    if (!isValidFormat) {
      message.error('Chỉ chấp nhận file PDF, JPG hoặc PNG!');
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File phải nhỏ hơn 5MB!');
    }
    
    return false; // Return false để ngăn upload tự động
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f0f2f5', 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center' 
    }}>
      <Card style={{ width: '100%', maxWidth: 600 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Register as Personal Trainer
        </Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: 'Please input your full name!' },
              { min: 3, message: 'Name must be at least 3 characters!' },
              { max: 50, message: 'Name cannot be longer than 50 characters!' }
            ]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters!' },
              { max: 64, message: 'Username cannot be longer than 64 characters!' }
            ]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
              { max: 64, message: 'Password cannot be longer than 64 characters!' }
            ]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="phoneNum"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please input your phone number!' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number!' }
            ]}
          >
            <Input placeholder="Enter your phone number" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[
              { required: true, message: 'Please input your address!' },
              { min: 5, message: 'Address must be at least 5 characters!' },
              { max: 255, message: 'Address cannot be longer than 255 characters!' }
            ]}
          >
            <Input.TextArea placeholder="Enter your address" rows={3} />
          </Form.Item>

          <Form.Item
            name="gym"
            label="Select Gym (Optional)"
          >
            <Select
              placeholder="Select a gym"
              allowClear
              showSearch
              optionFilterProp="children"
              loading={!gyms.length}
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {gyms && gyms.map(gym => (
                <Option key={gym.id} value={gym.id}>
                  {gym.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="certificates"
            label="Upload Certificates"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: 'Vui lòng tải lên ít nhất một chứng chỉ!' }]}
          >
            <Upload
              beforeUpload={beforeUpload}
              fileList={fileList}
              onChange={({ fileList }) => {
                // Giới hạn số lượng file tối đa là 5
                if (fileList.length > 5) {
                  message.error('Chỉ được tải lên tối đa 5 file!');
                  return;
                }
                console.log('New fileList:', fileList);
                setFileList(fileList);
              }}
              multiple
              maxCount={5}
            >
              <Button 
                icon={<UploadOutlined />} 
                disabled={fileList.length >= 5}
              >
                Tải lên chứng chỉ (Tối đa: 5 files)
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Register
              </Button>
              <Button onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPT; 