// components/TermsModal.jsx
import React from 'react';
import { Modal, Typography, Button } from 'antd';

const { Title } = Typography;

const TermsModal = ({ visible, onAccept, onDecline }) => {
  const isMobile = window.innerWidth <= 768;
  
  return (
    <Modal
      open={visible}
      closable={false}
      footer={null}
      maskClosable={false}
      width={isMobile ? '95%' : 600}
      centered
      bodyStyle={{ 
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: isMobile ? '16px' : '20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <Title level={isMobile ? 4 : 3} style={{ color: 'white', margin: 0 }}>
          Terms & Conditions
        </Title>
      </div>

      <div style={{
        padding: isMobile ? '16px' : '24px',
        maxHeight: isMobile ? '50vh' : '55vh',
        overflowY: 'auto',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ 
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '6px',
          padding: isMobile ? '12px' : '16px',
          marginBottom: isMobile ? '12px' : '16px'
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            color: '#856404', 
            marginBottom: '8px',
            fontSize: isMobile ? '13px' : '15px'
          }}>
            ⚠️ Use at Your Own Risk
          </div>
          <div style={{ color: '#856404', fontSize: isMobile ? '12px' : '13px', lineHeight: '1.5' }}>
            We are not responsible for any content, issues, or consequences from using this service.
          </div>
        </div>

        <div style={{ 
          fontSize: isMobile ? '12px' : '13px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          <div style={{ marginBottom: isMobile ? '12px' : '14px' }}>
            <strong style={{ color: '#667eea' }}>• Content:</strong> Links to third-party sources. 
            We don't host or control content.
          </div>

          <div style={{ marginBottom: isMobile ? '12px' : '14px' }}>
            <strong style={{ color: '#667eea' }}>• Ads:</strong> Stream links may have ads. 
            <strong style={{ color: '#e74c3c' }}> Use an ad-blocker</strong> (uBlock Origin, AdBlock Plus, Brave Browser) for better experience.
          </div>

          <div style={{ marginBottom: isMobile ? '12px' : '14px' }}>
            <strong style={{ color: '#667eea' }}>• Liability:</strong> Not liable for damages, malware, 
            or legal issues.
          </div>

          <div style={{ marginBottom: isMobile ? '12px' : '14px' }}>
            <strong style={{ color: '#667eea' }}>• Your Responsibility:</strong> Follow local laws. 
            Use VPN and ad-blocker.
          </div>

          <div>
            <strong style={{ color: '#667eea' }}>• Age:</strong> Must be 18+ to use this site.
          </div>
        </div>

        <div style={{
          backgroundColor: '#d1ecf1',
          border: '1px solid #17a2b8',
          borderRadius: '6px',
          padding: isMobile ? '10px' : '12px',
          marginTop: isMobile ? '12px' : '16px'
        }}>
          <div style={{ 
            color: '#0c5460', 
            fontSize: isMobile ? '11px' : '12px',
            lineHeight: '1.5'
          }}>
            💡 <strong>Tip:</strong> Install <strong>uBlock Origin</strong> or use <strong>Brave Browser</strong> to block ads!
          </div>
        </div>
      </div>

      <div style={{
        padding: isMobile ? '12px 16px' : '16px 24px',
        backgroundColor: 'white',
        borderTop: '1px solid #e8e8e8',
        display: 'flex',
        gap: isMobile ? '8px' : '12px',
        justifyContent: 'center'
      }}>
        <Button
          size={isMobile ? 'middle' : 'large'}
          onClick={onDecline}
          style={{
            flex: 1,
            maxWidth: isMobile ? '120px' : '150px',
            height: isMobile ? '40px' : '44px',
            fontSize: isMobile ? '13px' : '15px'
          }}
        >
          Exit
        </Button>
        <Button
          type="primary"
          size={isMobile ? 'middle' : 'large'}
          onClick={onAccept}
          style={{
            flex: 1,
            maxWidth: isMobile ? '120px' : '150px',
            height: isMobile ? '40px' : '44px',
            fontSize: isMobile ? '13px' : '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none'
          }}
        >
          Accept
        </Button>
      </div>
    </Modal>
  );
};

export default TermsModal;