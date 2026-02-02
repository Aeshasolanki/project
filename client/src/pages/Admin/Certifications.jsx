import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Store,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  Visibility,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { useSnackbar } from 'notistack';

const AdminCertifications = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: null });
  const [notes, setNotes] = useState('');
  const [certificationLevel, setCertificationLevel] = useState('certified');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchPendingShops();
  }, []);

  const fetchPendingShops = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingCertifications();
      setShops(response.data.data);
    } catch (err) {
      console.error('Error fetching certifications:', err);
      enqueueSnackbar('حدث خطأ في تحميل طلبات الاعتماد', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await adminAPI.approveCertification(selectedShop._id, {
        certificationLevel,
        notes,
      });
      enqueueSnackbar('تم اعتماد المحل بنجاح', { variant: 'success' });
      setActionDialog({ open: false, type: null });
      setNotes('');
      fetchPendingShops();
    } catch (err) {
      enqueueSnackbar('حدث خطأ في اعتماد المحل', { variant: 'error' });
    }
  };

  const handleReject = async () => {
    try {
      await adminAPI.rejectCertification(selectedShop._id, {
        reason: notes,
      });
      enqueueSnackbar('تم رفض طلب الاعتماد', { variant: 'info' });
      setActionDialog({ open: false, type: null });
      setNotes('');
      fetchPendingShops();
    } catch (err) {
      enqueueSnackbar('حدث خطأ في رفض الطلب', { variant: 'error' });
    }
  };

  const openApproveDialog = (shop) => {
    setSelectedShop(shop);
    setActionDialog({ open: true, type: 'approve' });
  };

  const openRejectDialog = (shop) => {
    setSelectedShop(shop);
    setActionDialog({ open: true, type: 'reject' });
  };

  const closeDialog = () => {
    setActionDialog({ open: false, type: null });
    setSelectedShop(null);
    setNotes('');
    setCertificationLevel('certified');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: 'accent.main' }} size={60} />
      </Box>
    );
  }

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
          اعتماد المحلات
        </Typography>
        <Typography variant="body1" color="text.secondary">
          مراجعة واعتماد طلبات المحلات الجديدة
        </Typography>
      </Box>

      {/* Pending Count */}
      <Alert
        severity="info"
        icon={<Store />}
        sx={{ mb: 3, borderRadius: 2, border: '2px solid', borderColor: 'info.light' }}
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          لديك {shops.length} طلب اعتماد معلق
        </Typography>
      </Alert>

      {/* Shops Grid */}
      {shops.length === 0 ? (
        <Card sx={{ borderRadius: 3, border: '2px solid', borderColor: 'rgba(184, 149, 106, 0.2)' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Store sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              لا توجد طلبات اعتماد معلقة حالياً
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {shops.map((shop) => (
            <Grid item xs={12} key={shop._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: 'rgba(184, 149, 106, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(27, 75, 90, 0.15)',
                    borderColor: 'accent.main',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Shop Info */}
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Store sx={{ fontSize: 32, color: 'accent.main', mr: 2 }} />
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontFamily: '"Noto Naskh Arabic", serif',
                              fontWeight: 700,
                              color: 'primary.main',
                            }}
                          >
                            {shop.businessNameAr}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {shop.businessNameEn}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Phone sx={{ fontSize: 20, color: 'accent.main', mr: 1 }} />
                            <Typography variant="body2">
                              {shop.userId?.phone || 'N/A'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Email sx={{ fontSize: 20, color: 'accent.main', mr: 1 }} />
                            <Typography variant="body2">
                              {shop.userId?.email || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <LocationOn sx={{ fontSize: 20, color: 'accent.main', mr: 1 }} />
                            <Typography variant="body2">
                              {shop.address?.city || 'N/A'}, {shop.address?.emirate || 'N/A'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <CalendarToday sx={{ fontSize: 20, color: 'accent.main', mr: 1 }} />
                            <Typography variant="body2">
                              {new Date(shop.certificationSubmittedAt).toLocaleDateString('ar-AE')}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {shop.description && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            {shop.description}
                          </Typography>
                        </>
                      )}

                      {shop.specializations && shop.specializations.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            التخصصات:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {shop.specializations.map((spec, index) => (
                              <Chip
                                key={index}
                                label={spec}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(184, 149, 106, 0.1)',
                                  color: 'accent.main',
                                  fontWeight: 600,
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          gap: 2,
                        }}
                      >
                        <Chip
                          label="بانتظار الاعتماد"
                          color="warning"
                          sx={{ fontWeight: 600, width: '100%', py: 2 }}
                        />

                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<CheckCircle />}
                          onClick={() => openApproveDialog(shop)}
                          sx={{
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          اعتماد المحل
                        </Button>

                        <Button
                          variant="outlined"
                          fullWidth
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => openRejectDialog(shop)}
                          sx={{
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderWidth: 2,
                            '&:hover': {
                              borderWidth: 2,
                            },
                          }}
                        >
                          رفض الطلب
                        </Button>

                        {shop.documents && shop.documents.length > 0 && (
                          <Button
                            variant="text"
                            fullWidth
                            startIcon={<Visibility />}
                            sx={{
                              color: 'accent.main',
                              fontWeight: 600,
                            }}
                          >
                            عرض المستندات
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Approve/Reject Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '2px solid',
            borderColor: actionDialog.type === 'approve' ? 'success.main' : 'error.main',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Noto Naskh Arabic", serif',
            fontWeight: 700,
            fontSize: '1.5rem',
            color: actionDialog.type === 'approve' ? 'success.main' : 'error.main',
          }}
        >
          {actionDialog.type === 'approve' ? 'اعتماد المحل' : 'رفض الطلب'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedShop && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedShop.businessNameAr}
                </Typography>
              </Alert>
            )}

            {actionDialog.type === 'approve' && (
              <TextField
                select
                fullWidth
                label="مستوى الاعتماد"
                value={certificationLevel}
                onChange={(e) => setCertificationLevel(e.target.value)}
                sx={{ mb: 2 }}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="certified">معتمد</option>
                <option value="premium">بريميوم</option>
                <option value="specialist">متخصص</option>
              </TextField>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              label={actionDialog.type === 'approve' ? 'ملاحظات (اختياري)' : 'سبب الرفض'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                actionDialog.type === 'approve'
                  ? 'أدخل أي ملاحظات للمحل...'
                  : 'أدخل سبب رفض الطلب...'
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={closeDialog} sx={{ fontWeight: 600 }}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={actionDialog.type === 'approve' ? handleApprove : handleReject}
            color={actionDialog.type === 'approve' ? 'success' : 'error'}
            sx={{ fontWeight: 600 }}
          >
            {actionDialog.type === 'approve' ? 'تأكيد الاعتماد' : 'تأكيد الرفض'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCertifications;
