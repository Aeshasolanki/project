import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  Edit,
  FilterList,
  Search,
  Download,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { useSnackbar } from 'notistack';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [overrideDialog, setOverrideDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      };
      const response = await adminAPI.getOrders(params);
      setOrders(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (err) {
      console.error('Error fetching orders:', err);
      enqueueSnackbar('حدث خطأ في تحميل الطلبات', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async () => {
    try {
      await adminAPI.overrideOrder(selectedOrder._id, {
        status: newStatus,
        note,
      });
      enqueueSnackbar('تم تحديث حالة الطلب بنجاح', { variant: 'success' });
      setOverrideDialog(false);
      setSelectedOrder(null);
      setNewStatus('');
      setNote('');
      fetchOrders();
    } catch (err) {
      enqueueSnackbar('حدث خطأ في تحديث الطلب', { variant: 'error' });
    }
  };

  const openOverrideDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setOverrideDialog(true);
  };

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

  const statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: 'pending_payment', label: 'بانتظار الدفع' },
    { value: 'payment_confirmed', label: 'تم الدفع' },
    { value: 'in_review', label: 'قيد المراجعة' },
    { value: 'in_production', label: 'قيد التنفيذ' },
    { value: 'ready_for_delivery', label: 'جاهز للتوصيل' },
    { value: 'out_for_delivery', label: 'في الطريق' },
    { value: 'delivered', label: 'تم التوصيل' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Noto Naskh Arabic", serif',
            fontWeight: 700,
            color: 'primary.main',
            mb: 1,
          }}
        >
          إدارة الطلبات
        </Typography>
        <Typography variant="body1" color="text.secondary">
          عرض جميع الطلبات والتحكم بها
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 3, border: '2px solid', borderColor: 'rgba(184, 149, 106, 0.2)' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="بحث برقم الطلب أو اسم العميل..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'accent.main', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="حالة الطلب"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                InputProps={{
                  startAdornment: <FilterList sx={{ color: 'accent.main', mr: 1 }} />,
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                sx={{ height: 56, fontWeight: 600 }}
              >
                تصدير
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card sx={{ borderRadius: 3, border: '2px solid', borderColor: 'rgba(184, 149, 106, 0.2)' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: 'accent.main' }} />
            </Box>
          ) : orders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                لا توجد طلبات
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
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
                    {orders.map((order) => (
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
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {order.customerId?.nameAr || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.customerId?.phone || ''}
                            </Typography>
                          </Box>
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
                            {order.pricing?.total?.toLocaleString()} درهم
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
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="عرض التفاصيل">
                              <IconButton size="small" sx={{ color: 'accent.main' }}>
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="تعديل الحالة">
                              <IconButton
                                size="small"
                                sx={{ color: 'primary.main' }}
                                onClick={() => openOverrideDialog(order)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage="عدد الصفوف:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Override Dialog */}
      <Dialog
        open={overrideDialog}
        onClose={() => setOverrideDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '2px solid',
            borderColor: 'primary.main',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Noto Naskh Arabic", serif',
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'primary.main',
          }}
        >
          تعديل حالة الطلب (Admin Override)
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedOrder && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  رقم الطلب: {selectedOrder.orderNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  الحالة الحالية: {getStatusLabel(selectedOrder.status)}
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              select
              label="الحالة الجديدة"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              sx={{ mb: 2 }}
            >
              {statusOptions.slice(1).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="ملاحظة (اختياري)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="سبب التعديل..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOverrideDialog(false)} sx={{ fontWeight: 600 }}>
            إلغاء
          </Button>
          <Button variant="contained" onClick={handleOverride} sx={{ fontWeight: 600 }}>
            تأكيد التعديل
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrders;
