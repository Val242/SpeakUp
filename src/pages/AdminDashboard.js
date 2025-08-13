import React from 'react';

export default function AdminDashboard() {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Left Sidebar - White background */}
      <div style={{ 
        width: '280px', 
        backgroundColor: 'white', 
        padding: '24px 0',
        borderRight: '1px solid #E2E8F0'
      }}>
        {/* Top Section */}
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>Dashboard</span>
            <div style={{ marginLeft: 'auto', cursor: 'pointer' }}>☰</div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '24px 0' }}>
          <div style={{ 
            padding: '12px 24px', 
            backgroundColor: '#DBEAFE', 
            color: '#1E40AF',
            fontWeight: '500',
            borderRadius: '8px',
            margin: '0 16px 8px 16px'
          }}>
            📊 Dashboard
          </div>
          <div style={{ padding: '12px 24px', color: '#64748B', cursor: 'pointer', margin: '0 16px' }}>
            💬 Feedback
          </div>
          <div style={{ padding: '12px 24px', color: '#64748B', cursor: 'pointer', margin: '0 16px' }}>
            📋 Unassigned
          </div>
          <div style={{ padding: '12px 24px', color: '#64748B', cursor: 'pointer', margin: '0 16px' }}>
            ⏳ In Progress
          </div>
          <div style={{ padding: '12px 24px', color: '#64748B', cursor: 'pointer', margin: '0 16px' }}>
            ✅ Resolved
          </div>
        </div>

        {/* Admin Section */}
        <div style={{ padding: '24px 0', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ 
            padding: '0 24px 16px', 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#64748B',
            textTransform: 'uppercase'
          }}>
            Manage
          </div>
          <div style={{ padding: '12px 24px', color: '#64748B', cursor: 'pointer', margin: '0 16px' }}>
            👥 Developers
          </div>
          <div style={{ padding: '12px 24px', color: '#64748B', cursor: 'pointer', margin: '0 16px' }}>
            ⚙️ Settings
          </div>
        </div>

        {/* Feedback Button */}
        <div style={{ padding: '24px', marginTop: 'auto' }}>
          <button style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            💬 Feedback
          </button>
        </div>

        {/* User Profile */}
        <div style={{ 
          padding: '24px', 
          borderTop: '1px solid #F1F5F9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#E2E8F0', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              👤
            </div>
            <div>
              <div style={{ fontWeight: '500', color: '#1E293B' }}>sarah@example.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Top Header */}
        <header style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1E293B' }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search feedback..." 
                style={{
                  padding: '8px 16px 8px 40px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  width: '300px'
                }}
              />
              <span style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)'
              }}>
                🔍
              </span>
            </div>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              🔔
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#EF4444',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                3
              </span>
            </div>
            <div style={{ cursor: 'pointer' }}>⚙️</div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#E2E8F0', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              👤
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div style={{ padding: '24px' }}>
          {/* Summary Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Total Feedback */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1E293B' }}>
                    124
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>
                    Total Feedback
                  </div>
                  <div style={{ fontSize: '14px', color: '#10B981' }}>↑ 12% from last week</div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#DBEAFE', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  💬
                </div>
              </div>
            </div>

            {/* Unassigned */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1E293B' }}>
                    18
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>
                    Unassigned
                  </div>
                  <div style={{ fontSize: '14px', color: '#EF4444' }}>↑ 5% from last week</div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#FEF3C7', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  📁
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1E293B' }}>
                    42
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>
                    In Progress
                  </div>
                  <div style={{ fontSize: '14px', color: '#10B981' }}>↓ 3% from last week</div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#DBEAFE', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  ⏳
                </div>
              </div>
            </div>

            {/* Resolved */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1E293B' }}>
                    64
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>
                    Resolved
                  </div>
                  <div style={{ fontSize: '14px', color: '#10B981' }}>↑ 18% from last week</div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#D1FAE5', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  ✅
                </div>
              </div>
            </div>
          </div>

          {/* Recent Feedback Table */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            marginBottom: '32px'
          }}>
            <div style={{ 
              padding: '24px 24px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>Recent Feedback</h2>
              <a href="#" style={{ color: '#3B82F6', textDecoration: 'none' }}>View all</a>
            </div>
            
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ID</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>SUBMITTER</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>MESSAGE</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>STATUS</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ASSIGNED TO</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>DATE</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {/* FB-001 */}
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                      #FB-001
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          backgroundColor: '#E2E8F0', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: '#64748B'
                        }}>
                          S
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>
                            Sarah Johnson
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            sarah@example.com
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', maxWidth: '300px' }}>
                      The login button doesn't work on mobile devi...
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        backgroundColor: '#FEF3C7',
                        color: '#F59E0B',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: 'none',
                        boxShadow: '0 1px 3px rgba(245, 158, 11, 0.2)'
                      }}>
                        New
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ color: '#64748B' }}>Unassigned</span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                      Aug 2, 2023
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button style={{
                          padding: '6px 12px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>
                          Assign
                        </button>
                        <button style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          color: '#64748B'
                        }}>
                          ⋮
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* FB-002 */}
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                      #FB-002
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          backgroundColor: '#E2E8F0', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: '#64748B'
                        }}>
                          M
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>
                            Mike Peters
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            mike@example.com
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', maxWidth: '300px' }}>
                      Would be great to have a dark mode option fo...
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        backgroundColor: '#DBEAFE',
                        color: '#3B82F6',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: 'none',
                        boxShadow: '0 1px 3px rgba(59, 130, 246, 0.2)'
                      }}>
                        In Progress
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          backgroundColor: '#3B82F6', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: 'white'
                        }}>
                          AC
                        </div>
                        <span style={{ fontSize: '14px', color: '#1E293B' }}>
                          Alex Chen
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                      Aug 1, 2023
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button style={{
                          padding: '6px 12px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>
                          Update
                        </button>
                        <button style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          color: '#64748B'
                        }}>
                          ⋮
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* FB-003 */}
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                      #FB-003
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          backgroundColor: '#E2E8F0', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: '#64748B'
                        }}>
                          L
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>
                            Lisa Wong
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            lisa@example.com
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', maxWidth: '300px' }}>
                      Export to PDF option isn't working in Firefox b...
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        backgroundColor: '#D1FAE5',
                        color: '#10B981',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: 'none',
                        boxShadow: '0 1px 3px rgba(16, 185, 129, 0.2)'
                      }}>
                        Resolved
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          backgroundColor: '#3B82F6', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: 'white'
                        }}>
                          DK
                        </div>
                        <span style={{ fontSize: '14px', color: '#1E293B' }}>
                          David Kim
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                      Jul 30, 2023
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button style={{
                          padding: '6px 12px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>
                          Close
                        </button>
                        <button style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          color: '#64748B'
                        }}>
                          ⋮
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Dashboard Widgets */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px'
          }}>
            {/* Developer Workload */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '20px' }}>
                Developer Workload
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    backgroundColor: '#3B82F6', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    AC
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                      Alex Chen
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      backgroundColor: '#F1F5F9', 
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '75%',
                        height: '100%',
                        backgroundColor: '#3B82F6',
                        borderRadius: '6px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1E293B',
                    minWidth: '50px',
                    textAlign: 'right'
                  }}>
                    15 tasks
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    backgroundColor: '#3B82F6', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    DK
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                      David Kim
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      backgroundColor: '#F1F5F9', 
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '60%',
                        height: '100%',
                        backgroundColor: '#3B82F6',
                        borderRadius: '6px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1E293B',
                    minWidth: '50px',
                    textAlign: 'right'
                  }}>
                    12 tasks
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    backgroundColor: '#3B82F6', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    ER
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                      Emily Rodriguez
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      backgroundColor: '#F1F5F9', 
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '40%',
                        height: '100%',
                        backgroundColor: '#3B82F6',
                        borderRadius: '6px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1E293B',
                    minWidth: '50px',
                    textAlign: 'right'
                  }}>
                    8 tasks
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Status */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '20px' }}>
                Feedback Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '70px', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#3B82F6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    NEW
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      backgroundColor: '#F1F5F9', 
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '18%',
                        height: '100%',
                        backgroundColor: '#3B82F6',
                        borderRadius: '6px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1E293B',
                    minWidth: '45px',
                    textAlign: 'right'
                  }}>
                    18%
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '70px', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#F59E0B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    ASSIGNED
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      backgroundColor: '#F1F5F9', 
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '24%',
                        height: '100%',
                        backgroundColor: '#F59E0B',
                        borderRadius: '6px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1E293B',
                    minWidth: '45px',
                    textAlign: 'right'
                  }}>
                    24%
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '70px', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#8B5CF6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    IN PROGRESS
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      backgroundColor: '#F1F5F9', 
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '34%',
                        height: '100%',
                        backgroundColor: '#8B5CF6',
                        borderRadius: '6px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1E293B',
                    minWidth: '45px',
                    textAlign: 'right'
                  }}>
                    34%
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '70px', 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: '#10B981',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    RESOLVED
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      backgroundColor: '#F1F5F9', 
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '24%',
                        height: '100%',
                        backgroundColor: '#10B981',
                        borderRadius: '6px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1E293B',
                    minWidth: '45px',
                    textAlign: 'right'
                  }}>
                    24%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <button style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        backgroundColor: '#8B5CF6',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        ❓
      </button>
    </div>
  );
}
