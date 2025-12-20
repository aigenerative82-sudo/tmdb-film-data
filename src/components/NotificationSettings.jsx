// src/components/NotificationSettings.jsx
import React, { useState, useEffect } from 'react';
import { Card, Switch, Button, Badge, Space, Typography, Divider, Alert } from 'antd';
import { BellOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import notificationService from '../services/notificationService';

const { Title, Text, Paragraph } = Typography;

const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Get last check time
    const lastCheckTime = localStorage.getItem('lastContentCheck');
    if (lastCheckTime) {
      setLastCheck(new Date(lastCheckTime));
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      // Disable notifications
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsDisabled', 'true');
    } else {
      // Enable notifications
      setIsLoading(true);
      const success = await notificationService.initialize();
      
      if (success) {
        setNotificationsEnabled(true);
        setPermission('granted');
        localStorage.removeItem('notificationsDisabled');
        
        // Start periodic checks
        notificationService.schedulePeriodicCheck();
        
        // Test notification
        notificationService.sendLocalNotification({
          title: 'Notifications Enabled',
          name: 'Test Notification',
          overview: 'You will now receive updates about new movies and TV shows!',
          poster_path: null,
          id: 'test'
        }, 'movie');
      } else {
        setPermission(Notification.permission);
      }
      
      setIsLoading(false);
    }
  };

  const handleCheckNow = async () => {
    setIsLoading(true);
    const result = await notificationService.checkForNewContent();
    
    if (result) {
      const now = new Date();
      setLastCheck(now);
      
      if (result.newMovies === 0 && result.newTVShows === 0) {
        notificationService.sendLocalNotification({
          title: 'All Caught Up',
          name: 'No New Content',
          overview: 'No new movies or TV shows since your last check.',
          poster_path: null,
          id: 'check'
        }, 'movie');
      }
    }
    
    setIsLoading(false);
  };

  const getStatusColor = () => {
    switch (permission) {
      case 'granted':
        return 'success';
      case 'denied':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (permission) {
      case 'granted':
        return 'Enabled';
      case 'denied':
        return 'Blocked';
      default:
        return 'Not Set';
    }
  };

  return (
    <Card
      style={{
        maxWidth: '600px',
        margin: '24px auto',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <BellOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>
              Push Notifications
            </Title>
          </Space>
          <Badge 
            status={getStatusColor()} 
            text={getStatusText()}
          />
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Permission Warning */}
        {permission === 'denied' && (
          <Alert
            message="Notifications Blocked"
            description="Please enable notifications in your browser settings to receive updates about new content."
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
          />
        )}

        {permission === 'default' && (
          <Alert
            message="Enable Notifications"
            description="Get notified when new movies and TV shows are released. We'll check once every 6 hours."
            type="info"
            showIcon
          />
        )}

        {permission === 'granted' && notificationsEnabled && (
          <Alert
            message="Notifications Active"
            description="You'll receive updates about new movies and TV shows. Checks happen automatically every 6 hours."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        )}

        {/* Toggle Switch */}
        <Card 
          size="small" 
          style={{ backgroundColor: '#f5f5f5' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Enable Notifications</Text>
              <Paragraph style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                Receive alerts for new releases
              </Paragraph>
            </div>
            <Switch
              checked={notificationsEnabled}
              onChange={handleToggleNotifications}
              loading={isLoading}
              disabled={permission === 'denied'}
              checkedChildren="ON"
              unCheckedChildren="OFF"
            />
          </div>
        </Card>

        {/* Manual Check Button */}
        {notificationsEnabled && (
          <Card 
            size="small" 
            style={{ backgroundColor: '#f5f5f5' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Check for New Content</Text>
                <Paragraph style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                  {lastCheck 
                    ? `Last checked: ${lastCheck.toLocaleDateString()} at ${lastCheck.toLocaleTimeString()}`
                    : 'Never checked'
                  }
                </Paragraph>
              </div>
              <Button
                type="primary"
                onClick={handleCheckNow}
                loading={isLoading}
              >
                Check Now
              </Button>
            </div>
          </Card>
        )}

        {/* Information */}
        <Card 
          size="small" 
          style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}
        >
          <Text style={{ fontSize: '13px' }}>
            <strong>How it works:</strong> We automatically check for new movies and TV shows every 6 hours. 
            When new content is available, you'll receive a notification. You can also manually check anytime.
          </Text>
        </Card>
      </Space>
    </Card>
  );
};

export default NotificationSettings;