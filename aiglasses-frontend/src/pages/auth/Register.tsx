import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '@/api';
import type { RegisterParams } from '@/types';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: RegisterParams) => {
    setLoading(true);
    try {
      await auth.register(values);
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      message.error('注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5' 
    }}>
      <Card title="注册" style={{ width: 400 }}>
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度不能小于6位' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="full_name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="姓名" />
          </Form.Item>

          <Form.Item name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="手机号码（选填）" />
          </Form.Item>

          <Form.Item name="device_id">
            <Input prefix={<IdcardOutlined />} placeholder="设备ID（选填）" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            已有账号？ <Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register; 