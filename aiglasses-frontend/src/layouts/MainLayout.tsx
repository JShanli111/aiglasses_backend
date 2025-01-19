import { Layout, Menu, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import {
  TranslationOutlined,
  CalculatorOutlined,
  CompassOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const menuItems = [
    {
      key: '/translate',
      icon: <TranslationOutlined />,
      label: '图片翻译'
    },
    {
      key: '/calorie',
      icon: <CalculatorOutlined />,
      label: '卡路里计算'
    },
    {
      key: '/navigate',
      icon: <CompassOutlined />,
      label: '导航避障'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ color: '#fff', margin: 0, marginRight: 48 }}>AI 眼镜</h1>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </div>
        <Button 
          type="text" 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          style={{ color: '#fff' }}
        >
          退出登录
        </Button>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MainLayout; 