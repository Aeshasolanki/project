import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingBag,
  Store,
  People,
  AttachMoney,
  CheckCircle,
  Pending,
  Visibility,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboard(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('حدث خطأ في تحميل لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: 'accent.main' }} size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const stats = [
    {
      title: 'إجمالي الطلبات',
      value: dashboard?.orders.total || 0,
      icon: <ShoppingBag sx={{ fontSize: 40 }} />,
      color: '#1B4B5A',
      bgColor: 'rgba(27, 75, 90, 0.1)',
    },
    {
      title: 'الطلبات النشطة',
      value: dashboard?.orders.active || 0,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#B8956A',
      bgColor: 'rgba(184, 149, 106, 0.1)',
    },
    {
      title: 'المحلات المعتمدة',
      value: dashboard?.certifications.certified || 0,
      icon: <Store sx={{ fontSize: 40 }} />,
      color: '#4A8E4E',
      bgColor: 'rgba(74, 142, 78, 0.1)',
    },
    {
      title: 'المحلات المعلقة',
      value: dashboard?.certifications.pending || 0,
      icon: <Pending sx={{ fontSize: 40 }} />,
      color: '#D4A574',
      bgColor: 'rgba(212, 165, 116, 0.1)',
    },
    {
      title: 'إجمالي العملاء',
      value: dashboard?.users.customers || 0,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#2D6A7A',
      bgColor: 'rgba(45, 106, 122, 0.1)',
    },
    {
      title: 'الإيرادات الكلية',
      value: `${dashboard?.revenue.total.toLocaleString() || 0} درهم`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#B8956A',
      bgColor: 'rgba(184, 149, 106, 0.1)',
    },
    {
      title: 'إيرادات المنصة',
      value: `${dashboard?.revenue.platform.toLocaleString() || 0} درهم`,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#4A8E4E',
      bgColor: 'rgba(74, 142, 78, 0.1)',
    },
    {
      title: 'الطلبات المكتملة',
      value: dashboard?.orders.completed || 0,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#4A8E4E',
      bgColor: 'rgba(74, 142, 78, 0.1)',
    },
  ];

  const getStatusColor = (status) => {
    const statusColors = {
      pending_payment: 'warning',
      payment_confirmed: 'info',
      in_review: 'info',
      in_production: 'primary',
      ready_for_delivery: 'secondary',
      out_for_delivery: 'secondary',
      delivered: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending_payment: 'بانتظار الدفع',
      payment_confirmed: 'تم الدفع',
      in_review: 'قيد المراجعة',
      in_production: 'قيد التنفيذ',
      ready_for_delivery: 'جاهز للتوصيل',
      out_for_delivery: 'في الطريق',
      delivered: 'تم التوصيل',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    return statusLabels[status] || status;
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'accent.main',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Noto Naskh Arabic", serif',
            fontWeight: 700,
            color: 'primary.main',
            mb: 1,
          }}
        >
          لوحة تحكم الإدارة
        </Typography>
        <Typography variant="body1" color="text.secondary">
          نظرة شاملة على منصة المخور
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'rgba(184, 149, 106, 0.2)',
                background: stat.bgColor,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(27, 75, 90, 0.15)',
                  borderColor: 'accent.main',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: 'white',
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: stat.color,
                    mb: 0.5,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Orders */}
      <Card
        sx={{
          borderRadius: 3,
          border: '2px solid',
          borderColor: 'rgba(184, 149, 106, 0.2)',
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Noto Naskh Arabic", serif',
              fontWeight: 700,
              color: 'primary.main',
              mb: 3,
            }}
          >
            أحدث الطلبات
          </Typography>

          {dashboard?.recentOrders && dashboard.recentOrders.length > 0 ? (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.paper' }}>
                    <TableCell sx={{ fontWeight: 700 }}>رقم الطلب</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>العميل</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>المحل</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>التصميم</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>المبلغ</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>التاريخ</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>إجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard.recentOrders.map((order) => (
                    <TableRow
                      key={order._id}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(184, 149, 106, 0.05)',
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {order.orderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.customerId?.nameAr || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.shopId?.businessNameAr || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {order.designId?.nameAr || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {order.pricing?.total.toLocaleString()} درهم
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(order.status)}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(order.createdAt).toLocaleDateString('ar-AE')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            sx={{ color: 'accent.main' }}
                            href={`/admin/orders?id=${order._id}`}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                لا توجد طلبات حديثة
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
