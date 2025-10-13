// ActiveFilters.jsx - New component to display active filters
import React from 'react';
import { Tag, Space } from 'antd';
import { CloseCircleOutlined, SearchOutlined, GlobalOutlined, TagOutlined } from '@ant-design/icons';

const ActiveFilters = ({ 
  searchTerm, 
  selectedGenre, 
  selectedCountry,
  onClearSearch,
  onClearGenre,
  onClearCountry,
  onClearAll,
  hideTitle = false
}) => {
  const hasFilters = searchTerm || selectedGenre || selectedCountry;

  if (!hasFilters) return null;

  return (
    <div style={{
      backgroundColor: hideTitle ? 'transparent' : '#fff',
      padding: hideTitle ? '0' : '12px 16px',
      borderRadius: hideTitle ? '0' : '8px',
      marginBottom: hideTitle ? '0' : '16px',
      boxShadow: hideTitle ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '8px'
    }}>
      {!hideTitle && (
        <span style={{ 
          fontWeight: '600', 
          color: '#595959',
          marginRight: '8px',
          fontSize: '14px'
        }}>
          Active Filters:
        </span>
      )}
      
      <Space size={8} wrap>
        {searchTerm && (
          <Tag
            icon={<SearchOutlined />}
            closable
            onClose={onClearSearch}
            color="blue"
            style={{ 
              fontSize: '13px', 
              padding: '4px 10px',
              borderRadius: '6px'
            }}
          >
            Search: "{searchTerm}"
          </Tag>
        )}
        
        {selectedGenre && (
          <Tag
            icon={<TagOutlined />}
            closable
            onClose={onClearGenre}
            color="green"
            style={{ 
              fontSize: '13px', 
              padding: '4px 10px',
              borderRadius: '6px'
            }}
          >
            Genre: {selectedGenre.name}
          </Tag>
        )}
        
        {selectedCountry && (
          <Tag
            icon={<GlobalOutlined />}
            closable
            onClose={onClearCountry}
            color="orange"
            style={{ 
              fontSize: '13px', 
              padding: '4px 10px',
              borderRadius: '6px'
            }}
          >
            Country: {selectedCountry.english_name || selectedCountry.native_name}
          </Tag>
        )}
        
        {(searchTerm || selectedGenre || selectedCountry) && (
          <Tag
            icon={<CloseCircleOutlined />}
            color="red"
            style={{ 
              cursor: 'pointer',
              fontSize: '13px', 
              padding: '4px 10px',
              borderRadius: '6px'
            }}
            onClick={onClearAll}
          >
            Clear All
          </Tag>
        )}
      </Space>
    </div>
  );
};

export default ActiveFilters;