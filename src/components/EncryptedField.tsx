'use client'

import React, { useState } from 'react'
import { useField } from '@payloadcms/ui'
import { TextInput } from '@payloadcms/ui'

interface EncryptedFieldProps {
  path: string
  required?: boolean
  admin?: {
    description?: string
    placeholder?: string
    readOnly?: boolean
  }
}

const EncryptedField: React.FC<EncryptedFieldProps> = ({ 
  path, 
  required = false,
  admin = {}
}) => {
  const { value, setValue } = useField<string>({ path })
  const [showDecrypted, setShowDecrypted] = useState(false)
  const [isEncrypted] = useState(!!value && value.startsWith('enc:'))

  const displayValue = React.useMemo(() => {
    if (!value) return ''
    
    // If it's encrypted (starts with 'enc:'), show masked version
    if (isEncrypted && !showDecrypted) {
      return '••••••••••••••••'
    }
    
    return value
  }, [value, isEncrypted, showDecrypted])

  const handleToggleVisibility = () => {
    setShowDecrypted(!showDecrypted)
  }

  return (
    <div className="field-type text">
      <div className="label-wrapper">
        <label className="field-label">
          {path.charAt(0).toUpperCase() + path.slice(1)}
          {required && <span className="required">*</span>}
        </label>
      </div>
      
      <div className="input-wrapper">
        <div style={{ position: 'relative' }}>
          <TextInput
            path={path}
            required={required}
            value={displayValue}
            onChange={setValue}
            placeholder={admin.placeholder || 'Enter encrypted value...'}
            readOnly={admin.readOnly}
          />
          
          {isEncrypted && (
            <button
              type="button"
              onClick={handleToggleVisibility}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#666',
                fontSize: '12px'
              }}
              title={showDecrypted ? 'Hide encrypted value' : 'Show encrypted value'}
            >
              {showDecrypted ? '👁️‍🗨️' : '👁️'}
            </button>
          )}
        </div>
        
        {admin.description && (
          <div className="field-description">
            {admin.description}
          </div>
        )}
        
        {isEncrypted && (
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            🔒 This value is encrypted for security
          </div>
        )}
      </div>
    </div>
  )
}

export default EncryptedField 